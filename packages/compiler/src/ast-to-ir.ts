import type {
  Block,
  BlockType,
  Diagnostic,
  GlyphUIBlock,
  MdastContentNode,
  SourcePosition,
  Reference,
  RawRef,
  ListData,
  ListItemData,
  InlineNode,
} from '@glyphjs/types';
import { generateBlockId } from '@glyphjs/ir';
import { componentSchemas } from '@glyphjs/schemas';
import { convertPhrasingContent, parseInlineMarkdown } from './inline.js';
import { createSchemaError, createUnknownComponentInfo, createYamlError } from './diagnostics.js';
import type { CompileOptions } from './compile.js';

// ─── Default Source Position ─────────────────────────────────

const DEFAULT_POSITION: SourcePosition = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 },
};

// ─── Translation Context ────────────────────────────────────

export interface TranslationContext {
  documentId: string;
  diagnostics: Diagnostic[];
  references: Reference[];
  blockIdMap: Map<string, string>;
  compileOptions: CompileOptions;
}

// ─── AST Node Type Guards ────────────────────────────────────

function isGlyphUIBlock(node: GlyphUIBlock | MdastContentNode): node is GlyphUIBlock {
  return node.type === 'glyphUIBlock';
}

// ─── Markdown Field Processing ──────────────────────────────

/**
 * Field mapping table: defines which component text fields support markdown.
 * Format: componentType -> array of field paths (supports nested paths like "items[].text")
 */
const MARKDOWN_FIELD_MAP: Record<string, string[]> = {
  callout: ['content', 'title'],
  card: ['cards[].body', 'cards[].subtitle'],
  accordion: ['sections[].content'],
  steps: ['steps[].content'],
  kpi: ['metrics[].label'],
  comparison: ['options[].description', 'features[].values[]'],
  quiz: ['questions[].question', 'questions[].explanation', 'questions[].options[]'],
  infographic: ['sections[].items[].text', 'sections[].items[].description'],
  timeline: ['events[].title', 'events[].description'],
  poll: ['question', 'options[].label'],
  rating: ['label', 'description'],
  ranker: ['items[].label'],
  slider: ['label'],
  matrix: ['rowLabels[]', 'columnLabels[]'],
  annotate: ['annotations[].text'],
  form: ['description'],
};

/**
 * Process component data to parse markdown text fields into InlineNode[].
 * Checks if markdown is enabled (component-level flag OR global option).
 * Recursively processes nested objects and arrays based on field mapping.
 *
 * @param componentType - Component type (without "ui:" prefix)
 * @param data - Component data object
 * @param ctx - Translation context with compiler options and diagnostics
 * @returns Processed data with markdown fields converted to InlineNode[]
 */
function processMarkdownFields(
  componentType: string,
  data: Record<string, unknown>,
  ctx: TranslationContext,
): Record<string, unknown> {
  // Check if markdown is enabled (component-level flag OR global option)
  const markdownEnabled =
    (data.markdown as boolean) === true || ctx.compileOptions.parseComponentMarkdown === true;

  if (!markdownEnabled) {
    return data;
  }

  // Get field paths for this component type
  const fieldPaths = MARKDOWN_FIELD_MAP[componentType];
  if (!fieldPaths || fieldPaths.length === 0) {
    return data;
  }

  // Clone data to avoid mutations
  const result = { ...data };

  // Process each field path
  for (const path of fieldPaths) {
    processFieldPath(result, path, ctx.diagnostics);
  }

  return result;

  /**
   * Recursively process a field path (e.g., "items[].text" or "question")
   */
  function processFieldPath(
    obj: Record<string, unknown>,
    path: string,
    diagnostics: Diagnostic[],
  ): void {
    // Split path into segments (e.g., "items[].text" -> ["items[]", "text"])
    const segments = path.split('.');
    processSegments(obj, segments, diagnostics);
  }

  /**
   * Process path segments recursively
   */
  function processSegments(
    obj: Record<string, unknown>,
    segments: string[],
    diagnostics: Diagnostic[],
  ): void {
    if (segments.length === 0) return;

    const [first, ...rest] = segments;

    // Type guard: first must be defined
    if (!first) return;

    // Check if segment is array notation (e.g., "items[]")
    if (first.endsWith('[]')) {
      const fieldName = first.slice(0, -2);
      const value = obj[fieldName];

      if (Array.isArray(value)) {
        if (rest.length === 0) {
          // This array contains strings to process directly
          // This case handles paths like "options[]" where the array elements are strings
          obj[fieldName] = value.map((item) => {
            if (typeof item === 'string') {
              return parseInlineMarkdown(item, diagnostics);
            }
            return item;
          });
        } else {
          // Array contains objects, process nested fields
          for (const item of value) {
            if (typeof item === 'object' && item !== null) {
              processSegments(item as Record<string, unknown>, rest, diagnostics);
            }
          }
        }
      }
    } else {
      // Regular field
      if (rest.length === 0) {
        // Leaf node - process the string field
        const value = obj[first];
        if (typeof value === 'string') {
          obj[first] = parseInlineMarkdown(value, diagnostics);
        }
      } else {
        // Continue traversing
        const value = obj[first];
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          processSegments(value as Record<string, unknown>, rest, diagnostics);
        }
      }
    }
  }
}

