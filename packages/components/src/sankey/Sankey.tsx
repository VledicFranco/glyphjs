import type { CSSProperties, ReactElement } from 'react';
import { useMemo } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ───────────────────────────────────────────────────

export interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

export interface SankeyFlow {
  from: string;
  to: string;
  value: number;
  label?: string;
}

export interface SankeyData {
  title?: string;
  nodes: SankeyNode[];
  flows: SankeyFlow[];
  orientation?: 'left-right' | 'top-down';
  unit?: string;
}

interface LayoutNode extends SankeyNode {
  /** Column index (0 = leftmost) in canonical left-right coordinates. */
  layer: number;
  /** Total flow passing through the node (max of inflow / outflow). */
  total: number;
  inTotal: number;
  outTotal: number;
  /** Palette index used for default color cycling. */
  colorIndex: number;
  /** Resolved fill color. */
  color: string;
  /** Geometry — canonical left-right form. X is the flow axis, Y is the cross axis. */
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Ribbon offset accumulators used while wiring flows. */
  inOffset: number;
  outOffset: number;
}

interface LayoutFlow extends SankeyFlow {
  sourceIndex: number;
  targetIndex: number;
  color: string;
  /** Canonical LR endpoints: source attaches at source.x1, target at target.x0. */
  sx: number;
  tx: number;
  sy0: number;
  sy1: number;
  ty0: number;
  ty1: number;
}

export interface SankeyLayout {
  nodes: LayoutNode[];
  flows: LayoutFlow[];
  /** Canonical LR width (flow axis). Rotated to height when rendered top-down. */
  width: number;
  /** Canonical LR height (cross axis). Rotated to width when rendered top-down. */
  height: number;
}

// ─── Layout Constants ───────────────────────────────────────

const AXIS_SIZE = 720; // Length along the flow axis (LR: x-range)
const CROSS_SIZE = 420; // Length perpendicular to the flow axis (LR: y-range)
const NODE_THICKNESS = 14;
const LAYER_GAP_MIN = 12; // Minimum pixel gap between stacked nodes in a column
const MIN_NODE_SIZE = 8; // Minimum cross-axis size for a node
const PADDING = 40;
const CROSSING_ITERATIONS = 6;

const PALETTE: string[] = [
  'var(--glyph-palette-color-1, #00d4aa)',
  'var(--glyph-palette-color-2, #b44dff)',
  'var(--glyph-palette-color-3, #22c55e)',
  'var(--glyph-palette-color-4, #e040fb)',
  'var(--glyph-palette-color-5, #00e5ff)',
  'var(--glyph-palette-color-6, #84cc16)',
  'var(--glyph-palette-color-7, #f472b6)',
  'var(--glyph-palette-color-8, #fb923c)',
  'var(--glyph-palette-color-9, #818cf8)',
  'var(--glyph-palette-color-10, #38bdf8)',
];

// ─── Layout Algorithm ───────────────────────────────────────

/**
 * Assign each node to a column via longest-path-from-source (topological
 * layering). Terminal nodes are pulled to the rightmost column so sinks
 * render in line with one another.
 */
function assignLayers(nodes: SankeyNode[], flows: SankeyFlow[]): Map<string, number> {
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  for (const node of nodes) {
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  }
  for (const flow of flows) {
    const fromList = adjacency.get(flow.from);
    if (!fromList || !adjacency.has(flow.to)) continue;
    fromList.push(flow.to);
    indegree.set(flow.to, (indegree.get(flow.to) ?? 0) + 1);
  }

  const queue: string[] = [];
  const layers = new Map<string, number>();
  const remaining = new Map(indegree);
  for (const node of nodes) {
    layers.set(node.id, 0);
    if ((indegree.get(node.id) ?? 0) === 0) queue.push(node.id);
  }

  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined) break;
    const currentLayer = layers.get(id) ?? 0;
    for (const next of adjacency.get(id) ?? []) {
      const candidate = currentLayer + 1;
      if (candidate > (layers.get(next) ?? 0)) {
        layers.set(next, candidate);
      }
      const deg = (remaining.get(next) ?? 0) - 1;
      remaining.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  // Pull terminal nodes (no outgoing flow) to the rightmost column.
  let maxLayer = 0;
  for (const layer of layers.values()) if (layer > maxLayer) maxLayer = layer;
  for (const node of nodes) {
    if ((adjacency.get(node.id)?.length ?? 0) === 0) {
      layers.set(node.id, maxLayer);
    }
  }

  return layers;
}

