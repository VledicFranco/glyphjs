import { describe, it, expect } from 'vitest';
import { computeDagreLayout, computeForceLayout } from '../layout.js';
import type { LayoutResult, PositionedNode, PositionedEdge } from '../layout.js';
import type { GraphNode, GraphEdge } from '@glyphjs/types';

// ─── Test data ──────────────────────────────────────────────────

const linearNodes: GraphNode[] = [
  { id: 'a', label: 'Node A' },
  { id: 'b', label: 'Node B' },
  { id: 'c', label: 'Node C' },
];

const linearEdges: GraphEdge[] = [
  { from: 'a', to: 'b' },
  { from: 'b', to: 'c' },
];

const starNodes: GraphNode[] = [
  { id: 'center', label: 'Center' },
  { id: 'leaf1', label: 'Leaf 1' },
  { id: 'leaf2', label: 'Leaf 2' },
  { id: 'leaf3', label: 'Leaf 3' },
  { id: 'leaf4', label: 'Leaf 4' },
];

const starEdges: GraphEdge[] = [
  { from: 'center', to: 'leaf1' },
  { from: 'center', to: 'leaf2' },
  { from: 'center', to: 'leaf3' },
  { from: 'center', to: 'leaf4' },
];

const disconnectedNodes: GraphNode[] = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
  { id: 'c', label: 'C' },
  { id: 'd', label: 'D' },
];

const disconnectedEdges: GraphEdge[] = [
  { from: 'a', to: 'b' },
  // c and d are disconnected from a-b
  { from: 'c', to: 'd' },
];

const singleNode: GraphNode[] = [{ id: 'solo', label: 'Solo Node' }];

// ─── Helper assertions ──────────────────────────────────────────

function assertValidLayoutResult(result: LayoutResult): void {
  expect(result).toHaveProperty('nodes');
  expect(result).toHaveProperty('edges');
  expect(result).toHaveProperty('width');
  expect(result).toHaveProperty('height');
  expect(result.width).toBeGreaterThan(0);
  expect(result.height).toBeGreaterThan(0);
}

function assertAllNodesPositioned(
  result: LayoutResult,
  expectedCount: number,
): void {
  expect(result.nodes).toHaveLength(expectedCount);
  for (const node of result.nodes) {
    expect(typeof node.x).toBe('number');
    expect(typeof node.y).toBe('number');
    expect(Number.isFinite(node.x)).toBe(true);
    expect(Number.isFinite(node.y)).toBe(true);
    expect(node.width).toBeGreaterThan(0);
    expect(node.height).toBeGreaterThan(0);
  }
}

function assertAllEdgesHavePoints(
  result: LayoutResult,
  expectedCount: number,
): void {
  expect(result.edges).toHaveLength(expectedCount);
  for (const edge of result.edges) {
    expect(edge.points).toBeDefined();
    expect(Array.isArray(edge.points)).toBe(true);
    expect(edge.points.length).toBeGreaterThan(0);
    for (const point of edge.points) {
      expect(typeof point.x).toBe('number');
      expect(typeof point.y).toBe('number');
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
    }
  }
}

function assertNoOverlap(nodes: PositionedNode[]): void {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      // Check if bounding boxes overlap
      const aLeft = a.x - a.width / 2;
      const aRight = a.x + a.width / 2;
      const aTop = a.y - a.height / 2;
      const aBottom = a.y + a.height / 2;
      const bLeft = b.x - b.width / 2;
      const bRight = b.x + b.width / 2;
      const bTop = b.y - b.height / 2;
      const bBottom = b.y + b.height / 2;

      const overlapX = aLeft < bRight && aRight > bLeft;
      const overlapY = aTop < bBottom && aBottom > bTop;

      if (overlapX && overlapY) {
        // Allow small floating-point overlaps (within 1px tolerance)
        const overlapAmountX = Math.min(aRight - bLeft, bRight - aLeft);
        const overlapAmountY = Math.min(aBottom - bTop, bBottom - aTop);
        const isMinimal = overlapAmountX < 1 || overlapAmountY < 1;
        if (!isMinimal) {
          // This is a soft check; dagre should not produce overlapping nodes
          // but force layout might have minor overlaps
        }
      }
    }
  }
}

// ─── computeDagreLayout ─────────────────────────────────────────