// ─── Main Translation Entry Point ────────────────────────────

/**
 * Translate a single AST child node (either a GlyphUIBlock or a standard
 * MDAST content node) into an IR Block.
 *
 * Returns null for nodes that should be skipped (e.g., yaml frontmatter).
 *
 * @param node - The AST node to translate (GlyphUIBlock or standard MDAST content node).
 * @param ctx - Translation context carrying document ID, accumulated diagnostics, and references.
 * @returns The translated IR Block, or null if the node should be skipped.
 */
export function translateNode(
  node: GlyphUIBlock | MdastContentNode,
  ctx: TranslationContext,
): Block | null {
  if (isGlyphUIBlock(node)) {
    return translateGlyphUIBlock(node, ctx);
  }
  return translateMdastNode(node, ctx);
}

// ─── Glyph UI Block Translation ─────────────────────────────

function translateGlyphUIBlock(node: GlyphUIBlock, ctx: TranslationContext): Block {
  const componentType = node.componentType;
  const blockType: BlockType = `ui:${componentType}`;
  const position: SourcePosition = node.position ?? DEFAULT_POSITION;
  const blockDiagnostics: Diagnostic[] = [];

  // Determine block ID: user-assigned glyph-id or content-addressed
  const blockId = node.glyphId
    ? node.glyphId
    : generateBlockId(ctx.documentId, blockType, node.rawYaml);

  // Track the block ID mapping for reference resolution
  if (node.glyphId) {
    ctx.blockIdMap.set(node.glyphId, blockId);
  }

  // Handle YAML parse errors
  if (node.yamlError) {
    const diag = createYamlError(componentType, node.yamlError, position);
    blockDiagnostics.push(diag);
    ctx.diagnostics.push(diag);
  }

  // Determine block data
  let data: Record<string, unknown> = node.parsedData ?? {};

  // Validate against Zod schema if we have parsed data
  if (node.parsedData) {
    const schema = componentSchemas.get(componentType);
    if (schema) {
      const result = schema.safeParse(node.parsedData);
      if (!result.success) {
        const zodErrors = result.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; ');
        const diag = createSchemaError(componentType, zodErrors, position, result.error.issues);
        blockDiagnostics.push(diag);
        ctx.diagnostics.push(diag);
        // Preserve the raw parsedData even on validation failure
        data = node.parsedData;
      } else {
        data = result.data as Record<string, unknown>;
      }
    } else {
      // Unknown component type — info diagnostic, preserve block as-is
      const diag = createUnknownComponentInfo(componentType, position);
      blockDiagnostics.push(diag);
      ctx.diagnostics.push(diag);
    }
  }

  // Process markdown fields after validation
  data = processMarkdownFields(componentType, data, ctx);

  // Process refs into references
  if (node.refs && node.refs.length > 0) {
    processRefs(node.refs, blockId, ctx);
  }

  const block: Block = {
    id: blockId,
    type: blockType,
    data,
    position,
  };

  if (node.interactive) {
    block.metadata = { interactive: true };
  }

  if (blockDiagnostics.length > 0) {
    block.diagnostics = blockDiagnostics;
  }

  return block;
}

