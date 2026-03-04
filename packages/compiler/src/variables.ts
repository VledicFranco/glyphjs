import type { Diagnostic, SourcePosition, Block } from '@glyphjs/types';
import type { GlyphUIBlock, MdastContentNode } from '@glyphjs/types';
import { parse as parseYaml } from 'yaml';
import { generateBlockId } from '@glyphjs/ir';
import { createDiagnostic } from './diagnostics.js';

// ─── Variable Context ─────────────────────────────────────────

export interface VarContext {
  /** Scalar string variables (from frontmatter vars: or ui:vars blocks). */
  scalarVars: Map<string, string>;
  /** Block variables (from ui:component=varName). Phase 2. */
  blockVars: Map<string, Block>;
  /** Suppressed block variables (from ui:component=_varName). Phase 2. */
  suppressedBlockVars: Map<string, Block>;
  /** Template parameter lists (from ui:component=_name(p1,p2)). Phase 3. */
  templateParams: Map<string, string[]>;
  /** Keys currently being expanded — used for cycle detection. */
  seenInExpansion: Set<string>;
}

export function createVarContext(seed?: Map<string, string>): VarContext {
  return {
    scalarVars: seed ? new Map(seed) : new Map(),
    blockVars: new Map(),
    suppressedBlockVars: new Map(),
    templateParams: new Map(),
    seenInExpansion: new Set(),
  };
}

// ─── Scalar Expansion ─────────────────────────────────────────

/** Matches {{identifier}} or {{identifier(...)}} patterns. */
const VAR_PATTERN = /\{\{([^{}]+)\}\}/g;

/** Valid JS/var identifier pattern. */
const IDENT_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Expand `{{key}}` placeholders in a text string using `varCtx.scalarVars`.
 *
 * - Known key → replaced with its value (transitively expanded)
 * - Unknown key → UNDEFINED_VARIABLE warning; literal `{{key}}` preserved
 * - Circular reference → CIRCULAR_VARIABLE_REF error; literal preserved
 * - Invocation syntax `{{name(...)}}` → skipped (handled by Phase 3)
 *
 * Mutates `varCtx.seenInExpansion` transiently during recursion;
 * always restores it before returning.
 */
export function expandScalarsInText(
  text: string,
  varCtx: VarContext,
  position: SourcePosition | undefined,
  diagnostics: Diagnostic[],
): string {
  return text.replace(VAR_PATTERN, (_match, key: string) => {
    const trimmedKey = key.trim();

    // Skip invocations — Phase 3 handles {{name("arg1", "arg2")}}
    if (trimmedKey.includes('(')) {
      return _match;
    }

    // Must be a valid identifier
    if (!IDENT_PATTERN.test(trimmedKey)) {
      return _match;
    }

    // Cycle detection: already on the expansion call stack?
    if (varCtx.seenInExpansion.has(trimmedKey)) {
      diagnostics.push(
        createDiagnostic(
          'compiler',
          'error',
          'CIRCULAR_VARIABLE_REF',
          `Circular variable reference detected: "{{${trimmedKey}}}" forms a cycle`,
          position,
        ),
      );
      return _match;
    }

    if (!varCtx.scalarVars.has(trimmedKey)) {
      diagnostics.push(
        createDiagnostic(
          'compiler',
          'warning',
          'UNDEFINED_VARIABLE',
          `Undefined variable "{{${trimmedKey}}}"`,
          position,
        ),
      );
      return _match;
    }

    const rawValue = varCtx.scalarVars.get(trimmedKey) ?? '';

    // Push key onto expansion stack, expand transitively, then pop
    varCtx.seenInExpansion.add(trimmedKey);
    const expanded = expandScalarsInText(rawValue, varCtx, position, diagnostics);
    varCtx.seenInExpansion.delete(trimmedKey);

    return expanded;
  });
}

// ─── Node-Level Expansion ─────────────────────────────────────