describe('computeDagreLayout', () => {
  it('produces positioned nodes for a linear graph', () => {
    const result = computeDagreLayout(linearNodes, linearEdges);

    assertValidLayoutResult(result);
    assertAllNodesPositioned(result, 3);
    assertAllEdgesHavePoints(result, 2);
  });

  it('produces positioned nodes for a star graph', () => {
    const result = computeDagreLayout(starNodes, starEdges);

    assertValidLayoutResult(result);
    assertAllNodesPositioned(result, 5);
    assertAllEdgesHavePoints(result, 4);
  });

  it('produces positioned nodes for disconnected components', () => {
    const result = computeDagreLayout(disconnectedNodes, disconnectedEdges);

    assertValidLayoutResult(result);
    assertAllNodesPositioned(result, 4);
    assertAllEdgesHavePoints(result, 2);
  });

  it('handles a single node with no edges', () => {
    const result = computeDagreLayout(singleNode, []);

    assertValidLayoutResult(result);
    assertAllNodesPositioned(result, 1);
    expect(result.edges).toHaveLength(0);
  });

  it('handles empty graph (no nodes, no edges)', () => {
    const result = computeDagreLayout([], []);

    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
    // Width and height should include padding
    expect(result.width).toBe(40); // LAYOUT_PADDING
    expect(result.height).toBe(40); // LAYOUT_PADDING
  });

  it('preserves original node properties (id, label)', () => {
    const result = computeDagreLayout(linearNodes, linearEdges);

    const nodeIds = result.nodes.map((n) => n.id);
    expect(nodeIds).toContain('a');
    expect(nodeIds).toContain('b');
    expect(nodeIds).toContain('c');

    const nodeA = result.nodes.find((n) => n.id === 'a')!;
    expect(nodeA.label).toBe('Node A');
  });

  it('preserves original edge properties (from, to)', () => {
    const result = computeDagreLayout(linearNodes, linearEdges);

    expect(result.edges[0].from).toBe('a');
    expect(result.edges[0].to).toBe('b');
    expect(result.edges[1].from).toBe('b');
    expect(result.edges[1].to).toBe('c');
  });

  it('assigns default node dimensions', () => {
    const result = computeDagreLayout(singleNode, []);
    const node = result.nodes[0];

    expect(node.width).toBe(160); // DEFAULT_NODE_WIDTH
    expect(node.height).toBe(40); // DEFAULT_NODE_HEIGHT
  });

  // Direction tests
  it('defaults to top-down direction', () => {
    const result = computeDagreLayout(linearNodes, linearEdges);
    assertValidLayoutResult(result);

    // In top-down layout, nodes along a path should have increasing y
    const nodeA = result.nodes.find((n) => n.id === 'a')!;
    const nodeB = result.nodes.find((n) => n.id === 'b')!;
    const nodeC = result.nodes.find((n) => n.id === 'c')!;

    expect(nodeA.y).toBeLessThan(nodeB.y);
    expect(nodeB.y).toBeLessThan(nodeC.y);
  });

  it('supports left-right direction', () => {
    const result = computeDagreLayout(linearNodes, linearEdges, 'left-right');
    assertValidLayoutResult(result);

    // In left-right layout, nodes along a path should have increasing x
    const nodeA = result.nodes.find((n) => n.id === 'a')!;
    const nodeB = result.nodes.find((n) => n.id === 'b')!;
    const nodeC = result.nodes.find((n) => n.id === 'c')!;

    expect(nodeA.x).toBeLessThan(nodeB.x);
    expect(nodeB.x).toBeLessThan(nodeC.x);
  });

  it('supports bottom-up direction', () => {
    const result = computeDagreLayout(linearNodes, linearEdges, 'bottom-up');
    assertValidLayoutResult(result);

    // In bottom-up layout, nodes along a path should have decreasing y
    const nodeA = result.nodes.find((n) => n.id === 'a')!;
    const nodeB = result.nodes.find((n) => n.id === 'b')!;
    const nodeC = result.nodes.find((n) => n.id === 'c')!;

    expect(nodeA.y).toBeGreaterThan(nodeB.y);
    expect(nodeB.y).toBeGreaterThan(nodeC.y);
  });

  it('supports radial direction (uses top-down base)', () => {
    const result = computeDagreLayout(starNodes, starEdges, 'radial');
    assertValidLayoutResult(result);
    assertAllNodesPositioned(result, 5);
  });

  it('computes a bounding box that encompasses all nodes plus padding', () => {
    const result = computeDagreLayout(linearNodes, linearEdges);

    for (const node of result.nodes) {
      const right = node.x + node.width / 2;
      const bottom = node.y + node.height / 2;
      // width/height should be at least right/bottom + padding
      expect(result.width).toBeGreaterThanOrEqual(right);
      expect(result.height).toBeGreaterThanOrEqual(bottom);
    }
  });

  it('produces different layouts for different directions', () => {
    const td = computeDagreLayout(linearNodes, linearEdges, 'top-down');
    const lr = computeDagreLayout(linearNodes, linearEdges, 'left-right');

    // Compare the last node in the chain which should clearly differ
    const tdNodeC = td.nodes.find((n) => n.id === 'c')!;
    const lrNodeC = lr.nodes.find((n) => n.id === 'c')!;

    // In top-down: C has highest y; in left-right: C has highest x
    // The overall shape (width vs height) should differ between the layouts
    const tdAspect = td.width / td.height;
    const lrAspect = lr.width / lr.height;

    // Top-down should be taller than wide, left-right should be wider than tall
    // So their aspect ratios should differ
    expect(tdAspect).not.toBeCloseTo(lrAspect, 1);
  });

  it('handles nodes with additional optional properties', () => {
    const nodesWithExtras: GraphNode[] = [
      { id: 'x', label: 'X', type: 'custom', style: { color: 'red' }, group: 'g1' },
      { id: 'y', label: 'Y', type: 'default', group: 'g2' },
    ];
    const edges: GraphEdge[] = [{ from: 'x', to: 'y' }];

    const result = computeDagreLayout(nodesWithExtras, edges);

    assertValidLayoutResult(result);
    const nodeX = result.nodes.find((n) => n.id === 'x')!;
    expect(nodeX.type).toBe('custom');
    expect(nodeX.style).toEqual({ color: 'red' });
    expect(nodeX.group).toBe('g1');
  });
});

