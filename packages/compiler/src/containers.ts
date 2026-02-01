import type { Block, Diagnostic } from '@glyphjs/types';
import { parseGlyphMarkdown } from '@glyphjs/parser';
import { translateNode } from './ast-to-ir.js';
import type { TranslationContext } from './ast-to-ir.js';
import { createDiagnostic } from './diagnostics.js';

// ─── Container Block Compilation ─────────────────────────────

/**
 * Process container blocks (ui:tabs and ui:steps) by recursively parsing
 * their content fields as Markdown into child Block[] arrays.
 *
 * This function mutates blocks in-place, populating their `children` field
 * and updating data entries with parsed child blocks.
 */
export function compileContainerBlocks(
  blocks: Block[],
  ctx: TranslationContext,
): void {
  for (const block of blocks) {
    if (block.type === 'ui:tabs') {
      compileTabsBlock(block, ctx);
    } else if (block.type === 'ui:steps') {
      compileStepsBlock(block, ctx);
    }
  }
}

// ─── Tabs Compilation ────────────────────────────────────────

function compileTabsBlock(block: Block, ctx: TranslationContext): void {
  const data = block.data as Record<string, unknown>;
  const tabs = data['tabs'];

  if (!Array.isArray(tabs)) return;

  const allChildren: Block[] = [];

  for (const tab of tabs as { label?: string; content?: string }[]) {
    if (typeof tab.content !== 'string') continue;

    const childBlocks = parseContentToBlocks(tab.content, block, ctx);
    allChildren.push(...childBlocks);
  }

  if (allChildren.length > 0) {
    block.children = allChildren;
  }
}

// ─── Steps Compilation ───────────────────────────────────────

function compileStepsBlock(block: Block, ctx: TranslationContext): void {
  const data = block.data as Record<string, unknown>;
  const steps = data['steps'];

  if (!Array.isArray(steps)) return;

  const allChildren: Block[] = [];

  for (const step of steps as { title?: string; status?: string; content?: string }[]) {
    if (typeof step.content !== 'string') continue;

    const childBlocks = parseContentToBlocks(step.content, block, ctx);
    allChildren.push(...childBlocks);
  }

  if (allChildren.length > 0) {
    block.children = allChildren;
  }
}

// ─── Content Parsing Helper ──────────────────────────────────

/**
 * Parse a Markdown content string into Block[] using the compiler pipeline.
 * Emits a warning diagnostic if nested ui: components are found (deferred to v2).
 */
function parseContentToBlocks(
  content: string,
  parentBlock: Block,
  ctx: TranslationContext,
): Block[] {
  const ast = parseGlyphMarkdown(content);
  const blocks: Block[] = [];

  for (const child of ast.children) {
    // Check for nested ui: components — warn and skip
    if (child.type === 'glyphUIBlock') {
      ctx.diagnostics.push(
        createDiagnostic(
          'compiler',
          'warning',
          'NESTED_UI_COMPONENT',
          `Nested ui: component found inside container block "${parentBlock.id}". ` +
            `Nested ui: components inside tabs/steps are not supported in v1 and will be ignored.`,
          child.position,
        ),
      );
      continue;
    }

    const block = translateNode(child, ctx);
    if (block) {
      blocks.push(block);
    }
  }

  return blocks;
}

// ─── Nested UI Detection ─────────────────────────────────────

/**
 * Check if content contains nested ui: blocks by looking for the pattern.
 * This is a quick heuristic check. The actual detection happens during parsing.
 */
export function hasNestedUiBlocks(content: string): boolean {
  return /```ui:/m.test(content);
}

// ─── Validate Container Diagnostics ──────────────────────────

/**
 * Post-process container blocks to ensure data consistency.
 * Called after container compilation is complete.
 */
export function validateContainerBlocks(
  blocks: Block[],
  diagnostics: Diagnostic[],
): void {
  for (const block of blocks) {
    if (block.type === 'ui:tabs') {
      validateTabsData(block, diagnostics);
    } else if (block.type === 'ui:steps') {
      validateStepsData(block, diagnostics);
    }
  }
}

function validateTabsData(block: Block, _diagnostics: Diagnostic[]): void {
  const data = block.data as Record<string, unknown>;
  const tabs = data['tabs'];

  if (!Array.isArray(tabs) || tabs.length === 0) {
    return;
  }

  // Ensure each tab has a label
  for (const tab of tabs as { label?: string }[]) {
    if (!tab.label) {
      _diagnostics.push(
        createDiagnostic(
          'compiler',
          'warning',
          'MISSING_TAB_LABEL',
          `A tab in block "${block.id}" is missing a label.`,
          block.position,
        ),
      );
    }
  }
}

function validateStepsData(block: Block, _diagnostics: Diagnostic[]): void {
  const data = block.data as Record<string, unknown>;
  const steps = data['steps'];

  if (!Array.isArray(steps) || steps.length === 0) {
    return;
  }

  // Ensure each step has a title
  for (const step of steps as { title?: string }[]) {
    if (!step.title) {
      _diagnostics.push(
        createDiagnostic(
          'compiler',
          'warning',
          'MISSING_STEP_TITLE',
          `A step in block "${block.id}" is missing a title.`,
          block.position,
        ),
      );
    }
  }
}
