import { useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Block, Diagnostic, GlyphIR, AnimationConfig } from '@glyphjs/types';
import { BlockRenderer } from './BlockRenderer.js';
import { LayoutProvider } from './layout/LayoutProvider.js';
import { DocumentLayout } from './layout/DocumentLayout.js';
import { DashboardLayout } from './layout/DashboardLayout.js';
import { PresentationLayout } from './layout/PresentationLayout.js';
import { AnimationProvider } from './animation/AnimationProvider.js';
import { DiagnosticsOverlay } from './diagnostics/index.js';

// ─── Props ────────────────────────────────────────────────────

interface GlyphDocumentProps {
  ir: GlyphIR;
  className?: string;
  animation?: AnimationConfig;
  diagnostics?: Diagnostic[];
}

// ─── Component ────────────────────────────────────────────────

/**
 * Renders a complete GlyphIR document.
 * Selects the appropriate layout component based on `ir.layout.mode`
 * and renders each block via `BlockRenderer`.
 * Expects to be wrapped in a `RuntimeProvider` (either directly
 * or via the `createGlyphRuntime()` factory).
 */
export function GlyphDocument({ ir, className, animation, diagnostics }: GlyphDocumentProps): ReactNode {
  const { layout, blocks } = ir;

  const renderBlock = useCallback(
    (block: Block, index: number): ReactNode => (
      <BlockRenderer key={block.id} block={block} layout={layout} index={index} />
    ),
    [layout],
  );

  let content: ReactNode;

  switch (layout.mode) {
    case 'dashboard':
      content = (
        <DashboardLayout
          blocks={blocks}
          layout={layout}
          renderBlock={renderBlock}
        />
      );
      break;

    case 'presentation':
      content = (
        <PresentationLayout blocks={blocks} renderBlock={renderBlock} />
      );
      break;

    case 'document':
    default:
      content = (
        <DocumentLayout
          blocks={blocks}
          layout={layout}
          renderBlock={renderBlock}
        />
      );
      break;
  }

  return (
    <AnimationProvider config={animation}>
      <LayoutProvider layout={layout}>
        <div className={className} data-glyph-document={ir.id}>
          {content}
          {diagnostics && diagnostics.length > 0 && (
            <DiagnosticsOverlay diagnostics={diagnostics} />
          )}
        </div>
      </LayoutProvider>
    </AnimationProvider>
  );
}
