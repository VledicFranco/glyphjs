import type { CSSProperties, ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ───────────────────────────────────────────────────

export type DecisionTreeNodeType = 'question' | 'outcome';
export type DecisionTreeSentiment = 'positive' | 'neutral' | 'negative';
export type DecisionTreeOrientation = 'left-right' | 'top-down';

export interface DecisionTreeNode {
  id: string;
  type?: DecisionTreeNodeType;
  label: string;
  sentiment?: DecisionTreeSentiment;
  confidence?: number;
}

export interface DecisionTreeEdge {
  from: string;
  to: string;
  condition?: string;
}

export interface DecisionTreeData {
  title?: string;
  nodes: DecisionTreeNode[];
  edges: DecisionTreeEdge[];
  orientation?: DecisionTreeOrientation;
}

// ─── Layout Constants ────────────────────────────────────────

const NODE_WIDTH = 160;
const NODE_HEIGHT = 52;
const HGAP = 48;
const VGAP = 70;
const SVG_PADDING = 36;
const FONT_SIZE = 12;
const FONT_FAMILY = 'Inter, system-ui, sans-serif';
const BADGE_FONT_SIZE = 10;
const CONDITION_FONT_SIZE = 11;

// ─── Positioned Node ─────────────────────────────────────────

interface PositionedNode {
  id: string;
  label: string;
  type: DecisionTreeNodeType;
  sentiment?: DecisionTreeSentiment;
  confidence?: number;
  depth: number;
  x: number; // centre x
  y: number; // centre y
  parentId?: string;
}

interface LayoutResult {
  nodes: Map<string, PositionedNode>;
  width: number;
  height: number;
  rootId: string;
}

// ─── Tree Building ───────────────────────────────────────────

interface TreeRef {
  node: DecisionTreeNode;
  children: TreeRef[];
  parentId?: string;
  depth: number;
}

function buildTree(data: DecisionTreeData): TreeRef | null {
  const byId = new Map<string, DecisionTreeNode>();
  for (const n of data.nodes) byId.set(n.id, n);

  const childrenByParent = new Map<string, string[]>();
  const hasParent = new Set<string>();
  for (const e of data.edges) {
    if (!byId.has(e.from) || !byId.has(e.to)) continue;
    const existing = childrenByParent.get(e.from);
    if (existing) {
      existing.push(e.to);
    } else {
      childrenByParent.set(e.from, [e.to]);
    }
    hasParent.add(e.to);
  }

  // Find root: a node with no parent
  let rootId: string | undefined;
  for (const n of data.nodes) {
    if (!hasParent.has(n.id)) {
      rootId = n.id;
      break;
    }
  }
  if (!rootId) return null;

  function build(id: string, parentId: string | undefined, depth: number): TreeRef | null {
    const node = byId.get(id);
    if (!node) return null;
    const childIds = childrenByParent.get(id) ?? [];
    const children: TreeRef[] = [];
    for (const cid of childIds) {
      const child = build(cid, id, depth + 1);
      if (child) children.push(child);
    }
    return { node, children, parentId, depth };
  }

  return build(rootId, undefined, 0);
}

// ─── Layout Algorithm ────────────────────────────────────────

/**
 * Bottom-up naive tree layout, orientation-aware.
 *
 * Two axes:
 *   - main axis  = depth direction (y for top-down, x for left-right)
 *   - cross axis = sibling distribution (x for top-down, y for left-right)
 *
 * Per orientation:
 *   - top-down:   cross slot = NODE_WIDTH,  cross gap = HGAP, main stride = NODE_HEIGHT + VGAP
 *   - left-right: cross slot = NODE_HEIGHT, cross gap = VGAP, main stride = NODE_WIDTH  + HGAP
 *
 * Bottom-up:
 *   - For each subtree, compute its cross-axis extent as max(self slot,
 *     sum of child extents + gaps).
 *   - Place each node centred (cross axis) over its children, advancing
 *     along the main axis once per depth.
 *
 * This is a simple "distribute children evenly under parent" algorithm
 * adequate for trees up to ~50 nodes, as specified in RFC-031 §6.
 */

interface AxisMetrics {
  crossSlot: number; // node size along the cross axis (sibling distribution)
  crossGap: number; // gap between sibling subtrees
  mainStride: number; // distance between consecutive depth levels (centre-to-centre)
}

function axisMetrics(orientation: DecisionTreeOrientation): AxisMetrics {
  if (orientation === 'left-right') {
    // Cross axis is vertical, main axis is horizontal.
    return { crossSlot: NODE_HEIGHT, crossGap: VGAP, mainStride: NODE_WIDTH + HGAP };
  }
  // top-down: cross axis is horizontal, main axis is vertical.
  return { crossSlot: NODE_WIDTH, crossGap: HGAP, mainStride: NODE_HEIGHT + VGAP };
}

interface SubtreeInfo {
  crossExtent: number; // size along the cross axis required by this subtree
}

function measureSubtree(tree: TreeRef, m: AxisMetrics): SubtreeInfo {
  if (tree.children.length === 0) {
    return { crossExtent: m.crossSlot };
  }
  let total = 0;
  for (let i = 0; i < tree.children.length; i++) {
    const child = tree.children[i];
    if (!child) continue;
    const childInfo = measureSubtree(child, m);
    total += childInfo.crossExtent;
    if (i < tree.children.length - 1) total += m.crossGap;
  }
  return { crossExtent: Math.max(m.crossSlot, total) };
}

/**
 * Recursively assign positions. `crossStart` is the leading edge of this
 * subtree on the cross axis; `mainPos` is the centre of this node on the
 * main axis.
 */
function placeTree(
  tree: TreeRef,
  crossStart: number,
  mainPos: number,
  orientation: DecisionTreeOrientation,
  m: AxisMetrics,
  out: Map<string, PositionedNode>,
): void {
  const info = measureSubtree(tree, m);
  const crossCentre = crossStart + info.crossExtent / 2;

  // Map (main, cross) → (x, y) per orientation.
  const x = orientation === 'left-right' ? mainPos : crossCentre;
  const y = orientation === 'left-right' ? crossCentre : mainPos;

  out.set(tree.node.id, {
    id: tree.node.id,
    label: tree.node.label,
    type: tree.node.type ?? (tree.children.length === 0 ? 'outcome' : 'question'),
    sentiment: tree.node.sentiment,
    confidence: tree.node.confidence,
    depth: tree.depth,
    x,
    y,
    parentId: tree.parentId,
  });

  let cursor = crossStart;
  for (const child of tree.children) {
    const childInfo = measureSubtree(child, m);
    placeTree(child, cursor, mainPos + m.mainStride, orientation, m, out);
    cursor += childInfo.crossExtent + m.crossGap;
  }
}

function layout(data: DecisionTreeData): LayoutResult | null {
  const orientation: DecisionTreeOrientation = data.orientation ?? 'left-right';
  const tree = buildTree(data);
  if (!tree) return null;

  const m = axisMetrics(orientation);
  const rootInfo = measureSubtree(tree, m);

  // Main-axis start: half a node from the padded edge so the box fits.
  const mainStart =
    orientation === 'left-right' ? SVG_PADDING + NODE_WIDTH / 2 : SVG_PADDING + NODE_HEIGHT / 2;

  const positioned = new Map<string, PositionedNode>();
  placeTree(tree, SVG_PADDING, mainStart, orientation, m, positioned);

  // Compute SVG dimensions from actual node positions.
  let maxX = 0;
  let maxY = 0;
  for (const node of positioned.values()) {
    maxX = Math.max(maxX, node.x + NODE_WIDTH / 2 + SVG_PADDING);
    maxY = Math.max(maxY, node.y + NODE_HEIGHT / 2 + SVG_PADDING);
  }

  // Ensure cross-axis dimension reflects the measured subtree even when the
  // tree is a single chain (root extents on both sides).
  if (orientation === 'left-right') {
    maxY = Math.max(maxY, rootInfo.crossExtent + SVG_PADDING * 2);
  } else {
    maxX = Math.max(maxX, rootInfo.crossExtent + SVG_PADDING * 2);
  }

  return { nodes: positioned, width: maxX, height: maxY, rootId: tree.node.id };
}

// ─── Sentiment Colors ────────────────────────────────────────

function sentimentColorVar(sentiment: DecisionTreeSentiment): string {
  switch (sentiment) {
    case 'positive':
      return 'var(--glyph-color-success, #16a34a)';
    case 'negative':
      return 'var(--glyph-color-error, #dc2626)';
    case 'neutral':
    default:
      return 'var(--glyph-color-warning, #d97706)';
  }
}

function sentimentFill(sentiment: DecisionTreeSentiment): string {
  return `color-mix(in srgb, ${sentimentColorVar(sentiment)} 20%, var(--glyph-surface, #ffffff))`;
}

// ─── Orthogonal Connector ────────────────────────────────────

function orthogonalPath(
  from: PositionedNode,
  to: PositionedNode,
  orientation: DecisionTreeOrientation,
): { d: string; midX: number; midY: number } {
  if (orientation === 'left-right') {
    // From right edge of `from` to left edge of `to`
    const x1 = from.x + NODE_WIDTH / 2;
    const y1 = from.y;
    const x2 = to.x - NODE_WIDTH / 2;
    const y2 = to.y;
    const midX = (x1 + x2) / 2;
    const d = `M ${String(x1)} ${String(y1)} L ${String(midX)} ${String(y1)} L ${String(midX)} ${String(y2)} L ${String(x2)} ${String(y2)}`;
    return { d, midX, midY: (y1 + y2) / 2 };
  }
  // top-down
  const x1 = from.x;
  const y1 = from.y + NODE_HEIGHT / 2;
  const x2 = to.x;
  const y2 = to.y - NODE_HEIGHT / 2;
  const midY = (y1 + y2) / 2;
  const d = `M ${String(x1)} ${String(y1)} L ${String(x1)} ${String(midY)} L ${String(x2)} ${String(midY)} L ${String(x2)} ${String(y2)}`;
  return { d, midX: (x1 + x2) / 2, midY };
}

// ─── Accessible List Fallback ────────────────────────────────

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

function NodeLabel({ node }: { node: DecisionTreeNode }): ReactElement {
  return (
    <span>
      {node.label}
      {node.sentiment ? ` (${node.sentiment})` : ''}
      {typeof node.confidence === 'number'
        ? ` — confidence ${String(Math.round(node.confidence * 100))}%`
        : ''}
    </span>
  );
}

function renderAccessibleList(
  data: DecisionTreeData,
  rootId: string,
  childrenByParent: Map<string, { edge: DecisionTreeEdge; child: DecisionTreeNode }[]>,
  byId: Map<string, DecisionTreeNode>,
): ReactElement {
  function renderNodeItem(id: string, conditionPrefix?: string): ReactElement {
    const node = byId.get(id);
    if (!node) return <li key={id} />;
    const children = childrenByParent.get(id) ?? [];
    return (
      <li key={id}>
        {conditionPrefix ? <em>if {conditionPrefix}: </em> : null}
        <NodeLabel node={node} />
        {children.length > 0 && (
          <ol>{children.map(({ edge, child }) => renderNodeItem(child.id, edge.condition))}</ol>
        )}
      </li>
    );
  }

  return (
    <ol
      style={SR_ONLY_STYLE}
      aria-label={data.title ? `${data.title} decision tree` : 'Decision tree'}
    >
      {renderNodeItem(rootId)}
    </ol>
  );
}

// ─── Empty State ─────────────────────────────────────────────

function EmptyState({ message }: { message: string }): ReactElement {
  return (
    <div
      role="note"
      style={{
        padding: '12px 16px',
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        color: 'var(--glyph-text, #1a2035)',
        background: 'var(--glyph-surface, #ffffff)',
        border: '1px dashed var(--glyph-border, #d0d8e4)',
        borderRadius: 'var(--glyph-radius-md, 8px)',
      }}
    >
      {message}
    </div>
  );
}

// ─── Edge Renderer ───────────────────────────────────────────

interface EdgeRendererProps {
  edge: DecisionTreeEdge;
  idx: number;
  baseId: string;
  positioned: Map<string, PositionedNode>;
  orientation: DecisionTreeOrientation;
}

function EdgeRenderer({
  edge,
  idx,
  baseId,
  positioned,
  orientation,
}: EdgeRendererProps): ReactElement | null {
  const fromNode = positioned.get(edge.from);
  const toNode = positioned.get(edge.to);
  if (!fromNode || !toNode) return null;
  const { d, midX, midY } = orthogonalPath(fromNode, toNode, orientation);
  const conditionId = `${baseId}-edge-${String(idx)}-desc`;

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="var(--glyph-border, #c3cad6)"
        strokeWidth={1.5}
        aria-describedby={edge.condition ? conditionId : undefined}
      />
      {edge.condition ? <desc id={conditionId}>branch: {edge.condition}</desc> : null}

      {edge.condition ? (
        <g>
          <rect
            x={midX - Math.max(edge.condition.length * 3.8, 12)}
            y={midY - 9}
            width={Math.max(edge.condition.length * 7.6, 24)}
            height={18}
            rx={9}
            ry={9}
            fill="var(--glyph-surface, #ffffff)"
            stroke="var(--glyph-border, #c3cad6)"
            strokeWidth={1}
          />
          <text
            x={midX}
            y={midY}
            dy="0.35em"
            textAnchor="middle"
            fontSize={CONDITION_FONT_SIZE}
            fontFamily={FONT_FAMILY}
            fontWeight={500}
            fill="var(--glyph-text, #1a2035)"
          >
            {edge.condition}
          </text>
        </g>
      ) : null}
    </g>
  );
}

