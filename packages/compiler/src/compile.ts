import type {
  GlyphIR,
  CompilationResult,
  Diagnostic,
  DocumentMetadata,
  LayoutHints,
  Block,
  Reference,
  MdastContentNode,
} from '@glyphjs/types';
import { parseGlyphMarkdown } from '@glyphjs/parser';
import { generateDocumentId, resolveBlockIdCollisions } from '@glyphjs/ir';
import { parse as parseYaml } from 'yaml';
import { translateNode } from './ast-to-ir.js';
import type { TranslationContext } from './ast-to-ir.js';
import { createDiagnostic } from './diagnostics.js';

// ─── Public Interface ────────────────────────────────────────

export interface CompileOptions {
  /** Source file path, used for document ID generation. */
  filePath?: string;
  /** Explicit document ID override. */
  documentId?: string;
}

// ─── Main Compile Function ───────────────────────────────────

/**
 * Compile a Markdown string into Glyph IR.
 *
 * Steps:
 * 1. Parse the markdown via `parseGlyphMarkdown`
 * 2. Extract frontmatter metadata and layout hints
 * 3. Walk the AST and translate each node to IR blocks
 * 4. Validate ui: blocks against Zod schemas
 * 5. Generate content-addressed block IDs
 * 6. Generate the document ID
 * 7. Resolve block ID collisions
 * 8. Resolve references
 * 9. Return CompilationResult with IR, diagnostics, and hasErrors flag
 *
 * Uses a collect-all-errors strategy: IR is always produced, even when errors exist.
 */
export function compile(markdown: string, options?: CompileOptions): CompilationResult {
  const diagnostics: Diagnostic[] = [];

  // 1. Parse the markdown into a Glyph AST
  const ast = parseGlyphMarkdown(markdown);

  // 2. Extract frontmatter
  const { metadata, layout, frontmatterGlyphId } = extractFrontmatter(ast.children, diagnostics);

  // 3. Generate document ID
  const documentId =
    options?.documentId ??
    generateDocumentId({
      glyphId: frontmatterGlyphId,
      filePath: options?.filePath,
      content: markdown,
    });

  // Set sourceFile from options if available
  if (options?.filePath && !metadata.sourceFile) {
    metadata.sourceFile = options.filePath;
  }

  // 4. Create translation context
  const references: Reference[] = [];
  const ctx: TranslationContext = {
    documentId,
    diagnostics,
    references,
    blockIdMap: new Map(),
  };

  // 5. Walk the AST and translate nodes
  const blocks: Block[] = [];
  for (const child of ast.children) {
    const block = translateNode(child, ctx);
    if (block) {
      blocks.push(block);
    }
  }

  // 6. Infer metadata from content if not in frontmatter
  inferMetadata(metadata, blocks);

  // 7. Resolve block ID collisions
  const blockIds = blocks.map((b) => b.id);
  const resolvedIds = resolveBlockIdCollisions(blockIds);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const resolvedId = resolvedIds[i];
    if (block && resolvedId) {
      block.id = resolvedId;
    }
  }

  // 8. Resolve references
  resolveReferences(references, blocks, diagnostics);

  // 9. Build the IR
  const ir: GlyphIR = {
    version: '1.0.0',
    id: documentId,
    metadata,
    blocks,
    references,
    layout,
  };

  const hasErrors = diagnostics.some((d) => d.severity === 'error');

  return { ir, diagnostics, hasErrors };
}

// ─── Frontmatter Extraction ─────────────────────────────────

interface FrontmatterResult {
  metadata: DocumentMetadata;
  layout: LayoutHints;
  frontmatterGlyphId?: string;
}

