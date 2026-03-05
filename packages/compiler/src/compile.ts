import type {
  GlyphIR,
  CompilationResult,
  Diagnostic,
  DocumentMetadata,
  LayoutHints,
  Block,
  Reference,
  MdastContentNode,
  GlyphUIBlock,
} from '@glyphjs/types';
import { parseGlyphMarkdown } from '@glyphjs/parser';
import { generateDocumentId, resolveBlockIdCollisions, generateBlockId } from '@glyphjs/ir';
import { parse as parseYaml } from 'yaml';
import { translateNode } from './ast-to-ir.js';
import type { TranslationContext } from './ast-to-ir.js';
import { createDiagnostic } from './diagnostics.js';
import {
  extractAllInlineReferences,
  resolveReferences,
  validateGlyphIdUniqueness,
} from './references.js';
import {
  compileContainerBlocks,
  validateContainerBlocks,
  compileLayoutBlocks,
} from './containers.js';
import {
  createVarContext,
  collectVarsBlock,
  expandScalarsInNode,
  expandScalarsInText,
  isBlockVarExpansionParagraph,
} from './variables.js';

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

  // 2. Extract frontmatter (including optional vars:)
  const {
    metadata,
    layout,
    frontmatterGlyphId,
    vars: frontmatterVars,
  } = extractFrontmatter(ast.children, diagnostics);

  // 2b. Create variable context seeded from frontmatter vars
  const varCtx = createVarContext(frontmatterVars);

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
    compileOptions: options ?? {},
    varCtx,
  };

  // Store raw YAML for template invocations (Phase 3) keyed by varName
  const templateRawYaml = new Map<string, string>();

  // 5. Walk the AST and translate nodes
  const blocks: Block[] = [];
  for (const child of ast.children) {
    const glyphChild = child as GlyphUIBlock;

    // 5a. Handle ui:vars blocks: collect scalars, emit no block
    if (glyphChild.type === 'glyphUIBlock' && glyphChild.componentType === 'vars') {
      if (glyphChild.parsedData) {
        collectVarsBlock(glyphChild.parsedData, varCtx, glyphChild.position, diagnostics);
      }
      continue;
    }

    // 5b. Store raw YAML before expansion for template invocations (Phase 3)
    if (
      glyphChild.type === 'glyphUIBlock' &&
      glyphChild.templateParams?.length &&
      glyphChild.varName
    ) {
      templateRawYaml.set(glyphChild.varName, glyphChild.rawYaml);
      varCtx.templateParams.set(glyphChild.varName, glyphChild.templateParams);
    }

    // 5c. Expand scalar variables in this node
    expandScalarsInNode(child as GlyphUIBlock, varCtx, diagnostics);

    const block = translateNode(child, ctx);
    if (!block) continue;

    // 5d. Handle variable binding (Phase 2 / Phase 3)
    if (glyphChild.type === 'glyphUIBlock' && glyphChild.varName) {
      const { varName, suppressRender, templateParams: tParams } = glyphChild;

      // Register template params (already done above if applicable)
      if (tParams && tParams.length > 0 && !templateRawYaml.has(varName)) {
        templateRawYaml.set(varName, glyphChild.rawYaml);
        varCtx.templateParams.set(varName, tParams);
      }

      if (suppressRender) {
        // Suppressed blocks: stored only, not emitted
        varCtx.suppressedBlockVars.set(varName, block);
      } else {
        // Regular binding: emit AND store
        varCtx.blockVars.set(varName, block);
        blocks.push(block);
      }
      continue;
    }

    // 5e. Inline block var / template expansion — enforces no-forward-references
    if (block.type === 'paragraph') {
      // Case A: Standalone {{varName}} — simple block var reference
      const candidate = isBlockVarExpansionParagraph(block);
      if (candidate !== null) {
        const template =
          varCtx.blockVars.get(candidate) ?? varCtx.suppressedBlockVars.get(candidate) ?? null;

        if (template !== null) {
          // Replace paragraph with a block clone
          const cloneId = generateBlockId(
            documentId,
            template.type,
            `clone:${candidate}:${String(blocks.length)}`,
          );
          blocks.push({ ...template, id: cloneId });
          continue;
        }

        if (!varCtx.scalarVars.has(candidate)) {
          // Unknown: not a block var, not a scalar var
          diagnostics.push(
            createDiagnostic(
              'compiler',
              'warning',
              'UNDEFINED_BLOCK_VAR',
              `Undefined block variable "{{${candidate}}}"`,
              block.position,
            ),
          );
        }
        // Scalar var case: text was already expanded; push paragraph as-is
      } else {
        // Case B: Check for template invocation {{name("arg1", "arg2")}}
        const paraData = block.data as { children?: { type: string; value?: string }[] };
        if (paraData.children?.length === 1) {
          const paraText = paraData.children[0]?.value?.trim() ?? '';
          const invokeMatch = /^\{\{([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*)\)\}\}$/.exec(paraText);
          if (invokeMatch) {
            const templateName = invokeMatch[1] ?? '';
            const argsStr = invokeMatch[2] ?? '';
            const tBlock =
              varCtx.blockVars.get(templateName) ??
              varCtx.suppressedBlockVars.get(templateName) ??
              null;

            if (tBlock !== null) {
              const params = varCtx.templateParams.get(templateName) ?? [];
              const args = parseInvocationArgs(argsStr);

              if (args.length !== params.length) {
                diagnostics.push(
                  createDiagnostic(
                    'compiler',
                    'error',
                    'TEMPLATE_ARITY_MISMATCH',
                    `Template "${templateName}" expects ${String(params.length)} argument(s), got ${String(args.length)}`,
                    block.position,
                  ),
                );
              } else {
                const rawYaml = templateRawYaml.get(templateName) ?? '';
                // Build invocation context: outer scalars + args
                const invCtx = createVarContext(new Map(varCtx.scalarVars));
                for (let p = 0; p < params.length; p++) {
                  const argVal = args[p] ?? '';
                  const paramName = params[p] ?? '';
                  const expandedArg = expandScalarsInText(
                    argVal,
                    varCtx,
                    block.position,
                    diagnostics,
                  );
                  invCtx.scalarVars.set(paramName, expandedArg);
                }
                const expandedYaml = expandScalarsInText(
                  rawYaml,
                  invCtx,
                  block.position,
                  diagnostics,
                );
                let cloneData: Record<string, unknown> = tBlock.data as Record<string, unknown>;
                try {
                  const reparsed: unknown = parseYaml(expandedYaml);
                  if (reparsed && typeof reparsed === 'object' && !Array.isArray(reparsed)) {
                    cloneData = reparsed as Record<string, unknown>;
                  }
                } catch {
                  // leave cloneData as template's data
                }
                const cloneId = generateBlockId(
                  documentId,
                  tBlock.type,
                  `template:${templateName}:${String(blocks.length)}`,
                );
                blocks.push({ ...tBlock, id: cloneId, data: cloneData });
                continue;
              }
            } else {
              diagnostics.push(
                createDiagnostic(
                  'compiler',
                  'warning',
                  'UNDEFINED_BLOCK_VAR',
                  `Undefined template "{{${templateName}(...)}}"`,
                  block.position,
                ),
              );
            }
          }
        }
      }
    }

    blocks.push(block);
  }

  // Note: block var expansion and template invocation are handled inline above
  // (no post-loop expandBlockVars call) to enforce no-forward-references.

  // 7. Compile container blocks (ui:tabs, ui:steps) — recursively parse content fields
  compileContainerBlocks(blocks, ctx);
  // Also compile suppressed tabs/steps stored as block vars (used inside layout components)
  for (const block of ctx.varCtx.suppressedBlockVars.values()) {
    compileContainerBlocks([block], ctx);
  }

  // 7b. Compile layout blocks (ui:columns, ui:polymer, ui:panel) — resolve child var refs
  compileLayoutBlocks(blocks, ctx);

  // 8. Validate container block data
  validateContainerBlocks(blocks, diagnostics);

  // 9. Infer metadata from content if not in frontmatter
  inferMetadata(metadata, blocks);

  // 10. Resolve block ID collisions
  const blockIds = blocks.map((b) => b.id);
  const resolvedIds = resolveBlockIdCollisions(blockIds);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const resolvedId = resolvedIds[i];
    if (block && resolvedId) {
      block.id = resolvedId;
    }
  }

  // 11. Validate glyph-id uniqueness
  validateGlyphIdUniqueness(ctx.blockIdMap, blocks, diagnostics);

  // 12. Extract inline references from [text](#glyph:block-id) links
  const inlineRefs = extractAllInlineReferences(blocks, documentId);
  references.push(...inlineRefs);

  // 13. Resolve all references (from refs arrays and inline links)
  resolveReferences(references, blocks, diagnostics);

  // 14. Build the IR
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
  vars?: Map<string, string>;
}

