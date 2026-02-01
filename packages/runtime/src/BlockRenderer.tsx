import type { ComponentType as ReactComponentType, ReactNode } from 'react';
import type {
  Block,
  BlockProps,
  GlyphComponentProps,
  LayoutHints,
  Reference,
} from '@glyphjs/types';
import { useRuntime, useReferences } from './context.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import { FallbackRenderer } from './FallbackRenderer.js';
import { builtInRenderers } from './renderers/index.js';
import { resolveComponentProps } from './plugins/resolve-props.js';

// ─── Props ────────────────────────────────────────────────────

interface BlockRendererProps {
  block: Block;
  layout: LayoutHints;
}

// ─── Inner dispatch (unwrapped from ErrorBoundary) ────────────

function BlockDispatch({
  block,
  layout,
}: BlockRendererProps): ReactNode {
  const { registry, references, theme, onNavigate } = useRuntime();
  // Keep the hook call for consistent hook ordering
  useReferences(block.id);

  // 1. Check for an override renderer
  const overrideDef = registry.getOverride(block.type);
  if (overrideDef) {
    // Cast from the generic ComponentType (returns unknown) to React's ComponentType
    const Override = overrideDef as ReactComponentType<BlockProps>;
    return <Override block={block} layout={layout} />;
  }

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
    );

    // Cast from the generic ComponentType (returns unknown) to React's ComponentType
    const Renderer = definition.render as ReactComponentType<GlyphComponentProps>;
    return <Renderer {...props} />;
  }

  // 3. Built-in standard renderers for standard Markdown block types
  const BuiltIn = builtInRenderers[block.type];
  if (BuiltIn) {
    return <BuiltIn block={block} layout={layout} />;
  }

  // 4. Fallback for unknown/unregistered block types
  return <FallbackRenderer block={block} />;
}

// ─── BlockRenderer (with ErrorBoundary wrapper) ───────────────

/**
 * Renders a single Block by dispatching to the correct renderer.
 * Each block is wrapped in its own ErrorBoundary so a failure
 * in one block does not crash the rest of the document.
 */
export function BlockRenderer({
  block,
  layout,
}: BlockRendererProps): ReactNode {
  const { onDiagnostic } = useRuntime();

  return (
    <ErrorBoundary
      blockId={block.id}
      blockType={block.type}
      onDiagnostic={onDiagnostic}
    >
      <BlockDispatch block={block} layout={layout} />
    </ErrorBoundary>
  );
}