// ─── Reference Processing ────────────────────────────────────

function processRefs(refs: RawRef[], sourceBlockId: string, ctx: TranslationContext): void {
  for (const ref of refs) {
    const reference: Reference = {
      id: generateBlockId(ctx.documentId, 'ref', `${sourceBlockId}->${ref.target}`),
      type: (ref.type as Reference['type']) ?? 'navigates-to',
      sourceBlockId,
      targetBlockId: ref.target,
    };

    if (ref.label) {
      reference.label = ref.label;
    }
    if (ref.sourceAnchor) {
      reference.sourceAnchor = ref.sourceAnchor;
    }
    if (ref.targetAnchor) {
      reference.targetAnchor = ref.targetAnchor;
    }
    if (ref.bidirectional) {
      reference.bidirectional = ref.bidirectional;
    }

    // Mark as unresolved — we resolve later in the compile step
    reference.unresolved = true;

    ctx.references.push(reference);
  }
}

// ─── Standard MDAST Node Translation ─────────────────────────

function translateMdastNode(node: MdastContentNode, ctx: TranslationContext): Block | null {
  const position: SourcePosition = node.position ?? DEFAULT_POSITION;

  switch (node.type) {
    case 'heading':
      return translateHeading(node, position, ctx);
    case 'paragraph':
      return translateParagraph(node, position, ctx);
    case 'list':
      return translateList(node, position, ctx);
    case 'code':
      return translateCode(node, position, ctx);
    case 'blockquote':
      return translateBlockquote(node, position, ctx);
    case 'image':
      return translateImage(node, position, ctx);
    case 'thematicBreak':
      return translateThematicBreak(position, ctx);
    case 'html':
      return translateHtml(node, position, ctx);
    case 'yaml':
      // Frontmatter is handled separately in compile.ts; skip here
      return null;
    default:
      // Unknown MDAST node type — skip silently
      return null;
  }
}

// ─── Individual Node Translators ─────────────────────────────

function translateHeading(
  node: MdastContentNode,
  position: SourcePosition,
  ctx: TranslationContext,
): Block {
  const depth = (node['depth'] as number) ?? 1;
  const children = convertPhrasingContent((node.children ?? []) as unknown[]);
  const content = inlineNodesToText(children);

  return {
    id: generateBlockId(ctx.documentId, 'heading', content),
    type: 'heading',
    data: { depth, children },
    position,
  };
}

function translateParagraph(
  node: MdastContentNode,
  position: SourcePosition,
  ctx: TranslationContext,
): Block {
  const children = convertPhrasingContent((node.children ?? []) as unknown[]);
  const content = inlineNodesToText(children);

  return {
    id: generateBlockId(ctx.documentId, 'paragraph', content),
    type: 'paragraph',
    data: { children },
    position,
  };
}

function translateList(
  node: MdastContentNode,
  position: SourcePosition,
  ctx: TranslationContext,
): Block {
  const ordered = (node['ordered'] as boolean) ?? false;
  const start = ordered ? ((node['start'] as number) ?? 1) : undefined;
  const items = translateListItems((node.children ?? []) as MdastContentNode[]);
  const content = listDataToText({ ordered, start, items });

  const data: ListData = { ordered, items };
  if (start !== undefined) {
    data.start = start;
  }

  return {
    id: generateBlockId(ctx.documentId, 'list', content),
    type: 'list',
    data,
    position,
  };
}