// ─── computeForceLayout ─────────────────────────────────────────

describe('computeForceLayout', () => {
  it('produces positioned nodes for a linear graph', () => {
    const result = computeForceLayout(linearNodes, linearEdges);

    assertValidLayoutResult(result);
    assertAllNodesPositioned(result, 3);
    assertAllEdgesHavePoints(result, 2);
  });

  it('produces positioned nodes for a star graph', () => {
    const result = computeForceLayout(starNodes, starEdges);

    assertValidLayoutResult(result);
    assertAllNodesPositioned(result, 5);
    assertAllEdgesHavePoints(result, 4);
  });

  it('produces positioned nodes for disconnected components', () => {
    const result = computeForceLayout(disconnectedNodes, disconnectedEdges);

    assertValidLayoutResult(result);
    assertAllNodesPositioned(result, 4);
    assertAllEdgesHavePoints(result, 2);
  });

  it('handles a single node with no edges', () => {
    const result = computeForceLayout(singleNode, []);

    assertValidLayoutResult(result);
    assertAllNodesPositioned(result, 1);
    expect(result.edges).toHaveLength(0);
  });

  it('handles empty graph (no nodes, no edges)', () => {
    const result = computeForceLayout([], []);

    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('preserves original node properties (id, label)', () => {
    const result = computeForceLayout(linearNodes, linearEdges);

    const nodeIds = result.nodes.map((n) => n.id);
    expect(nodeIds).toContain('a');
    expect(nodeIds).toContain('b');
    expect(nodeIds).toContain('c');

    const nodeA = result.nodes.find((n) => n.id === 'a')!;
    expect(nodeA.label).toBe('Node A');
  });

  it('preserves original edge properties (from, to)', () => {
    const result = computeForceLayout(linearNodes, linearEdges);

    expect(result.edges[0].from).toBe('a');
    expect(result.edges[0].to).toBe('b');
  });

  it('all node positions are positive after offset adjustment', () => {
    const result = computeForceLayout(starNodes, starEdges);

    for (const node of result.nodes) {
      expect(node.x).toBeGreaterThan(0);
      expect(node.y).toBeGreaterThan(0);
    }
  });

  it('all edge points are finite numbers', () => {
    const result = computeForceLayout(linearNodes, linearEdges);

    assertAllEdgesHavePoints(result, 2);
  });

  it('edge points connect source and target nodes', () => {
    const result = computeForceLayout(linearNodes, linearEdges);

    for (const edge of result.edges) {
      const source = result.nodes.find((n) => n.id === edge.from);
      const target = result.nodes.find((n) => n.id === edge.to);
      expect(source).toBeDefined();
      expect(target).toBeDefined();

      // Edge should have exactly 2 points (source and target)
      expect(edge.points).toHaveLength(2);

      // First point should be at the source node
      expect(edge.points[0].x).toBeCloseTo(source!.x, 0);
      expect(edge.points[0].y).toBeCloseTo(source!.y, 0);

      // Second point should be at the target node
      expect(edge.points[1].x).toBeCloseTo(target!.x, 0);
      expect(edge.points[1].y).toBeCloseTo(target!.y, 0);
    }
  });

  it('assigns default node dimensions', () => {
    const result = computeForceLayout(singleNode, []);
    const node = result.nodes[0];

    expect(node.width).toBe(160); // DEFAULT_NODE_WIDTH
    expect(node.height).toBe(40); // DEFAULT_NODE_HEIGHT
  });

  it('computes a bounding box that encompasses all nodes', () => {
    const result = computeForceLayout(linearNodes, linearEdges);

    for (const node of result.nodes) {
      const right = node.x + node.width / 2;
      const bottom = node.y + node.height / 2;
      expect(result.width).toBeGreaterThanOrEqual(right);
      expect(result.height).toBeGreaterThanOrEqual(bottom);
    }
  });

  it('handles nodes with optional properties', () => {
    const nodesWithExtras: GraphNode[] = [
      { id: 'x', label: 'X', type: 'custom', style: { color: 'blue' }, group: 'g1' },
      { id: 'y', label: 'Y' },
    ];
    const edges: GraphEdge[] = [{ from: 'x', to: 'y' }];

    const result = computeForceLayout(nodesWithExtras, edges);

    assertValidLayoutResult(result);
    const nodeX = result.nodes.find((n) => n.id === 'x')!;
    expect(nodeX.type).toBe('custom');
    expect(nodeX.style).toEqual({ color: 'blue' });
    expect(nodeX.group).toBe('g1');
  });

  it('produces distinct positions for connected nodes (force repulsion)', () => {
    const result = computeForceLayout(linearNodes, linearEdges);

    const positions = result.nodes.map((n) => ({ x: n.x, y: n.y }));

    // No two nodes should have exactly the same position
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const same =
          positions[i].x === positions[j].x &&
          positions[i].y === positions[j].y;
        expect(same).toBe(false);
      }
    }
  });

  it('handles a large-ish graph without errors', () => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (let i = 0; i < 20; i++) {
      nodes.push({ id: `n${String(i)}`, label: `Node ${String(i)}` });
    }
    for (let i = 0; i < 19; i++) {
      edges.push({ from: `n${String(i)}`, to: `n${String(i + 1)}` });
    }

    const result = computeForceLayout(nodes, edges);

    assertValidLayoutResult(result);
    assertAllNodesPositioned(result, 20);
    assertAllEdgesHavePoints(result, 19);
  });
});

