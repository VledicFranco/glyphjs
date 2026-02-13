import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import { computeArchitectureLayout } from './layout.js';
import type { ArchitectureData, ArchitectureLayout as ArchLayoutResult } from './layout.js';
import { renderArchitecture } from './render.js';
import { useZoomInteraction } from '../graph/useZoomInteraction.js';
import { InteractionOverlay } from '../graph/InteractionOverlay.js';
import { ZoomControls } from '../graph/ZoomControls.js';

export type { ArchitectureData };

// ─── Component ──────────────────────────────────────────────

export function Architecture({
  data,
  container,
  block,
}: GlyphComponentProps<ArchitectureData>): ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<ArchLayoutResult | null>(null);

  // Zoom interaction hook
  const { overlayProps, zoomBehavior, zoomIn, zoomOut, resetZoom } = useZoomInteraction({
    svgRef,
    rootRef,
    interactionMode: data.interactionMode ?? 'modifier-key',
    blockId: block.id,
  });

  // Async ELK layout
  useEffect(() => {
    let cancelled = false;
    computeArchitectureLayout(data).then((result) => {
      if (!cancelled) setLayout(result);
    });
    return () => {
      cancelled = true;
    };
  }, [data]);

  // D3 rendering after layout
  useEffect(() => {
    if (!svgRef.current || !layout) return;
    renderArchitecture(svgRef.current, layout, rootRef, zoomBehavior);
  }, [layout, zoomBehavior]);

  // Count leaf nodes for aria label
  const nodeCount = countLeafNodes(data.children);
  const edgeCount = data.edges.length;
  const ariaLabel = data.title
    ? `${data.title}: architecture diagram with ${nodeCount} nodes and ${edgeCount} connections`
    : `Architecture diagram with ${nodeCount} nodes and ${edgeCount} connections`;

  // Build zone membership for SR table
  const flatNodes = flattenNodes(data.children);

  return (
    <div
      ref={containerRef}
      className="glyph-architecture-container"
      data-glyph-loading={!layout || undefined}
      style={{ position: 'relative' }}
    >
      {!layout && (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--glyph-text-muted, #7a8599)',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
          }}
        >
          Computing layout...
        </div>
      )}
      <svg
        ref={svgRef}
        role="img"
        aria-label={ariaLabel}
        width="100%"
        height="100%"
        style={{
          minHeight: container.tier === 'compact' ? 200 : 300,
          maxHeight: container.tier === 'compact' ? 500 : 700,
          display: layout ? 'block' : 'none',
        }}
      />
      {/* Interaction overlay */}
      {layout && overlayProps && <InteractionOverlay {...overlayProps} />}
      {/* Zoom controls */}
      {layout && data.showZoomControls !== false && (
        <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />
      )}
      {/* SR-only fallback table */}
      <table className="sr-only" aria-label="Architecture data" style={SR_ONLY_STYLE}>
        <caption>Architecture nodes and connections</caption>
        <thead>
          <tr>
            <th scope="col">Node</th>
            <th scope="col">Zone</th>
            <th scope="col">Connections</th>
          </tr>
        </thead>
        <tbody>
          {flatNodes.map((node) => {
            const connections = data.edges
              .filter((e) => e.from === node.id || e.to === node.id)
              .map((e) => {
                const target = e.from === node.id ? e.to : e.from;
                const dir = e.from === node.id ? '->' : '<-';
                return `${dir} ${target}${e.label ? ` (${e.label})` : ''}`;
              })
              .join(', ');
            return (
              <tr key={node.id}>
                <td>{node.label}</td>
                <td>{node.zone ?? ''}</td>
                <td>{connections}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

interface FlatNode {
  id: string;
  label: string;
  zone?: string;
}

function flattenNodes(children: ArchitectureData['children'], zone?: string): FlatNode[] {
  const result: FlatNode[] = [];
  for (const child of children) {
    if (child.type === 'zone' && child.children) {
      result.push(...flattenNodes(child.children, child.label));
    } else {
      result.push({ id: child.id, label: child.label, zone });
    }
  }
  return result;
}

function countLeafNodes(children: ArchitectureData['children']): number {
  let count = 0;
  for (const child of children) {
    if (child.type === 'zone' && child.children) {
      count += countLeafNodes(child.children);
    } else {
      count++;
    }
  }
  return count;
}

/** CSS properties to visually hide content while keeping it accessible to screen readers. */
const SR_ONLY_STYLE: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
