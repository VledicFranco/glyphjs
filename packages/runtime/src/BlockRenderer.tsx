import type { ComponentType as ReactComponentType, ReactNode } from 'react';
import type {
  Block,
  BlockProps,
  ContainerContext,
  GlyphComponentProps,
  InteractionEvent,
  LayoutHints,
  Reference,
} from '@glyphjs/types';
import { componentSchemas } from '@glyphjs/schemas';
import { useRuntime, useReferences } from './context.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import { FallbackRenderer } from './FallbackRenderer.js';
import { builtInRenderers } from './renderers/index.js';
import { resolveComponentProps } from './plugins/resolve-props.js';
import { useBlockAnimation } from './animation/useBlockAnimation.js';
import { ReferenceIndicator } from './navigation/ReferenceIndicator.js';

// ─── Props ────────────────────────────────────────────────────

interface BlockRendererProps {
  block: Block;
  layout: LayoutHints;
  /** Position index used for stagger animation delay. */
  index?: number;
  /** Container measurement context for responsive adaptation. */
  container: ContainerContext;
}

// ─── Inner dispatch (unwrapped from ErrorBoundary) ────────────

function BlockDispatch({ block, layout, container }: BlockRendererProps): ReactNode {
  const { registry, references, theme, documentId, onNavigate, onInteraction } = useRuntime();
  const { incomingRefs, outgoingRefs } = useReferences(block.id);

  const hasRefs = incomingRefs.length > 0 || outgoingRefs.length > 0;

  // Dev-mode schema validation for ui:* block types
  if (block.type.startsWith('ui:')) {
    const componentName = block.type.slice(3); // strip 'ui:' prefix
    const schema = componentSchemas.get(componentName);
    if (schema) {
      const result = schema.safeParse(block.data);
      if (!result.success) {
        console.warn(
          `[GlyphJS] Schema validation failed for block "${block.id}" (${block.type}):`,
          result.error.issues,
        );
      }
    }
  }

  // Build the interaction handler for interactive blocks.
  // Gating rule: only blocks with metadata.interactive === true AND a config-level
  // onInteraction callback receive the prop. The wrapper injects documentId so
  // components don't need to know which document they belong to.
  const handleInteraction =
    onInteraction && block.metadata?.interactive === true
      ? (event: Omit<InteractionEvent, 'documentId'>) => {
          onInteraction({ ...event, documentId } as InteractionEvent);
        }
      : undefined;

  // Resolve the rendered content for this block
  let content: ReactNode;

  // 1. Check for an override renderer
  const overrideDef = registry.getOverride(block.type);
  if (overrideDef) {
    // Cast from the generic ComponentType (returns unknown) to React's ComponentType
    const Override = overrideDef as ReactComponentType<BlockProps>;
    content = <Override block={block} layout={layout} />;
  } else {
    // 2. Check for a registered ui:* component definition
    const definition = registry.getRenderer(block.type);
    if (definition) {
      const handleNavigate = (ref: Reference) => {
        // Find the target block — caller receives the ref and target
        onNavigate(ref, block);
      };

      // Use resolveComponentProps to assemble the full typed props
      const props = resolveComponentProps(
        block,
        definition,
        references,
        handleNavigate,
        theme,
        layout,
        container,
        handleInteraction,
      );

      // Cast from the generic ComponentType (returns unknown) to React's ComponentType
      const Renderer = definition.render as ReactComponentType<GlyphComponentProps>;
      content = <Renderer {...props} />;
    } else {
      // 3. Built-in standard renderers for standard Markdown block types
      const BuiltIn = builtInRenderers[block.type];
      if (BuiltIn) {
        content = <BuiltIn block={block} layout={layout} />;
      } else {
        // 4. Fallback for unknown/unregistered block types
        content = <FallbackRenderer block={block} />;
      }
    }
  }

  return (
    <div data-glyph-block={block.id}>
      {content}
      {hasRefs && <ReferenceIndicator blockId={block.id} />}
    </div>
  );
}

// ─── BlockRenderer (with ErrorBoundary wrapper) ───────────────

/**
 * Renders a single Block by dispatching to the correct renderer.
 * Each block is wrapped in its own ErrorBoundary so a failure
 * in one block does not crash the rest of the document.
 * When an `index` is provided, the block wrapper applies an
 * entry animation with stagger delay via `useBlockAnimation`.
 */
export function BlockRenderer({
  block,
  layout,
  index = 0,
  container,
}: BlockRendererProps): ReactNode {
  const { onDiagnostic } = useRuntime();
  const { ref, style } = useBlockAnimation(index);

  return (
    <div ref={ref} style={style} data-glyph-block-anim={block.id}>
      <ErrorBoundary blockId={block.id} blockType={block.type} onDiagnostic={onDiagnostic}>
        <BlockDispatch block={block} layout={layout} container={container} />
      </ErrorBoundary>
    </div>
  );
}