/**
 * Expand scalar variables in an AST node, mutating in-place.
 *
 * - GlyphUIBlock: expands rawYaml, then re-parses YAML into parsedData
 * - Regular code blocks (type='code'): skipped
 * - Other MDAST prose nodes: walks text children and expands `.value`
 * - Paragraphs that are standalone block-var candidates: skipped (Phase 2 precedence)
 */
export function expandScalarsInNode(
  node: GlyphUIBlock | MdastContentNode,
  varCtx: VarContext,
  diagnostics: Diagnostic[],
): void {
  if (node.type === 'glyphUIBlock') {
    const glyphBlock = node as GlyphUIBlock;
    const expandedYaml = expandScalarsInText(
      glyphBlock.rawYaml,
      varCtx,
      glyphBlock.position,
      diagnostics,
    );
    if (expandedYaml !== glyphBlock.rawYaml) {
      glyphBlock.rawYaml = expandedYaml;
      try {
        const reparsed: unknown = parseYaml(expandedYaml);
        if (reparsed && typeof reparsed === 'object' && !Array.isArray(reparsed)) {
          glyphBlock.parsedData = reparsed as Record<string, unknown>;
        }
      } catch {
        // Re-parse failed; leave parsedData unchanged
      }
    }
    return;
  }

  const mdastNode = node as MdastContentNode;

  // Skip regular code blocks
  if (mdastNode.type === 'code') {
    return;
  }

  // For standalone block-var candidate paragraphs, selective handling:
  // - Block var defined → skip (compile loop handles the expansion)
  // - Scalar var defined → run scalar expansion (text substitution)
  // - Unknown → skip WITHOUT warning (compile loop will emit UNDEFINED_BLOCK_VAR)
  if (mdastNode.type === 'paragraph') {
    const candidate = isParagraphBlockVarCandidate(mdastNode);
    if (candidate !== null) {
      if (varCtx.blockVars.has(candidate) || varCtx.suppressedBlockVars.has(candidate)) {
        // Block var: skip — compile loop replaces with clone
        return;
      }
      if (!varCtx.scalarVars.has(candidate)) {
        // Unknown var: skip silently — compile loop emits UNDEFINED_BLOCK_VAR
        return;
      }
      // Scalar var only: fall through to normal expansion
    }
  }

  expandMdastTextChildren(mdastNode, varCtx, diagnostics);
}

/**
 * Recursively walk MDAST children and expand text node values in-place.
 */
function expandMdastTextChildren(
  node: MdastContentNode,
  varCtx: VarContext,
  diagnostics: Diagnostic[],
): void {
  if (node.type === 'text' && typeof node.value === 'string') {
    const expanded = expandScalarsInText(node.value, varCtx, node.position, diagnostics);
    (node as { value: string }).value = expanded;
    return;
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child && typeof child === 'object') {
        expandMdastTextChildren(child as MdastContentNode, varCtx, diagnostics);
      }
    }
  }
}

// ─── Vars Block Collection ────────────────────────────────────

/**
 * Extract key-value pairs from a `ui:vars` block's parsed data into `varCtx.scalarVars`.
 *
 * - String values are scalar-expanded against already-defined vars before storing.
 * - Non-string values produce a VARS_BLOCK_INVALID_VALUE warning and are skipped.
 */
export function collectVarsBlock(
  parsedData: Record<string, unknown>,
  varCtx: VarContext,
  position: SourcePosition | undefined,
  diagnostics: Diagnostic[],
): void {
  for (const [key, value] of Object.entries(parsedData)) {
    if (typeof value !== 'string') {
      diagnostics.push(
        createDiagnostic(
          'compiler',
          'warning',
          'VARS_BLOCK_INVALID_VALUE',
          `Variable "${key}" has a non-string value in ui:vars block. Only string values are supported.`,
          position,
        ),
      );
      continue;
    }
    // Expand value against already-defined vars (transitive)
    const expanded = expandScalarsInText(value, varCtx, position, diagnostics);
    varCtx.scalarVars.set(key, expanded);
  }
}

