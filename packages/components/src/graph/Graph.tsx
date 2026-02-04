import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { GlyphComponentProps, Reference } from '@glyphjs/types';
import { computeDagreLayout, computeForceLayout } from './layout.js';
import type { LayoutResult } from './layout.js';

// ─── Types ───────────────────────────────────────────────────

interface GraphNodeData {
  id: string;
  label: string;
  type?: string;
  style?: Record<string, string>;
  group?: string;
}

interface GraphEdgeData {
  from: string;
  to: string;
  label?: string;
  type?: string;
  style?: Record<string, string>;
}

export interface GraphData {
  type: 'dag' | 'flowchart' | 'mindmap' | 'force';
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  layout?: 'top-down' | 'left-right' | 'bottom-up' | 'radial' | 'force';
}

type LayoutDirection = 'top-down' | 'left-right' | 'bottom-up' | 'radial' | 'force';

// ─── Group Color Palette ─────────────────────────────────────

const GROUP_PALETTE = [
  '#00d4aa', // cyan-green
  '#b44dff', // purple
  '#22c55e', // green
  '#e040fb', // magenta
  '#00e5ff', // teal
  '#84cc16', // lime
  '#f472b6', // rose
  '#fb923c', // orange
  '#818cf8', // indigo
  '#38bdf8', // sky
];

const DEFAULT_NODE_COLOR = '#00d4aa';

function getGroupColor(group: string | undefined, groupIndex: Map<string, number>): string {
  if (!group) return GROUP_PALETTE[0] ?? DEFAULT_NODE_COLOR;
  let idx = groupIndex.get(group);
  if (idx === undefined) {
    idx = groupIndex.size;
    groupIndex.set(group, idx);
  }
  return GROUP_PALETTE[idx % GROUP_PALETTE.length] ?? DEFAULT_NODE_COLOR;
}

// ─── Layout Resolution ──────────────────────────────────────

const TYPE_LAYOUT_DEFAULTS: Record<string, LayoutDirection> = {
  dag: 'top-down',
  flowchart: 'top-down',
  mindmap: 'left-right',
  force: 'force',
};

function resolveLayout(data: GraphData): LayoutDirection {
  if (data.layout) return data.layout;
  return TYPE_LAYOUT_DEFAULTS[data.type] ?? 'top-down';
}

// ─── Theme Variable Helper ───────────────────────────────────

function getThemeVar(container: Element, varName: string, fallback: string): string {
  return getComputedStyle(container).getPropertyValue(varName).trim() || fallback;
}

// ─── SVG Rendering ──────────────────────────────────────────

const ARROW_MARKER_ID = 'glyph-graph-arrowhead';

