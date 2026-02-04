import type {
  Block,
  GlyphComponentDefinition,
  GlyphComponentProps,
  GlyphThemeContext,
  LayoutHints,
  Reference,
} from '@glyphjs/types';

/**
 * Assembles the full `GlyphComponentProps` for a ui:* component.
 *
 * - Parses `block.data` through the component's Zod schema (via `safeParse`)
 * - Filters outgoing refs: references where `sourceBlockId === block.id`
 *   (plus bidirectional refs where `targetBlockId === block.id`)
 * - Filters incoming refs: references where `targetBlockId === block.id`
 *   (plus bidirectional refs where `sourceBlockId === block.id`)
 * - Wires the `onNavigate` callback
 * - Passes theme context and layout hints
 *
 * @param block - The IR block to resolve props for.
 * @param definition - The registered component definition (provides the Zod schema).
 * @param references - All references in the document (filtered to this block).
 * @param onNavigate - Callback invoked when the component triggers navigation via a reference.
 * @param themeContext - Current theme context passed through to the component.
 * @param layoutHints - Layout hints (e.g., viewport size, container width) for responsive rendering.
 * @returns Fully assembled GlyphComponentProps ready to pass to the component's render function.
 */
export function resolveComponentProps<T = unknown>(
  block: Block,
  definition: GlyphComponentDefinition<T>,
  references: Reference[],
  onNavigate: (ref: Reference) => void,
  themeContext: GlyphThemeContext,
  layoutHints: LayoutHints,
): GlyphComponentProps<T> {
  // Parse block data through the component's schema
  const parseResult = definition.schema.safeParse(block.data);
  const data: T = parseResult.success
    ? (parseResult.data as T)
    : (() => {
        const err = parseResult.error;
        const issues =
          err != null &&
          typeof err === 'object' &&
          'issues' in err &&
          Array.isArray((err as { issues: unknown }).issues)
            ? (err as { issues: { path: string[]; message: string }[] }).issues
                .map(
                  (i: { path: string[]; message: string }) => `${i.path.join('.')}: ${i.message}`,
                )
                .join('; ')
            : 'unknown error';
        console.warn(
          `[GlyphJS] Schema validation failed for block "${block.id}" (${block.type}). ` +
            `Falling back to raw data. Issues: ${issues}`,
        );
        return block.data as T;
      })();

  // Filter references for this block
  const outgoingRefs: Reference[] = [];
  const incomingRefs: Reference[] = [];

  for (const ref of references) {
    // Standard outgoing: source is this block
    if (ref.sourceBlockId === block.id) {
      outgoingRefs.push(ref);
    }

    // Standard incoming: target is this block
    if (ref.targetBlockId === block.id) {
      incomingRefs.push(ref);
    }

    // Bidirectional refs appear in both directions
    if (ref.bidirectional) {
      if (ref.targetBlockId === block.id && ref.sourceBlockId !== block.id) {
        outgoingRefs.push(ref);
      }
      if (ref.sourceBlockId === block.id && ref.targetBlockId !== block.id) {
        incomingRefs.push(ref);
      }
    }
  }

  return {
    data,
    block,
    outgoingRefs,
    incomingRefs,
    onNavigate,
    theme: themeContext,
    layout: layoutHints,
  };
}