// ─── Phase 2: Block Variable Helpers ─────────────────────────

/**
 * If an MDAST paragraph node consists of exactly one text child matching
 * `{{identifier}}`, returns the identifier string. Otherwise returns null.
 *
 * Used to identify paragraphs that should be treated as block-var expansions
 * rather than scalar-substituted prose.
 */
export function isParagraphBlockVarCandidate(node: MdastContentNode): string | null {
  if (node.type !== 'paragraph') return null;
  if (!Array.isArray(node.children) || node.children.length !== 1) return null;

  const child = node.children[0] as MdastContentNode | undefined;
  if (!child || child.type !== 'text' || typeof child.value !== 'string') return null;

  const match = /^\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}$/.exec(child.value.trim());
  return match ? (match[1] ?? null) : null;
}

/**
 * If a translated IR Block is a paragraph whose sole text content matches
 * `{{identifier}}`, returns the identifier. Otherwise returns null.
 *
 * Used in `expandBlockVars` to detect which blocks need expansion.
 */
export function isBlockVarExpansionParagraph(block: Block): string | null {
  if (block.type !== 'paragraph') return null;

  const data = block.data as { children?: { type: string; value?: string }[] };
  if (!data.children || data.children.length !== 1) return null;

  const child = data.children[0];
  if (!child || child.type !== 'text' || typeof child.value !== 'string') return null;

  const match = /^\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}$/.exec(child.value.trim());
  return match ? (match[1] ?? null) : null;
}

/**
 * Expand block variable references in an IR blocks array, mutating in-place.
 *
 * Paragraphs that contain only `{{varName}}` and whose `varName` resolves
 * to a block variable are replaced with a clone of that block (new ID).
 *
 * - Unknown varName → UNDEFINED_BLOCK_VAR warning; paragraph preserved
 * - Two references → two distinct clones (different IDs)
 */
export function expandBlockVars(
  blocks: Block[],
  varCtx: VarContext,
  documentId: string,
  diagnostics: Diagnostic[],
): void {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block) continue;

    const varName = isBlockVarExpansionParagraph(block);
    if (varName === null) continue;

    // Check block vars first (Phase 2)
    const template =
      varCtx.blockVars.get(varName) ?? varCtx.suppressedBlockVars.get(varName) ?? null;

    if (template === null) {
      // Not a block var — leave as-is (scalar substitution already happened or it's unknown)
      // If it contains a scalar var, the text would have been expanded already.
      // If completely unknown, emit warning only if it's not in scalarVars either.
      if (!varCtx.scalarVars.has(varName)) {
        diagnostics.push(
          createDiagnostic(
            'compiler',
            'warning',
            'UNDEFINED_BLOCK_VAR',
            `Undefined block variable "{{${varName}}}"`,
            block.position,
          ),
        );
      }
      continue;
    }

    // Clone the block with a fresh ID
    const cloneId = generateBlockId(documentId, template.type, `clone:${varName}:${String(i)}`);
    const clone: Block = {
      ...template,
      id: cloneId,
    };
    blocks[i] = clone;
  }
}

// ─── Phase 3: Template Invocation Helpers ────────────────────

/** Matches {{name("arg1", "arg2")}} or {{name('arg1')}} invocations. */
const TEMPLATE_INVOKE_PATTERN = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*)\)\}\}/g;

/** Parse a comma-separated argument list from a template invocation. */
function parseTemplateArgs(argsStr: string): string[] {
  if (argsStr.trim() === '') return [];

  const args: string[] = [];
  // Simple CSV parse that handles quoted strings
  const argRegex = /"([^"]*)"|'([^']*)'|([^,]+)/g;
  let m: RegExpExecArray | null;

  while ((m = argRegex.exec(argsStr)) !== null) {
    const val = m[1] ?? m[2] ?? m[3] ?? '';
    args.push(val.trim());
  }

  return args;
}