/**
 * Greedy barycenter sweep — for each layer > 0, reorder nodes so the average
 * index of connected neighbors in the previous layer is monotonic. Repeats
 * a fixed number of iterations; convergence is not required for correctness,
 * only for fewer ribbon crossings.
 */
function minimizeCrossings(
  layerBuckets: string[][],
  flows: SankeyFlow[],
  layerOf: Map<string, number>,
): void {
  const neighborsOf = (id: string): number[] => {
    const layer = layerOf.get(id) ?? 0;
    const positions: number[] = [];
    for (const flow of flows) {
      if (flow.from === id) {
        const tLayer = layerOf.get(flow.to);
        if (tLayer === layer + 1) {
          const idx = layerBuckets[tLayer]?.indexOf(flow.to) ?? -1;
          if (idx >= 0) positions.push(idx);
        }
      }
      if (flow.to === id) {
        const sLayer = layerOf.get(flow.from);
        if (sLayer === layer - 1) {
          const idx = layerBuckets[sLayer]?.indexOf(flow.from) ?? -1;
          if (idx >= 0) positions.push(idx);
        }
      }
    }
    return positions;
  };

  for (let iter = 0; iter < CROSSING_ITERATIONS; iter++) {
    for (let layer = 1; layer < layerBuckets.length; layer++) {
      const bucket = layerBuckets[layer];
      if (!bucket || bucket.length < 2) continue;
      const scored = bucket.map((id, i) => {
        const ns = neighborsOf(id);
        const avg = ns.length === 0 ? i : ns.reduce((a, b) => a + b, 0) / ns.length;
        return { id, avg, original: i };
      });
      scored.sort((a, b) => (a.avg === b.avg ? a.original - b.original : a.avg - b.avg));
      layerBuckets[layer] = scored.map((x) => x.id);
    }
  }
}

function resolveNodeColor(node: SankeyNode, colorIndex: number): string {
  if (node.color) return node.color;
  return PALETTE[colorIndex % PALETTE.length] ?? PALETTE[0] ?? '#00d4aa';
}

