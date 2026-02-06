import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import dagre from 'dagre';
import type { GlyphComponentProps } from '@glyphjs/types';
import { useZoomInteraction } from '../graph/useZoomInteraction.js';
import { InteractionOverlay } from '../graph/InteractionOverlay.js';
import { ZoomControls } from '../graph/ZoomControls.js';

// ─── Types ───────────────────────────────────────────────────

type FlowchartNodeType = 'start' | 'end' | 'process' | 'decision';

interface FlowchartNodeData {
  id: string;
  type: FlowchartNodeType;
  label: string;
}

interface FlowchartEdgeData {
  from: string;
  to: string;
  label?: string;
}

export interface FlowchartData {
  title?: string;
  nodes: FlowchartNodeData[];
  edges: FlowchartEdgeData[];
  direction: 'top-down' | 'left-right';
  interactionMode?: 'modifier-key' | 'click-to-activate' | 'always';
}

interface PositionedNode extends FlowchartNodeData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PositionedEdge extends FlowchartEdgeData {
  points: { x: number; y: number }[];
}

// ─── Layout ──────────────────────────────────────────────────

const NODE_WIDTH = 160;
const NODE_HEIGHT = 40;
const DECISION_WIDTH = 170;
const DECISION_HEIGHT = 70;
const NODE_SEP = 50;
const RANK_SEP = 70;
const LAYOUT_PADDING = 40;

function computeLayout(
  nodes: FlowchartNodeData[],
  edges: FlowchartEdgeData[],
  direction: 'top-down' | 'left-right',
): { nodes: PositionedNode[]; edges: PositionedEdge[]; width: number; height: number } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: direction === 'left-right' ? 'LR' : 'TB',
    nodesep: NODE_SEP,
    ranksep: RANK_SEP,
    edgesep: 10,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    const isDecision = node.type === 'decision';
    g.setNode(node.id, {
      label: node.label,
      width: isDecision ? DECISION_WIDTH : NODE_WIDTH,
      height: isDecision ? DECISION_HEIGHT : NODE_HEIGHT,
    });
  }

  for (const edge of edges) {
    g.setEdge(edge.from, edge.to);
  }

  dagre.layout(g);

  const positionedNodes: PositionedNode[] = nodes.map((node) => {
    const d = g.node(node.id) as dagre.Node;
    return { ...node, x: d.x, y: d.y, width: d.width, height: d.height };
  });

  const positionedEdges: PositionedEdge[] = edges.map((edge) => {
    const d = g.edge(edge.from, edge.to) as dagre.GraphEdge;
    return { ...edge, points: d.points };
  });

  let maxX = 0;
  let maxY = 0;
  for (const n of positionedNodes) {
    maxX = Math.max(maxX, n.x + n.width / 2);
    maxY = Math.max(maxY, n.y + n.height / 2);
  }

  return {
    nodes: positionedNodes,
    edges: positionedEdges,
    width: maxX + LAYOUT_PADDING,
    height: maxY + LAYOUT_PADDING,
  };
}

// ─── Theme Helpers ───────────────────────────────────────────

function getThemeVar(container: Element, varName: string, fallback: string): string {
  return getComputedStyle(container).getPropertyValue(varName).trim() || fallback;
}

// ─── Node Shape Renderers ────────────────────────────────────

const ARROW_MARKER_ID = 'glyph-flowchart-arrowhead';

