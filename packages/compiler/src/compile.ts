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
import {
  extractAllInlineReferences,
  resolveReferences,
  validateGlyphIdUniqueness,
} from './references.js';
import { compileContainerBlocks, validateContainerBlocks } from './containers.js';

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
 * 1.  Parse the markdown via `parseGlyphMarkdown`
 * 2.  Extract frontmatter metadata and layout hints
 * 3.  Walk the AST and translate each node to IR blocks
 * 4.  Validate ui: blocks against Zod schemas
 * 5.  Compile container blocks (ui:tabs, ui:steps) — recursively parse content
 * 6.  Validate container block data
 * 7.  Generate content-addressed block IDs
 * 8.  Generate the document ID
 * 9.  Resolve block ID collisions
 * 10. Validate glyph-id uniqueness
 * 11. Extract inline references from `[text](#glyph:block-id)` links
 * 12. Resolve all references (from refs arrays and inline links)
 * 13. Infer metadata from content if not in frontmatter
 * 14. Return CompilationResult with IR, diagnostics, and hasErrors flag
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

  // 6. Compile container blocks (ui:tabs, ui:steps) — recursively parse content fields
  compileContainerBlocks(blocks, ctx);

  // 7. Validate container block data
  validateContainerBlocks(blocks, diagnostics);

  // 8. Infer metadata from content if not in frontmatter
  inferMetadata(metadata, blocks);

  // 9. Resolve block ID collisions
  const blockIds = blocks.map((b) => b.id);
  const resolvedIds = resolveBlockIdCollisions(blockIds);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const resolvedId = resolvedIds[i];
    if (block && resolvedId) {
      block.id = resolvedId;
    }
  }

  // 10. Validate glyph-id uniqueness
  validateGlyphIdUniqueness(ctx.blockIdMap, blocks, diagnostics);

  // 11. Extract inline references from [text](#glyph:block-id) links
  const inlineRefs = extractAllInlineReferences(blocks, documentId);
  references.push(...inlineRefs);

  // 12. Resolve all references (from refs arrays and inline links)
  resolveReferences(references, blocks, diagnostics);

  // 13. Build the IR
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