/**
 * Expand template invocations `{{name("arg1", "arg2")}}` in an IR blocks array.
 *
 * For each paragraph block that is a template invocation:
 * 1. Look up the template by name in blockVars / suppressedBlockVars
 * 2. Verify arg count matches templateParams
 * 3. Substitute args into the template's rawYaml and re-compile data
 * 4. Replace the paragraph with the resulting block clone
 *
 * This is called AFTER expandBlockVars in the pipeline.
 *
 * @param blocks - IR blocks array to expand in-place
 * @param varCtx - Variable context with templateParams and block vars
 * @param documentId - Document ID for block ID generation
 * @param diagnostics - Diagnostics accumulator
 * @param getTemplateRawYaml - Callback to retrieve raw YAML for a block var name
 */
export function expandTemplateInvocations(
  blocks: Block[],
  varCtx: VarContext,
  documentId: string,
  diagnostics: Diagnostic[],
  getTemplateRawYaml: (varName: string) => string | null,
): void {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block || block.type !== 'paragraph') continue;

    const data = block.data as { children?: { type: string; value?: string }[] };
    if (!data.children || data.children.length !== 1) continue;

    const child = data.children[0];
    if (!child || child.type !== 'text' || typeof child.value !== 'string') continue;

    const text = child.value.trim();

    // Match {{name("arg1", "arg2")}}
    const invokeMatch = /^\{\{([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*)\)\}\}$/.exec(text);
    if (!invokeMatch) continue;

    const templateName = invokeMatch[1] ?? '';
    const argsStr = invokeMatch[2] ?? '';

    // Look up template
    const templateBlock =
      varCtx.blockVars.get(templateName) ?? varCtx.suppressedBlockVars.get(templateName) ?? null;

    if (templateBlock === null) {
      diagnostics.push(
        createDiagnostic(
          'compiler',
          'warning',
          'UNDEFINED_BLOCK_VAR',
          `Undefined template "{{${templateName}(...)}}"`,
          block.position,
        ),
      );
      continue;
    }

    const params = varCtx.templateParams.get(templateName) ?? [];
    const args = parseTemplateArgs(argsStr);

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
      continue;
    }

    // Get raw YAML for this template
    const rawYaml = getTemplateRawYaml(templateName);
    if (rawYaml === null) continue;

    // Build temporary scalar context for this invocation (args override outer vars)
    const invocationCtx = createVarContext(new Map(varCtx.scalarVars));
    for (let p = 0; p < params.length; p++) {
      const param = params[p] ?? '';
      const argVal = args[p] ?? '';
      // Expand the arg value against the outer scalar vars
      const expandedArg = expandScalarsInText(argVal, varCtx, block.position, diagnostics);
      invocationCtx.scalarVars.set(param, expandedArg);
    }

    // Expand the template's YAML with the invocation args
    const expandedYaml = expandScalarsInText(rawYaml, invocationCtx, block.position, diagnostics);

    let cloneData: Record<string, unknown> = templateBlock.data as Record<string, unknown>;
    try {
      const reparsed: unknown = parseYaml(expandedYaml);
      if (reparsed && typeof reparsed === 'object' && !Array.isArray(reparsed)) {
        cloneData = reparsed as Record<string, unknown>;
      }
    } catch {
      // leave cloneData as the template's data
    }

    const cloneId = generateBlockId(
      documentId,
      templateBlock.type,
      `template:${templateName}:${String(i)}`,
    );
    const clone: Block = {
      ...templateBlock,
      id: cloneId,
      data: cloneData,
    };
    blocks[i] = clone;
  }
}

// Suppress unused import warning — used in expandTemplateInvocations
void TEMPLATE_INVOKE_PATTERN;