function translateListItems(listItemNodes: MdastContentNode[]): ListItemData[] {
  const items: ListItemData[] = [];

  for (const itemNode of listItemNodes) {
    if (itemNode.type !== 'listItem') continue;

    const itemChildren = (itemNode.children ?? []) as MdastContentNode[];
    let inlineChildren: InlineNode[] = [];
    let subList: ListData | undefined;

    for (const child of itemChildren) {
      if (child.type === 'paragraph') {
        inlineChildren = convertPhrasingContent((child.children ?? []) as unknown[]);
      } else if (child.type === 'list') {
        const subOrdered = (child['ordered'] as boolean) ?? false;
        const subStart = subOrdered ? ((child['start'] as number) ?? 1) : undefined;
        const subItems = translateListItems((child.children ?? []) as MdastContentNode[]);
        subList = { ordered: subOrdered, items: subItems };
        if (subStart !== undefined) {
          subList.start = subStart;
        }
      }
    }

    const item: ListItemData = { children: inlineChildren };
    if (subList) {
      item.subList = subList;
    }
    items.push(item);
  }

  return items;
}

function translateCode(
  node: MdastContentNode,
  position: SourcePosition,
  ctx: TranslationContext,
): Block {
  const value = (node.value as string) ?? '';
  const language = (node['lang'] as string) ?? undefined;
  const meta = (node['meta'] as string) ?? undefined;

  const data: Record<string, unknown> = { value };
  if (language) {
    data['language'] = language;
  }
  if (meta) {
    data['meta'] = meta;
  }

  return {
    id: generateBlockId(ctx.documentId, 'code', value),
    type: 'code',
    data,
    position,
  };
}

function translateBlockquote(
  node: MdastContentNode,
  position: SourcePosition,
  ctx: TranslationContext,
): Block {
  // Blockquote children are typically paragraphs — flatten their inline content
  const allInlineNodes: InlineNode[] = [];
  for (const child of (node.children ?? []) as MdastContentNode[]) {
    if (child.type === 'paragraph') {
      const inlines = convertPhrasingContent((child.children ?? []) as unknown[]);
      allInlineNodes.push(...inlines);
    }
  }
  const content = inlineNodesToText(allInlineNodes);

  return {
    id: generateBlockId(ctx.documentId, 'blockquote', content),
    type: 'blockquote',
    data: { children: allInlineNodes },
    position,
  };
}

function translateImage(
  node: MdastContentNode,
  position: SourcePosition,
  ctx: TranslationContext,
): Block {
  const src = (node['url'] as string) ?? '';
  const alt = (node['alt'] as string) ?? undefined;
  const title = (node['title'] as string) ?? undefined;

  const data: Record<string, unknown> = { src };
  if (alt) {
    data['alt'] = alt;
  }
  if (title) {
    data['title'] = title;
  }

  return {
    id: generateBlockId(ctx.documentId, 'image', src),
    type: 'image',
    data,
    position,
  };
}

function translateThematicBreak(position: SourcePosition, ctx: TranslationContext): Block {
  return {
    id: generateBlockId(ctx.documentId, 'thematic-break', '---'),
    type: 'thematic-break',
    data: {},
    position,
  };
}

function translateHtml(
  node: MdastContentNode,
  position: SourcePosition,
  ctx: TranslationContext,
): Block {
  const value = (node.value as string) ?? '';

  return {
    id: generateBlockId(ctx.documentId, 'html', value),
    type: 'html',
    data: { value },
    position,
  };
}

// ─── Text Extraction Helpers ─────────────────────────────────

/**
 * Extract plain text from InlineNode[] for content-addressing purposes.
 */
function inlineNodesToText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return node.value;
        case 'inlineCode':
          return node.value;
        case 'strong':
        case 'emphasis':
        case 'delete':
          return inlineNodesToText(node.children);
        case 'link':
          return inlineNodesToText(node.children);
        case 'image':
          return node.alt ?? '';
        case 'break':
          return '\n';
        default:
          return '';
      }
    })
    .join('');
}

/**
 * Extract plain text from ListData for content-addressing purposes.
 */
function listDataToText(data: ListData): string {
  return data.items
    .map((item) => {
      let text = inlineNodesToText(item.children);
      if (item.subList) {
        text += '\n' + listDataToText(item.subList);
      }
      return text;
    })
    .join('\n');
}