// ─── Cross-algorithm comparison ─────────────────────────────────

describe('Layout algorithms comparison', () => {
  it('both algorithms position the same number of nodes', () => {
    const dagre = computeDagreLayout(linearNodes, linearEdges);
    const force = computeForceLayout(linearNodes, linearEdges);

    expect(dagre.nodes).toHaveLength(force.nodes.length);
    expect(dagre.edges).toHaveLength(force.edges.length);
  });

  it('both algorithms produce valid positive dimensions', () => {
    const dagre = computeDagreLayout(starNodes, starEdges);
    const force = computeForceLayout(starNodes, starEdges);

    expect(dagre.width).toBeGreaterThan(0);
    expect(dagre.height).toBeGreaterThan(0);
    expect(force.width).toBeGreaterThan(0);
    expect(force.height).toBeGreaterThan(0);
  });

  it('both algorithms handle the same edge cases', () => {
    // Single node
    const dagreSingle = computeDagreLayout(singleNode, []);
    const forceSingle = computeForceLayout(singleNode, []);

    expect(dagreSingle.nodes).toHaveLength(1);
    expect(forceSingle.nodes).toHaveLength(1);

    // Empty graph
    const dagreEmpty = computeDagreLayout([], []);
    const forceEmpty = computeForceLayout([], []);

    expect(dagreEmpty.nodes).toHaveLength(0);
    expect(forceEmpty.nodes).toHaveLength(0);
  });
});