// ─── Node Renderer ───────────────────────────────────────────

function NodeRenderer({ node }: { node: PositionedNode }): ReactElement {
  const isOutcome = node.type === 'outcome';
  const sentiment = node.sentiment ?? 'neutral';
  const x = node.x - NODE_WIDTH / 2;
  const y = node.y - NODE_HEIGHT / 2;
  const borderRadius = isOutcome ? NODE_HEIGHT / 2 : 10;
  const fill = isOutcome ? sentimentFill(sentiment) : 'var(--glyph-surface-raised, #f4f6fa)';
  const stroke = isOutcome ? sentimentColorVar(sentiment) : 'var(--glyph-border, #c3cad6)';
  const ariaLabelForNode = isOutcome
    ? `${node.label} (outcome, ${sentiment})`
    : `${node.label} (decision)`;

  return (
    <g
      role="treeitem"
      aria-level={node.depth + 1}
      aria-label={ariaLabelForNode}
      data-testid={`decisiontree-node-${node.id}`}
      data-node-type={isOutcome ? 'outcome' : 'question'}
    >
      <rect
        x={x}
        y={y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={borderRadius}
        ry={borderRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={isOutcome ? 2 : 1.5}
      />
      <text
        x={node.x}
        y={node.y}
        dy="0.35em"
        textAnchor="middle"
        fontSize={FONT_SIZE}
        fontFamily={FONT_FAMILY}
        fontWeight={isOutcome ? 600 : 500}
        fill="var(--glyph-text, #1a2035)"
      >
        {node.label.length > 22 ? `${node.label.slice(0, 20)}...` : node.label}
      </text>

      {typeof node.confidence === 'number' && (
        <g data-testid={`decisiontree-confidence-${node.id}`}>
          <rect
            x={x + NODE_WIDTH - 38}
            y={y + NODE_HEIGHT - 8}
            width={36}
            height={16}
            rx={8}
            ry={8}
            fill="var(--glyph-accent, #6c8aff)"
            stroke="var(--glyph-border, #c3cad6)"
            strokeWidth={0.5}
          />
          <text
            x={x + NODE_WIDTH - 20}
            y={y + NODE_HEIGHT}
            dy="0.35em"
            textAnchor="middle"
            fontSize={BADGE_FONT_SIZE}
            fontFamily={FONT_FAMILY}
            fontWeight={600}
            fill="var(--glyph-text-on-accent, #ffffff)"
          >
            {Math.round(node.confidence * 100)}%
          </text>
        </g>
      )}
    </g>
  );
}

// ─── Aria Label Helper ───────────────────────────────────────

function buildAriaLabel(
  data: DecisionTreeData,
  childrenByParent: Map<string, { edge: DecisionTreeEdge; child: DecisionTreeNode }[]>,
): string {
  let questionCount = 0;
  let outcomeCount = 0;
  for (const n of data.nodes) {
    const resolvedType =
      n.type ?? ((childrenByParent.get(n.id)?.length ?? 0) === 0 ? 'outcome' : 'question');
    if (resolvedType === 'outcome') outcomeCount += 1;
    else questionCount += 1;
  }

  return data.title
    ? `${data.title}, ${String(questionCount)} decisions, ${String(outcomeCount)} outcomes`
    : `Decision tree, ${String(questionCount)} decisions, ${String(outcomeCount)} outcomes`;
}

// ─── Component ───────────────────────────────────────────────

export function DecisionTree({
  data,
  block,
  container,
}: GlyphComponentProps<DecisionTreeData>): ReactElement {
  const baseId = `glyph-decisiontree-${block.id}`;
  const orientation: DecisionTreeOrientation = data.orientation ?? 'left-right';

  const layoutResult = layout(data);
  if (!layoutResult) {
    return <EmptyState message="Invalid decision tree: unable to determine root." />;
  }

  const { nodes: positioned, width, height, rootId } = layoutResult;

  // Build lookup structures for edges and accessibility
  const byId = new Map<string, DecisionTreeNode>();
  for (const n of data.nodes) byId.set(n.id, n);

  const childrenByParent = new Map<string, { edge: DecisionTreeEdge; child: DecisionTreeNode }[]>();
  for (const edge of data.edges) {
    const child = byId.get(edge.to);
    if (!child) continue;
    const existing = childrenByParent.get(edge.from);
    if (existing) {
      existing.push({ edge, child });
    } else {
      childrenByParent.set(edge.from, [{ edge, child }]);
    }
  }

  const ariaLabel = buildAriaLabel(data, childrenByParent);
  const minHeight = container.tier === 'compact' ? 140 : 200;
  const maxHeight = container.tier === 'compact' ? 600 : 900;

  return (
    <div
      id={baseId}
      className="glyph-decisiontree-container"
      style={{
        fontFamily: FONT_FAMILY,
        color: 'var(--glyph-text, #1a2035)',
      }}
    >
      {data.title && (
        <div
          style={{
            fontWeight: 600,
            fontSize: '14px',
            marginBottom: '8px',
            color: 'var(--glyph-text, #1a2035)',
          }}
        >
          {data.title}
        </div>
      )}

      <svg
        role="tree"
        aria-label={ariaLabel}
        viewBox={`0 0 ${String(width)} ${String(height)}`}
        width="100%"
        style={{
          display: 'block',
          minHeight,
          maxHeight,
        }}
      >
        {data.edges.map((edge, idx) => (
          <EdgeRenderer
            key={`edge-${String(idx)}`}
            edge={edge}
            idx={idx}
            baseId={baseId}
            positioned={positioned}
            orientation={orientation}
          />
        ))}

        {Array.from(positioned.values()).map((node) => (
          <NodeRenderer key={`node-${node.id}`} node={node} />
        ))}
      </svg>

      {renderAccessibleList(data, rootId, childrenByParent, byId)}
    </div>
  );
}