function renderGraph(
  svgElement: SVGSVGElement,
  layout: LayoutResult,
  groupIndex: Map<string, number>,
  outgoingRefs: Reference[],
  onNavigate: (ref: Reference) => void,
): void {
  const svg = d3.select(svgElement);
  svg.selectAll('*').remove();

  const width = Math.max(layout.width, 200);
  const height = Math.max(layout.height, 200);

  svg.attr('viewBox', `0 0 ${width} ${height}`);

  // Defs: arrow marker
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

  // Read theme variables from the SVG's parent container for attrs that
  // don't support CSS var() (rx, ry, opacity).
  const container = svgElement.parentElement ?? svgElement;
  const nodeRadius = getThemeVar(container, '--glyph-node-radius', '3');
  const nodeStrokeWidth = getThemeVar(container, '--glyph-node-stroke-width', '1.5');
  const nodeFillOpacity = getThemeVar(container, '--glyph-node-fill-opacity', '0.85');

  // Root group for zoom/pan
  const root = svg.append('g').attr('class', 'glyph-graph-root');

  // Zoom behavior
  const zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      root.attr('transform', event.transform.toString());
    });

  svg.call(zoomBehavior);

  // Build a set of node IDs that have outgoing refs for navigation
  const navigableNodes = new Set<string>();
  const refByAnchor = new Map<string, Reference>();
  for (const ref of outgoingRefs) {
    if (ref.sourceAnchor) {
      navigableNodes.add(ref.sourceAnchor);
      refByAnchor.set(ref.sourceAnchor, ref);
    }
  }

  // ─── Edges ─────────────────────────────────────────────────

  const lineGen = d3
    .line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveBasis);

  const edgeGroup = root.append('g').attr('class', 'glyph-graph-edges');

  for (const edge of layout.edges) {
    const edgeG = edgeGroup.append('g').attr('class', 'glyph-graph-edge');

    edgeG
      .append('path')
      .attr('d', lineGen(edge.points) ?? '')
      .attr('fill', 'none')
      .attr('stroke', edge.style?.['stroke'] ?? 'var(--glyph-edge-color, #6b7a94)')
      .attr('stroke-width', edge.style?.['stroke-width'] ?? nodeStrokeWidth)
      .attr('marker-end', `url(#${ARROW_MARKER_ID})`)
      .attr('stroke-dasharray', edge.type === 'dashed' ? '5,5' : null);

    if (edge.label) {
      const mid = edge.points[Math.floor(edge.points.length / 2)];
      if (mid) {
        edgeG
          .append('text')
          .attr('x', mid.x)
          .attr('y', mid.y - 8)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('fill', 'var(--glyph-edge-color, #6b7a94)')
          .text(edge.label);
      }
    }
  }

  // ─── Nodes ─────────────────────────────────────────────────

  const nodeGroup = root.append('g').attr('class', 'glyph-graph-nodes');

  for (const node of layout.nodes) {
    const nodeG = nodeGroup.append('g').attr('class', 'glyph-graph-node');
    const color = getGroupColor(node.group, groupIndex);
    const isNavigable = navigableNodes.has(node.id);
    const nodeX = node.x - node.width / 2;
    const nodeY = node.y - node.height / 2;

    // Shape: circle for 'entity' type, rounded rect otherwise
    const defaultStroke =
      d3.color(color)?.darker(0.5)?.toString() ?? 'var(--glyph-edge-color, #6b7a94)';

    if (node.type === 'circle') {
      nodeG
        .append('circle')
        .attr('cx', node.x)
        .attr('cy', node.y)
        .attr('r', Math.min(node.width, node.height) / 2)
        .attr('fill', node.style?.['fill'] ?? color)
        .attr('stroke', node.style?.['stroke'] ?? defaultStroke)
        .attr('stroke-width', node.style?.['stroke-width'] ?? nodeStrokeWidth)
        .attr('opacity', nodeFillOpacity);
    } else {
      nodeG
        .append('rect')
        .attr('x', nodeX)
        .attr('y', nodeY)
        .attr('width', node.width)
        .attr('height', node.height)
        .attr('rx', nodeRadius)
        .attr('ry', nodeRadius)
        .attr('fill', node.style?.['fill'] ?? color)
        .attr('stroke', node.style?.['stroke'] ?? defaultStroke)
        .attr('stroke-width', node.style?.['stroke-width'] ?? nodeStrokeWidth)
        .attr('opacity', nodeFillOpacity);
    }

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

    // Navigation cursor + click handler
    if (isNavigable) {
      nodeG.attr('cursor', 'pointer');
      nodeG.on('click', () => {
        const ref = refByAnchor.get(node.id);
        if (ref) onNavigate(ref);
      });
    }
  }
}

// ─── Component ──────────────────────────────────────────────

export function Graph({
  data,
  outgoingRefs,
  onNavigate,
  container,
}: GlyphComponentProps<GraphData>): ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupIndex = useRef(new Map<string, number>());

  const layoutResult = useMemo<LayoutResult>(() => {
    const direction = resolveLayout(data);
    if (direction === 'force') {
      return computeForceLayout(data.nodes, data.edges);
    }
    return computeDagreLayout(data.nodes, data.edges, direction);
  }, [data]);

  useEffect(() => {
    if (!svgRef.current) return;
    renderGraph(svgRef.current, layoutResult, groupIndex.current, outgoingRefs, onNavigate);
  }, [layoutResult, outgoingRefs, onNavigate]);

  // Build an accessible description
  const ariaLabel = `${data.type} graph with ${data.nodes.length} nodes and ${data.edges.length} edges`;

  return (
    <div className="glyph-graph-container">
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
      {/* Hidden data table fallback for screen readers */}
      <table className="sr-only" aria-label="Graph data" style={SR_ONLY_STYLE}>
        <caption>Graph nodes and connections</caption>
        <thead>
          <tr>
            <th scope="col">Node</th>
            <th scope="col">Group</th>
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
                <td>{node.group ?? ''}</td>
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
