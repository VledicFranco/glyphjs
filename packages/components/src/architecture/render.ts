import * as d3 from 'd3';
import type { ArchitectureLayout } from './layout.js';
import { renderIcon } from './icons.js';

// ─── Node Color Palette (Oblivion) ─────────────────────────

const NODE_PALETTE = [
  '#d4a843',
  '#5b8a72',
  '#c75d4a',
  '#6a9bc8',
  '#9b7cb8',
  '#d4805a',
  '#4a8a8a',
  '#c7657a',
  '#8a7a5a',
  '#7a9aa8',
];

// ─── Zone Depth Colors ──────────────────────────────────────

function zoneBackground(depth: number): string {
  const alphas = [0.06, 0.1, 0.14, 0.18];
  const alpha = alphas[Math.min(depth, alphas.length - 1)] ?? 0.18;
  return `rgba(212,168,67,${alpha})`;
}

// ─── Arrow Marker ID ────────────────────────────────────────

const ARROW_MARKER_ID = 'glyph-arch-arrowhead';

// ─── Render Function ────────────────────────────────────────

export function renderArchitecture(svgElement: SVGSVGElement, layout: ArchitectureLayout): void {
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
    .attr('fill', '#7a8599');

  // Root group for zoom/pan
  const root = svg.append('g').attr('class', 'glyph-architecture-root');

  // Zoom behavior
  const zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      root.attr('transform', event.transform.toString());
    });

  svg.call(zoomBehavior);

  // ─── Zones (back to front, outermost first) ─────────────

  const sortedZones = [...layout.zones].sort((a, b) => a.depth - b.depth);
  const zoneGroup = root.append('g').attr('class', 'glyph-architecture-zones');

  for (const zone of sortedZones) {
    const zoneG = zoneGroup.append('g').attr('class', 'glyph-architecture-zone');

    zoneG
      .append('rect')
      .attr('x', zone.x)
      .attr('y', zone.y)
      .attr('width', zone.width)
      .attr('height', zone.height)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', zoneBackground(zone.depth))
      .attr('stroke', 'var(--glyph-accent-muted, #b8a070)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '6,3');

    zoneG
      .append('text')
      .attr('x', zone.x + 10)
      .attr('y', zone.y + 18)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('fill', 'var(--glyph-text-muted, #7a8599)')
      .text(zone.label);
  }

  // ─── Edges (orthogonal polylines) ─────────────────────────

  const edgeGroup = root.append('g').attr('class', 'glyph-architecture-edges');

  for (const edge of layout.edges) {
    if (edge.points.length === 0) continue;

    const edgeG = edgeGroup.append('g').attr('class', 'glyph-architecture-edge');

    const lineGen = d3
      .line<{ x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y);

    const strokeWidth = edge.type === 'data' ? 2.5 : 1.5;
    const dashArray = edge.type === 'async' ? '5,5' : null;

    edgeG
      .append('path')
      .attr('d', lineGen(edge.points) ?? '')
      .attr('fill', 'none')
      .attr('stroke', edge.style?.['stroke'] ?? '#7a8599')
      .attr('stroke-width', edge.style?.['stroke-width'] ?? String(strokeWidth))
      .attr('marker-end', `url(#${ARROW_MARKER_ID})`)
      .attr('stroke-dasharray', dashArray);

    if (edge.label && edge.points.length > 1) {
      // Compute geometric midpoint along the polyline path
      let totalLen = 0;
      const segments: number[] = [];
      for (let i = 1; i < edge.points.length; i++) {
        const prev = edge.points[i - 1];
        const curr = edge.points[i];
        if (prev && curr) {
          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          segments.push(len);
          totalLen += len;
        }
      }
      let remaining = totalLen / 2;
      let labelX = edge.points[0]?.x ?? 0;
      let labelY = edge.points[0]?.y ?? 0;
      for (let i = 0; i < segments.length; i++) {
        const segLen = segments[i] ?? 0;
        const prev = edge.points[i];
        const curr = edge.points[i + 1];
        if (prev && curr) {
          if (remaining <= segLen && segLen > 0) {
            const t = remaining / segLen;
            labelX = prev.x + t * (curr.x - prev.x);
            labelY = prev.y + t * (curr.y - prev.y);
            break;
          }
          remaining -= segLen;
        }
      }
      edgeG
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY - 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .attr('fill', 'var(--glyph-text-muted, #7a8599)')
        .text(edge.label);
    }
  }

  // ─── Nodes ────────────────────────────────────────────────

  const nodeGroup = root.append('g').attr('class', 'glyph-architecture-nodes');

  for (let nodeIdx = 0; nodeIdx < layout.nodes.length; nodeIdx++) {
    const node = layout.nodes[nodeIdx];
    if (!node) continue;
    const nodeG = nodeGroup.append('g').attr('class', 'glyph-architecture-node');

    // Pick color by node index for visual variety
    const color = NODE_PALETTE[nodeIdx % NODE_PALETTE.length] ?? '#d4a843';

    // Node rect
    nodeG
      .append('rect')
      .attr('x', node.x)
      .attr('y', node.y)
      .attr('width', node.width)
      .attr('height', node.height)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', color)
      .attr('stroke', d3.color(color)?.darker(0.5)?.toString() ?? '#333')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85);

    if (node.icon) {
      // Icon in upper portion
      renderIcon(nodeG, node.icon, node.x + node.width / 2, node.y + 20, 18);
      // Label below icon
      nodeG
        .append('text')
        .attr('x', node.x + node.width / 2)
        .attr('y', node.y + node.height - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .attr('fill', '#fff')
        .attr('pointer-events', 'none')
        .text(node.label);
    } else {
      // Label centered
      nodeG
        .append('text')
        .attr('x', node.x + node.width / 2)
        .attr('y', node.y + node.height / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .attr('fill', '#fff')
        .attr('pointer-events', 'none')
        .text(node.label);
    }
  }
}
