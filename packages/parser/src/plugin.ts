import type { Root as MdastRoot, Code, Parent } from 'mdast';
import type { Plugin } from 'unified';
import type { GlyphUIBlock, RawRef, SourcePosition } from '@glyphjs/types';
import { parse as parseYaml } from 'yaml';

/** Default position used when a code node has no position info. */
const DEFAULT_POSITION: SourcePosition = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 },
};

/**
 * Remark plugin that transforms `ui:` fenced code blocks into GlyphUIBlock AST nodes.
 *
 * How it works:
 * 1. Walk the MDAST tree looking for `code` nodes whose `lang` starts with "ui:"
 * 2. Parse the YAML payload from the code block's value
 * 3. Extract `glyph-id` and `refs` from the parsed data
 * 4. Replace the code node with a GlyphUIBlock node
 * 5. Standard Markdown nodes pass through unchanged
 */
export const remarkGlyph: Plugin<[], MdastRoot> = function () {
  return (tree: MdastRoot) => {
    transformTree(tree);
  };
};

/**
 * Check whether a value is a valid RawRef object.
 */
function isRawRef(value: unknown): value is RawRef {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj['target'] === 'string';
}

/**
 * Recursively walk the MDAST tree and replace `ui:` code blocks
 * with GlyphUIBlock nodes in-place.
 */
function transformTree(node: MdastRoot | Parent): void {
  if (!('children' in node) || !Array.isArray(node.children)) return;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (!child) continue;

    if (child.type === 'code') {
      const codeNode = child as Code;
      if (codeNode.lang && codeNode.lang.startsWith('ui:')) {
        const glyphBlock = codeNodeToGlyphUIBlock(codeNode);
        // Replace the code node with the GlyphUIBlock node in the children array
        (node.children as unknown[])[i] = glyphBlock;
        continue;
      }
    }

    // Recurse into nodes that have children (e.g., blockquotes, lists, list items)
    if ('children' in child && Array.isArray((child as Parent).children)) {
      transformTree(child as Parent);
    }
  }
}

/**
 * Convert a `code` MDAST node with a `ui:` lang into a GlyphUIBlock AST node.
 * Precondition: `node.lang` is defined and starts with "ui:".
 */
function codeNodeToGlyphUIBlock(node: Code): GlyphUIBlock {
  const lang = node.lang ?? '';
  const componentType = lang.slice(3); // Remove "ui:" prefix
  const rawYaml = node.value;

  let parsedData: Record<string, unknown> | null = null;
  let yamlError: string | undefined;
  let glyphId: string | undefined;
  let refs: RawRef[] | undefined;

  try {
    const parsed: unknown = parseYaml(rawYaml);

    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const data = parsed as Record<string, unknown>;

      // Extract glyph-id if present
      if ('glyph-id' in data && typeof data['glyph-id'] === 'string') {
        glyphId = data['glyph-id'];
        delete data['glyph-id'];
      }

      // Extract refs if present and is an array
      if ('refs' in data && Array.isArray(data['refs'])) {
        const rawRefs = data['refs'] as unknown[];
        const validRefs = rawRefs.filter(isRawRef);
        if (validRefs.length > 0) {
          refs = validRefs;
        }
        delete data['refs'];
      }

      parsedData = data;
    } else {
      // YAML parsed to a non-object (e.g., scalar or array at root)
      parsedData = null;
      yamlError = 'YAML payload must be an object (mapping), got ' + typeof parsed;
    }
  } catch (err: unknown) {
    parsedData = null;
    yamlError = err instanceof Error ? err.message : String(err);
  }

  const position: SourcePosition = node.position ?? DEFAULT_POSITION;

  const block: GlyphUIBlock = {
    type: 'glyphUIBlock',
    componentType,
    rawYaml,
    parsedData,
    position,
  };

  if (yamlError !== undefined) {
    block.yamlError = yamlError;
  }
  if (glyphId !== undefined) {
    block.glyphId = glyphId;
  }
  if (refs !== undefined) {
    block.refs = refs;
  }

  return block;
}