export function computeSankeyLayout(nodes: SankeyNode[], flows: SankeyFlow[]): SankeyLayout {
  const layerOf = assignLayers(nodes, flows);

  const maxLayer = Math.max(0, ...Array.from(layerOf.values()));
  const layerBuckets: string[][] = [];
  for (let i = 0; i <= maxLayer; i++) layerBuckets.push([]);
  for (const node of nodes) {
    const bucket = layerBuckets[layerOf.get(node.id) ?? 0];
    if (bucket) bucket.push(node.id);
  }

  minimizeCrossings(layerBuckets, flows, layerOf);

  // Aggregate flow totals per node.
  const inflow = new Map<string, number>();
  const outflow = new Map<string, number>();
  for (const node of nodes) {
    inflow.set(node.id, 0);
    outflow.set(node.id, 0);
  }
  for (const flow of flows) {
    outflow.set(flow.from, (outflow.get(flow.from) ?? 0) + flow.value);
    inflow.set(flow.to, (inflow.get(flow.to) ?? 0) + flow.value);
  }

  // Scale the cross axis so the heaviest column fits in the available space.
  let heaviestColumnTotal = 0;
  for (let layer = 0; layer <= maxLayer; layer++) {
    let total = 0;
    for (const id of layerBuckets[layer] ?? []) {
      total += Math.max(inflow.get(id) ?? 0, outflow.get(id) ?? 0);
    }
    if (total > heaviestColumnTotal) heaviestColumnTotal = total;
  }
  const heaviestColumnCount = Math.max(
    ...layerBuckets.map((b) => b.length).filter((n) => n > 0),
    1,
  );
  const availableCross =
    CROSS_SIZE - Math.max(0, heaviestColumnCount - 1) * LAYER_GAP_MIN - PADDING * 2;
  const crossScale =
    heaviestColumnTotal > 0 ? Math.max(availableCross, MIN_NODE_SIZE) / heaviestColumnTotal : 1;

  const axisStep =
    maxLayer === 0 ? 0 : (AXIS_SIZE - PADDING * 2 - NODE_THICKNESS) / Math.max(maxLayer, 1);

  // Stable palette index per node in declaration order.
  const paletteByNode = new Map<string, number>();
  {
    let i = 0;
    for (const node of nodes) {
      paletteByNode.set(node.id, i);
      i += 1;
    }
  }

  const layoutNodes: LayoutNode[] = [];
  const nodeByIndex = new Map<string, number>();

  for (let layer = 0; layer <= maxLayer; layer++) {
    const bucket = layerBuckets[layer] ?? [];
    const sizes = bucket.map((id) =>
      Math.max(Math.max(inflow.get(id) ?? 0, outflow.get(id) ?? 0) * crossScale, MIN_NODE_SIZE),
    );
    const totalSize = sizes.reduce((a, b) => a + b, 0);
    const availableSpace = CROSS_SIZE - PADDING * 2;
    const gapCount = Math.max(bucket.length - 1, 0);
    const gap = gapCount > 0 ? Math.max((availableSpace - totalSize) / gapCount, LAYER_GAP_MIN) : 0;
    const totalUsed = totalSize + gap * gapCount;
    let cursor = PADDING + Math.max(0, (availableSpace - totalUsed) / 2);

    for (let i = 0; i < bucket.length; i++) {
      const id = bucket[i];
      if (id === undefined) continue;
      const node = nodes.find((n) => n.id === id);
      if (!node) continue;
      const size = sizes[i] ?? MIN_NODE_SIZE;
      const x0 = PADDING + layer * axisStep;
      const x1 = x0 + NODE_THICKNESS;
      const y0 = cursor;
      const y1 = cursor + size;
      const colorIndex = paletteByNode.get(id) ?? 0;
      const total = Math.max(inflow.get(id) ?? 0, outflow.get(id) ?? 0);

      nodeByIndex.set(id, layoutNodes.length);
      layoutNodes.push({
        ...node,
        layer,
        total,
        inTotal: inflow.get(id) ?? 0,
        outTotal: outflow.get(id) ?? 0,
        colorIndex,
        color: resolveNodeColor(node, colorIndex),
        x0,
        x1,
        y0,
        y1,
        inOffset: 0,
        outOffset: 0,
      });
      cursor = y1 + gap;
    }
  }

  // Wire ribbons — each flow occupies a strip of the source node's right
  // edge and the target node's left edge, allocated in flow declaration order.
  const layoutFlows: LayoutFlow[] = [];
  for (const flow of flows) {
    const sourceIndex = nodeByIndex.get(flow.from);
    const targetIndex = nodeByIndex.get(flow.to);
    if (sourceIndex === undefined || targetIndex === undefined) continue;
    const source = layoutNodes[sourceIndex];
    const target = layoutNodes[targetIndex];
    if (!source || !target) continue;

    const width = Math.max(flow.value * crossScale, 1);
    const sy0 = source.y0 + source.outOffset;
    const sy1 = sy0 + width;
    source.outOffset += width;

    const ty0 = target.y0 + target.inOffset;
    const ty1 = ty0 + width;
    target.inOffset += width;

    layoutFlows.push({
      ...flow,
      sourceIndex,
      targetIndex,
      color: source.color,
      sx: source.x1,
      tx: target.x0,
      sy0,
      sy1,
      ty0,
      ty1,
    });
  }

  return {
    nodes: layoutNodes,
    flows: layoutFlows,
    width: AXIS_SIZE,
    height: CROSS_SIZE,
  };
}