function extractFrontmatter(
  children: readonly unknown[],
  diagnostics: Diagnostic[],
): FrontmatterResult {
  const metadata: DocumentMetadata = {};
  let layout: LayoutHints = { mode: 'document', spacing: 'normal' };
  let frontmatterGlyphId: string | undefined;
  let frontmatterVars: Map<string, string> | undefined;

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
          metadata.authors = fm['authors'].filter((a): a is string => typeof a === 'string');
        }
        if (typeof fm['createdAt'] === 'string') {
          metadata.createdAt = fm['createdAt'];
        }
        if (Array.isArray(fm['tags'])) {
          metadata.tags = fm['tags'].filter((t): t is string => typeof t === 'string');
        }

        // Extract vars
        if (fm['vars'] && typeof fm['vars'] === 'object' && !Array.isArray(fm['vars'])) {
          const rawVars = fm['vars'] as Record<string, unknown>;
          const vars = new Map<string, string>();
          for (const [k, v] of Object.entries(rawVars)) {
            // Coerce to string — numbers/booleans from YAML are valid scalar vars
            if (v !== null && v !== undefined) {
              vars.set(k, String(v));
            }
          }
          if (vars.size > 0) {
            frontmatterVars = vars;
          }
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

  return { metadata, layout, frontmatterGlyphId, vars: frontmatterVars };
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

// ─── Template Invocation Arg Parser ─────────────────────────

/**
 * Parse a comma-separated argument list from a template invocation string.
 * Supports single-quoted and double-quoted arguments.
 *
 * @example parseInvocationArgs('"Q1 Guidance","Revenue targets"') → ['Q1 Guidance','Revenue targets']
 */
function parseInvocationArgs(argsStr: string): string[] {
  if (argsStr.trim() === '') return [];
  const args: string[] = [];
  const argRegex = /"([^"]*)"|'([^']*)'|([^,]+)/g;
  let m: RegExpExecArray | null;
  while ((m = argRegex.exec(argsStr)) !== null) {
    const val = m[1] ?? m[2] ?? m[3] ?? '';
    args.push(val.trim());
  }
  return args;
}