function renderNodeShape(
  nodeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  node: PositionedNode,
  fillOpacity: string,
  strokeWidth: string,
): void {
  const cx = node.x;
  const cy = node.y;
  const w = node.width;
  const h = node.height;

  switch (node.type) {
    case 'start':
    case 'end': {
      // Stadium shape — rounded rectangle with large rx
      nodeG
        .append('rect')
        .attr('x', cx - w / 2)
        .attr('y', cy - h / 2)
        .attr('width', w)
        .attr('height', h)
        .attr('rx', h / 2)
        .attr('ry', h / 2)
        .attr('fill', 'var(--glyph-accent, #00d4aa)')
        .attr('stroke', 'var(--glyph-accent-hover, #33e0be)')
        .attr('stroke-width', strokeWidth)
        .attr('opacity', fillOpacity);
      break;
    }
    case 'decision': {
      // Diamond shape
      const top = `${cx},${cy - h / 2}`;
      const right = `${cx + w / 2},${cy}`;
      const bottom = `${cx},${cy + h / 2}`;
      const left = `${cx - w / 2},${cy}`;
      nodeG
        .append('polygon')
        .attr('points', `${top} ${right} ${bottom} ${left}`)
        .attr('fill', 'var(--glyph-surface-raised, #162038)')
        .attr('stroke', 'var(--glyph-accent, #00d4aa)')
        .attr('stroke-width', strokeWidth)
        .attr('opacity', fillOpacity);
      break;
    }
    case 'process':
    default: {
      // Regular rectangle
      nodeG
        .append('rect')
        .attr('x', cx - w / 2)
        .attr('y', cy - h / 2)
        .attr('width', w)
        .attr('height', h)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', 'var(--glyph-surface-raised, #162038)')
        .attr('stroke', 'var(--glyph-border-strong, #2a3550)')
        .attr('stroke-width', strokeWidth)
        .attr('opacity', fillOpacity);
      break;
    }
  }
}

// ─── SVG Rendering ──────────────────────────────────────────

function renderFlowchart(
  svgElement: SVGSVGElement,
  layout: { nodes: PositionedNode[]; edges: PositionedEdge[]; width: number; height: number },
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>,
): void {
  const svg = d3.select(svgElement);
  svg.selectAll('*').remove();

  const width = Math.max(layout.width, 200);
  const height = Math.max(layout.height, 200);
  svg.attr('viewBox', `0 0 ${width} ${height}`);

  // Arrow marker
  const defs = svg.append('defs');
  defs
    .append('marker')
    .attr('id', ARROW_MARKER_ID)
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 10)
    .attr('refY', 5)
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
    .attr('fill', 'var(--glyph-edge-color, #6b7a94)');

  const container = svgElement.parentElement ?? svgElement;
  const nodeStrokeWidth = getThemeVar(container, '--glyph-node-stroke-width', '1.5');
  const nodeFillOpacity = getThemeVar(container, '--glyph-node-fill-opacity', '0.85');

  const root = svg.append('g').attr('class', 'glyph-flowchart-root');

  // Apply zoom behavior
  svg.call(zoomBehavior);

  // ─── Edges ─────────────────────────────────────────────────

  const lineGen = d3
    .line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveBasis);

  const edgeGroup = root.append('g').attr('class', 'glyph-flowchart-edges');

  for (const edge of layout.edges) {
    const edgeG = edgeGroup.append('g').attr('class', 'glyph-flowchart-edge');

    edgeG
      .append('path')
      .attr('d', lineGen(edge.points) ?? '')
      .attr('fill', 'none')
      .attr('stroke', 'var(--glyph-edge-color, #6b7a94)')
      .attr('stroke-width', nodeStrokeWidth)
      .attr('marker-end', `url(#${ARROW_MARKER_ID})`);

    if (edge.label) {
      const mid = edge.points[Math.floor(edge.points.length / 2)];
      if (mid) {
        edgeG
          .append('text')
          .attr('x', mid.x)
          .attr('y', mid.y - 8)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('fill', 'var(--glyph-text-muted, #6b7a94)')
          .text(edge.label);
      }
    }
  }

  // ─── Nodes ─────────────────────────────────────────────────

  const nodeGroup = root.append('g').attr('class', 'glyph-flowchart-nodes');

  for (const node of layout.nodes) {
    const nodeG = nodeGroup.append('g').attr('class', 'glyph-flowchart-node');

    renderNodeShape(nodeG, node, nodeFillOpacity, nodeStrokeWidth);

    // Label
    nodeG
      .append('text')
      .attr('x', node.x)
      .attr('y', node.y)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('fill', 'var(--glyph-node-label-color, #fff)')
      .attr('pointer-events', 'none')
      .text(node.label);
  }
}

// ─── Component ──────────────────────────────────────────────

export function Flowchart({
  data,
  block,
  container,
}: GlyphComponentProps<FlowchartData>): ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<SVGGElement>(null);

  const layoutResult = useMemo(() => computeLayout(data.nodes, data.edges, data.direction), [data]);

  const { overlayProps, zoomBehavior, zoomIn, zoomOut, resetZoom } = useZoomInteraction({
    svgRef,
    rootRef,
    interactionMode: data.interactionMode ?? 'modifier-key',
    blockId: block.id,
  });

  useEffect(() => {
    if (!svgRef.current) return;
    renderFlowchart(svgRef.current, layoutResult, zoomBehavior);
    // Store reference to the D3-created root group so zoom controls can transform it
    const rootElement = svgRef.current.querySelector('.glyph-flowchart-root') as SVGGElement;
    if (rootElement) {
      rootRef.current = rootElement;
    }
  }, [layoutResult, zoomBehavior]);

  const nodeCount = data.nodes.length;
  const edgeCount = data.edges.length;
  const ariaLabel = data.title
    ? `${data.title}: flowchart with ${nodeCount} nodes and ${edgeCount} edges`
    : `Flowchart with ${nodeCount} nodes and ${edgeCount} edges`;

  return (
    <div className="glyph-flowchart-container">
      {data.title && (
        <div
          style={{
            fontFamily: 'var(--glyph-font-heading, Inter, system-ui, sans-serif)',
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--glyph-heading, #edf0f5)',
            marginBottom: '0.5rem',
          }}
        >
          {data.title}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          role="img"
          aria-label={ariaLabel}
          width="100%"
          height="100%"
          style={{
            minHeight: container.tier === 'compact' ? 200 : 300,
            maxHeight: container.tier === 'compact' ? 500 : 700,
            display: 'block',
          }}
        />
        {overlayProps && <InteractionOverlay {...overlayProps} />}
        <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />
      </div>
      {/* Hidden data table for screen readers */}
      <table className="sr-only" aria-label="Flowchart data" style={SR_ONLY_STYLE}>
        <caption>Flowchart nodes and connections</caption>
        <thead>
          <tr>
            <th scope="col">Node</th>
            <th scope="col">Type</th>
            <th scope="col">Connections</th>
          </tr>
        </thead>
        <tbody>
          {data.nodes.map((node) => {
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
                <td>{node.type}</td>
                <td>{connections}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
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