// ─── Ribbon Path ────────────────────────────────────────────

type PointTransform = (x: number, y: number) => { x: number; y: number };

function buildRibbonPath(flow: LayoutFlow, transform: PointTransform): string {
  const { sx, tx, sy0, sy1, ty0, ty1 } = flow;
  const mid = (sx + tx) / 2;

  const p1 = transform(sx, sy0);
  const p2 = transform(mid, sy0);
  const p3 = transform(mid, ty0);
  const p4 = transform(tx, ty0);
  const p5 = transform(tx, ty1);
  const p6 = transform(mid, ty1);
  const p7 = transform(mid, sy1);
  const p8 = transform(sx, sy1);

  return [
    `M ${p1.x} ${p1.y}`,
    `C ${p2.x} ${p2.y}, ${p3.x} ${p3.y}, ${p4.x} ${p4.y}`,
    `L ${p5.x} ${p5.y}`,
    `C ${p6.x} ${p6.y}, ${p7.x} ${p7.y}, ${p8.x} ${p8.y}`,
    'Z',
  ].join(' ');
}

// ─── Helpers ────────────────────────────────────────────────

function maxLayerOf(nodes: LayoutNode[]): number {
  let m = 0;
  for (const n of nodes) if (n.layer > m) m = n.layer;
  return m;
}

function getLabel(nodes: SankeyNode[], id: string): string {
  return nodes.find((n) => n.id === id)?.label ?? id;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toLocaleString();
}

// ─── Component ──────────────────────────────────────────────