function extractFrontmatter(
  children: readonly unknown[],
  diagnostics: Diagnostic[],
): FrontmatterResult {
  const metadata: DocumentMetadata = {};
  let layout: LayoutHints = { mode: 'document', spacing: 'normal' };
  let frontmatterGlyphId: string | undefined;

  // Look for yaml frontmatter node (always first child if present)
  const firstChild = children[0] as MdastContentNode | undefined;
  if (firstChild && firstChild.type === 'yaml' && typeof firstChild.value === 'string') {
    try {
      const parsed: unknown = parseYaml(firstChild.value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const fm = parsed as Record<string, unknown>;

        // Extract glyph-id
        if (typeof fm['glyph-id'] === 'string') {
          frontmatterGlyphId = fm['glyph-id'];
        }

        // Extract metadata fields
        if (typeof fm['title'] === 'string') {
          metadata.title = fm['title'];
        }
        if (typeof fm['description'] === 'string') {
          metadata.description = fm['description'];
        }
        if (Array.isArray(fm['authors'])) {
          metadata.authors = fm['authors'].filter(
            (a): a is string => typeof a === 'string',
          );
        }
        if (typeof fm['createdAt'] === 'string') {
          metadata.createdAt = fm['createdAt'];
        }
        if (Array.isArray(fm['tags'])) {
          metadata.tags = fm['tags'].filter(
            (t): t is string => typeof t === 'string',
          );
        }

        // Extract layout hints
        if (fm['layout'] && typeof fm['layout'] === 'object' && !Array.isArray(fm['layout'])) {
          const rawLayout = fm['layout'] as Record<string, unknown>;
          layout = {
            mode: isLayoutMode(rawLayout['mode']) ? rawLayout['mode'] : 'document',
            spacing: isLayoutSpacing(rawLayout['spacing']) ? rawLayout['spacing'] : 'normal',
          };
          if (typeof rawLayout['columns'] === 'number') {
            layout.columns = rawLayout['columns'];
          }
          if (typeof rawLayout['maxWidth'] === 'string') {
            layout.maxWidth = rawLayout['maxWidth'];
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      diagnostics.push(
        createDiagnostic(
          'parser',
          'error',
          'FRONTMATTER_PARSE_ERROR',
          `Failed to parse frontmatter YAML: ${message}`,
          firstChild.position,
        ),
      );
    }
  }

  return { metadata, layout, frontmatterGlyphId };
}

function isLayoutMode(value: unknown): value is LayoutHints['mode'] {
  return value === 'document' || value === 'dashboard' || value === 'presentation';
}

function isLayoutSpacing(value: unknown): value is 'compact' | 'normal' | 'relaxed' {
  return value === 'compact' || value === 'normal' || value === 'relaxed';
}

// ─── Metadata Inference ──────────────────────────────────────

/**
 * Infer metadata from content when not provided via frontmatter.
 * - title: from the first h1 heading
 * - description: from the first paragraph
 */
function inferMetadata(metadata: DocumentMetadata, blocks: Block[]): void {
  if (!metadata.title) {
    const firstHeading = blocks.find(
      (b) => b.type === 'heading' && (b.data as Record<string, unknown>)['depth'] === 1,
    );
    if (firstHeading) {
      const data = firstHeading.data as { children?: { type: string; value?: string }[] };
      if (data.children) {
        metadata.title = data.children
          .map((node) => {
            if ('value' in node && typeof node.value === 'string') {
              return node.value;
            }
            return '';
          })
          .join('');
      }
    }
  }

  if (!metadata.description) {
    const firstParagraph = blocks.find((b) => b.type === 'paragraph');
    if (firstParagraph) {
      const data = firstParagraph.data as { children?: { type: string; value?: string }[] };
      if (data.children) {
        metadata.description = data.children
          .map((node) => {
            if ('value' in node && typeof node.value === 'string') {
              return node.value;
            }
            return '';
          })
          .join('');
      }
    }
  }
}

// ─── Reference Resolution ────────────────────────────────────

/**
 * Resolve references by checking if target block IDs exist in the document.
 * Marks unresolved references and adds warning diagnostics.
 */
function resolveReferences(
  references: Reference[],
  blocks: Block[],
  diagnostics: Diagnostic[],
): void {
  const blockIdSet = new Set(blocks.map((b) => b.id));

  for (const ref of references) {
    // Check if the target is a known block ID
    if (blockIdSet.has(ref.targetBlockId)) {
      ref.unresolved = false;
    } else {
      // Target was not found — leave as unresolved and add a warning
      ref.unresolved = true;
      diagnostics.push(
        createDiagnostic(
          'compiler',
          'warning',
          'UNRESOLVED_REFERENCE',
          `Reference target "${ref.targetBlockId}" was not found in the document.`,
        ),
      );
    }
  }
}
