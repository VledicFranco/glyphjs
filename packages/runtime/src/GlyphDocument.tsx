import { useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Block, GlyphIR } from '@glyphjs/types';
import { BlockRenderer } from './BlockRenderer.js';
import { LayoutProvider } from './layout/LayoutProvider.js';
import { DocumentLayout } from './layout/DocumentLayout.js';
import { DashboardLayout } from './layout/DashboardLayout.js';
import { PresentationLayout } from './layout/PresentationLayout.js';

// ─── Props ────────────────────────────────────────────────────

interface GlyphDocumentProps {
  ir: GlyphIR;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────

/**
 * Renders a complete GlyphIR document.
 * Selects the appropriate layout component based on `ir.layout.mode`
 * and renders each block via `BlockRenderer`.
 * Expects to be wrapped in a `RuntimeProvider` (either directly
 * or via the `createGlyphRuntime()` factory).
 */
export function GlyphDocument({ ir, className }: GlyphDocumentProps): ReactNode {
  const { layout, blocks } = ir;

  const renderBlock = useCallback(
    (block: Block): ReactNode => (
      <BlockRenderer key={block.id} block={block} layout={layout} />
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
    <LayoutProvider layout={layout}>
      <div className={className} data-glyph-document={ir.id}>
        {content}
      </div>
    </LayoutProvider>
  );
}