export function Sankey({ data, block }: GlyphComponentProps<SankeyData>): ReactElement {
  const orientation: 'left-right' | 'top-down' = data.orientation ?? 'left-right';
  const layout = useMemo(
    () => computeSankeyLayout(data.nodes, data.flows),
    [data.nodes, data.flows],
  );

  const nodeCount = data.nodes.length;
  const flowCount = data.flows.length;
  const titlePart = data.title ? `${data.title}: ` : '';
  const ariaLabel = `${titlePart}Sankey diagram with ${nodeCount} nodes and ${flowCount} flows`;

  // Top-down = swap x and y at render time. This keeps the layout algorithm
  // entirely in left-right coordinates and avoids fragile in-place rewrites.
  const transform: PointTransform =
    orientation === 'top-down' ? (x, y) => ({ x: y, y: x }) : (x, y) => ({ x, y });

  const svgWidth = orientation === 'top-down' ? layout.height : layout.width;
  const svgHeight = orientation === 'top-down' ? layout.width : layout.height;

  const titleId = data.title ? `glyph-sankey-title-${block.id}` : undefined;
  const maxLayer = maxLayerOf(layout.nodes);

  return (
    <div
      className="glyph-sankey-container"
      style={{
        fontFamily: 'var(--glyph-font-body, Inter, system-ui, sans-serif)',
        color: 'var(--glyph-text, #1a2035)',
        padding: 'var(--glyph-spacing-md, 1rem)',
      }}
    >
      {data.title && (
        <div
          id={titleId}
          style={{
            fontFamily: 'var(--glyph-font-heading, Inter, system-ui, sans-serif)',
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--glyph-heading, #1a2035)',
            marginBottom: '0.5rem',
          }}
        >
          {data.title}
        </div>
      )}
      <svg
        role="img"
        aria-label={ariaLabel}
        aria-labelledby={titleId}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width="100%"
        style={{ display: 'block', maxHeight: 600 }}
      >
        {/* Ribbons first so nodes overlay them. */}
        <g className="glyph-sankey-ribbons">
          {layout.flows.map((flow, i) => {
            const path = buildRibbonPath(flow, transform);
            const flowAria = flow.label
              ? `${flow.label}: ${flow.from} to ${flow.to}, ${flow.value}`
              : `${flow.from} to ${flow.to}, ${flow.value}`;
            return (
              <path
                key={`flow-${String(i)}`}
                d={path}
                fill={flow.color}
                fillOpacity={0.55}
                stroke={flow.color}
                strokeOpacity={0.65}
                strokeWidth={0.5}
              >
                <title>{flowAria}</title>
              </path>
            );
          })}
        </g>

        {/* Nodes. */}
        <g className="glyph-sankey-nodes">
          {layout.nodes.map((node, i) => {
            const topLeft = transform(node.x0, node.y0);
            const bottomRight = transform(node.x1, node.y1);
            const rx = Math.min(topLeft.x, bottomRight.x);
            const ry = Math.min(topLeft.y, bottomRight.y);
            const w = Math.abs(bottomRight.x - topLeft.x);
            const h = Math.abs(bottomRight.y - topLeft.y);

            const isLR = orientation === 'left-right';
            const isLast = node.layer === maxLayer;
            const labelX = isLR ? (isLast ? rx - 6 : rx + w + 6) : rx + w / 2;
            const labelY = isLR ? ry + h / 2 : isLast ? ry - 6 : ry + h + 14;
            const anchor = isLR ? (isLast ? 'end' : 'start') : 'middle';
            const baseline = isLR ? 'middle' : isLast ? 'auto' : 'hanging';

            const valueStr =
              data.unit && node.total > 0
                ? `${formatNumber(node.total)} ${data.unit}`
                : node.total > 0
                  ? formatNumber(node.total)
                  : '';

            return (
              <g key={`node-${String(i)}-${node.id}`}>
                <rect
                  x={rx}
                  y={ry}
                  width={w}
                  height={h}
                  fill={node.color}
                  stroke="var(--glyph-border, #d0d8e4)"
                  strokeWidth={0.75}
                  rx={2}
                  ry={2}
                >
                  <title>
                    {node.label}
                    {valueStr ? ` (${valueStr})` : ''}
                  </title>
                </rect>
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={anchor}
                  fontSize={12}
                  fontFamily="Inter, system-ui, sans-serif"
                  fill="var(--glyph-text, #1a2035)"
                  dominantBaseline={baseline}
                  stroke="var(--glyph-bg, #f4f6fa)"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  style={{ paintOrder: 'stroke' }}
                >
                  {node.label}
                </text>
                {valueStr && (
                  <text
                    x={labelX}
                    y={labelY + 14}
                    textAnchor={anchor}
                    fontSize={10}
                    fontFamily="Inter, system-ui, sans-serif"
                    fill="var(--glyph-text-muted, #6b7a94)"
                    dominantBaseline={baseline}
                    stroke="var(--glyph-bg, #f4f6fa)"
                    strokeWidth={3}
                    strokeLinejoin="round"
                    style={{ paintOrder: 'stroke' }}
                  >
                    {valueStr}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hidden accessible data table — screen readers get the full flow list. */}
      <table className="sr-only" aria-label="Sankey flows" style={SR_ONLY_STYLE}>
        <caption>
          Sankey diagram flows
          {data.title ? `: ${data.title}` : ''}
        </caption>
        <thead>
          <tr>
            <th scope="col">From</th>
            <th scope="col">To</th>
            <th scope="col">Value{data.unit ? ` (${data.unit})` : ''}</th>
            <th scope="col">Label</th>
          </tr>
        </thead>
        <tbody>
          {data.flows.map((flow, i) => (
            <tr key={`sr-flow-${String(i)}`}>
              <td>{getLabel(data.nodes, flow.from)}</td>
              <td>{getLabel(data.nodes, flow.to)}</td>
              <td>{formatNumber(flow.value)}</td>
              <td>{flow.label ?? ''}</td>
            </tr>
          ))}
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
