import type { CSSProperties, ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ───────────────────────────────────────────────────

export interface MindMapNode {
  label: string;
  children?: MindMapNode[];
}

export interface MindMapData {
  root: string;
  children: MindMapNode[];
  layout: 'radial' | 'tree';
}

// ─── Layout Constants ────────────────────────────────────────

const MAX_VISIBLE_DEPTH = 4;
const NODE_RADIUS = 28;
const ROOT_RADIUS = 34;
const RADIAL_LEVEL_RADIUS = 130;
const TREE_LEVEL_HEIGHT = 90;
const TREE_NODE_HGAP = 140;
const SVG_PADDING = 60;
const FONT_SIZE = 12;
const FONT_FAMILY = 'Inter, system-ui, sans-serif';
const BADGE_FONT_SIZE = 10;

// ─── Positioned Node ─────────────────────────────────────────

interface PositionedNode {
  label: string;
  x: number;
  y: number;
  depth: number;
  parentX?: number;
  parentY?: number;
  hiddenCount: number;
}

// ─── Layout Functions ────────────────────────────────────────

function countHiddenDescendants(node: MindMapNode, currentDepth: number): number {
  if (currentDepth >= MAX_VISIBLE_DEPTH) {
    return countAllDescendants(node);
  }
  let count = 0;
  for (const child of node.children ?? []) {
    count += countHiddenDescendants(child, currentDepth + 1);
  }
  return count;
}

function countAllDescendants(node: MindMapNode): number {
  let count = 1;
  for (const child of node.children ?? []) {
    count += countAllDescendants(child);
  }
  return count;
}

function layoutRadial(data: MindMapData): {
  nodes: PositionedNode[];
  width: number;
  height: number;
} {
  const nodes: PositionedNode[] = [];
  const cx = 0;
  const cy = 0;

  // Root node
  nodes.push({
    label: data.root,
    x: cx,
    y: cy,
    depth: 0,
    hiddenCount: 0,
  });

  function placeChildren(
    children: MindMapNode[],
    parentX: number,
    parentY: number,
    depth: number,
    startAngle: number,
    endAngle: number,
  ): void {
    if (depth > MAX_VISIBLE_DEPTH) return;
    const count = children.length;
    if (count === 0) return;

    const radius = RADIAL_LEVEL_RADIUS * depth;

    for (let i = 0; i < count; i++) {
      const child = children[i];
      if (!child) continue;

      const angle =
        count === 1
          ? (startAngle + endAngle) / 2
          : startAngle + ((endAngle - startAngle) * i) / (count - 1);

      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const hidden = countHiddenDescendants(child, depth);

      nodes.push({
        label: child.label,
        x,
        y,
        depth,
        parentX,
        parentY,
        hiddenCount: hidden,
      });

      const childChildren = child.children ?? [];
      if (childChildren.length > 0 && depth < MAX_VISIBLE_DEPTH) {
        const spreadAngle = Math.PI / Math.max(count, 2);
        placeChildren(
          childChildren,
          x,
          y,
          depth + 1,
          angle - spreadAngle / 2,
          angle + spreadAngle / 2,
        );
      }
    }
  }

  const topChildren = data.children;
  placeChildren(topChildren, cx, cy, 1, 0, 2 * Math.PI * (1 - 1 / Math.max(topChildren.length, 2)));

  // Compute bounding box
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  for (const n of nodes) {
    if (n.x - ROOT_RADIUS < minX) minX = n.x - ROOT_RADIUS;
    if (n.x + ROOT_RADIUS > maxX) maxX = n.x + ROOT_RADIUS;
    if (n.y - ROOT_RADIUS < minY) minY = n.y - ROOT_RADIUS;
    if (n.y + ROOT_RADIUS > maxY) maxY = n.y + ROOT_RADIUS;
  }

  // Offset so all coords are positive
  const offsetX = -minX + SVG_PADDING;
  const offsetY = -minY + SVG_PADDING;
  for (const n of nodes) {
    n.x += offsetX;
    n.y += offsetY;
    if (n.parentX !== undefined) n.parentX += offsetX;
    if (n.parentY !== undefined) n.parentY += offsetY;
  }

  return {
    nodes,
    width: maxX - minX + SVG_PADDING * 2,
    height: maxY - minY + SVG_PADDING * 2,
  };
}

function layoutTree(data: MindMapData): {
  nodes: PositionedNode[];
  width: number;
  height: number;
} {
  const nodes: PositionedNode[] = [];

  // Count total leaf nodes to determine width
  function countLeaves(children: MindMapNode[], depth: number): number {
    if (depth >= MAX_VISIBLE_DEPTH) return 1;
    let total = 0;
    for (const child of children) {
      const childChildren = child.children ?? [];
      if (childChildren.length === 0 || depth + 1 >= MAX_VISIBLE_DEPTH) {
        total += 1;
      } else {
        total += countLeaves(childChildren, depth + 1);
      }
    }
    return Math.max(total, 1);
  }

  const totalLeaves = Math.max(countLeaves(data.children, 1), 1);
  const totalWidth = totalLeaves * TREE_NODE_HGAP;
  const rootX = totalWidth / 2 + SVG_PADDING;
  const rootY = SVG_PADDING;

  nodes.push({
    label: data.root,
    x: rootX,
    y: rootY,
    depth: 0,
    hiddenCount: 0,
  });

  function placeTreeChildren(
    children: MindMapNode[],
    parentX: number,
    parentY: number,
    depth: number,
    leftBound: number,
    rightBound: number,
  ): void {
    if (depth > MAX_VISIBLE_DEPTH) return;
    const count = children.length;
    if (count === 0) return;

    const y = parentY + TREE_LEVEL_HEIGHT;
    const slotWidth = (rightBound - leftBound) / count;

    for (let i = 0; i < count; i++) {
      const child = children[i];
      if (!child) continue;

      const x = leftBound + slotWidth * (i + 0.5);
      const hidden = countHiddenDescendants(child, depth);

      nodes.push({
        label: child.label,
        x,
        y,
        depth,
        parentX,
        parentY,
        hiddenCount: hidden,
      });

      const childChildren = child.children ?? [];
      if (childChildren.length > 0 && depth < MAX_VISIBLE_DEPTH) {
        placeTreeChildren(
          childChildren,
          x,
          y,
          depth + 1,
          leftBound + slotWidth * i,
          leftBound + slotWidth * (i + 1),
        );
      }
    }
  }

  placeTreeChildren(data.children, rootX, rootY, 1, SVG_PADDING, totalWidth + SVG_PADDING);

  // Compute dimensions
  let maxY = rootY;
  for (const n of nodes) {
    if (n.y > maxY) maxY = n.y;
  }

  return {
    nodes,
    width: totalWidth + SVG_PADDING * 2,
    height: maxY + SVG_PADDING + NODE_RADIUS,
  };
}

// ─── Accessible List ─────────────────────────────────────────

function renderAccessibleList(root: string, children: MindMapNode[]): ReactElement {
  return (
    <ul style={SR_ONLY_STYLE} role="list" aria-label="Mind map structure">
      <li>
        {root}
        {children.length > 0 && renderAccessibleChildren(children)}
      </li>
    </ul>
  );
}

function renderAccessibleChildren(children: MindMapNode[]): ReactElement {
  return (
    <ul>
      {children.map((child, i) => (
        <li key={i}>
          {child.label}
          {(child.children ?? []).length > 0 && renderAccessibleChildren(child.children ?? [])}
        </li>
      ))}
    </ul>
  );
}

// ─── Node Color ──────────────────────────────────────────────

function nodeColor(depth: number): string {
  if (depth === 0) return 'var(--glyph-accent, #6c8aff)';
  if (depth === 1) return 'var(--glyph-surface-raised, #162038)';
  return 'var(--glyph-surface, #0f1526)';
}

function nodeStroke(depth: number): string {
  if (depth === 0) return 'var(--glyph-accent, #6c8aff)';
  return 'var(--glyph-border-strong, #2a3550)';
}

// ─── Count all nodes ─────────────────────────────────────────

function countAllNodes(children: MindMapNode[]): number {
  let count = 0;
  for (const child of children) {
    count += 1;
    count += countAllNodes(child.children ?? []);
  }
  return count;
}

// ─── Component ──────────────────────────────────────────────

export function MindMap({ data }: GlyphComponentProps<MindMapData>): ReactElement {
  const isTree = data.layout === 'tree';
  const { nodes, width, height } = isTree ? layoutTree(data) : layoutRadial(data);

  const totalNodes = 1 + countAllNodes(data.children);
  const ariaLabel = `Mind map: ${data.root} with ${String(totalNodes)} nodes`;

  return (
    <div className="glyph-mindmap-container">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ minHeight: 200, maxHeight: 800, display: 'block' }}
      >
        {/* Edge lines */}
        {nodes.map((node, idx) => {
          if (node.parentX === undefined || node.parentY === undefined) return null;
          return (
            <line
              key={`edge-${idx}`}
              x1={node.parentX}
              y1={node.parentY}
              x2={node.x}
              y2={node.y}
              stroke="var(--glyph-border, #1a2035)"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, idx) => {
          const r = node.depth === 0 ? ROOT_RADIUS : NODE_RADIUS;
          const isRoot = node.depth === 0;

          return (
            <g key={`node-${idx}`}>
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={nodeColor(node.depth)}
                stroke={nodeStroke(node.depth)}
                strokeWidth={isRoot ? 2 : 1.5}
              />

              {/* Label */}
              <text
                x={node.x}
                y={node.y}
                dy="0.35em"
                textAnchor="middle"
                fontSize={isRoot ? FONT_SIZE + 1 : FONT_SIZE}
                fontFamily={FONT_FAMILY}
                fontWeight={isRoot ? 700 : 500}
                fill={
                  isRoot ? 'var(--glyph-text-on-accent, #ffffff)' : 'var(--glyph-text, #d4dae3)'
                }
              >
                {node.label.length > 12 ? `${node.label.slice(0, 11)}...` : node.label}
              </text>

              {/* Hidden count badge */}
              {node.hiddenCount > 0 && (
                <g>
                  <circle
                    cx={node.x + r * 0.7}
                    cy={node.y - r * 0.7}
                    r={10}
                    fill="var(--glyph-accent, #6c8aff)"
                  />
                  <text
                    x={node.x + r * 0.7}
                    y={node.y - r * 0.7}
                    dy="0.35em"
                    textAnchor="middle"
                    fontSize={BADGE_FONT_SIZE}
                    fontFamily={FONT_FAMILY}
                    fontWeight={600}
                    fill="var(--glyph-text-on-accent, #ffffff)"
                  >
                    +{node.hiddenCount}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Screen-reader accessible nested list */}
      {renderAccessibleList(data.root, data.children)}
    </div>
  );
}

// ─── SR Only Style ──────────────────────────────────────────

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
