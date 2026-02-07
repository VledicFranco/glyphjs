import type { GraphNode, GraphEdge, InlineNode } from '@glyphjs/types';
import dagre from 'dagre';
import * as d3 from 'd3';
import { measureText } from '../utils/measureText.js';

// ─── Positioned Node / Edge ──────────────────────────────────

export interface PositionedNode extends GraphNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositionedEdge extends GraphEdge {
  points: { x: number; y: number }[];
}

export interface LayoutResult {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  width: number;
  height: number;
}

// ─── Direction mapping ───────────────────────────────────────

type LayoutDirection = 'top-down' | 'left-right' | 'bottom-up' | 'radial' | 'force';

const RANKDIR_MAP: Record<string, string> = {
  'top-down': 'TB',
  'left-right': 'LR',
  'bottom-up': 'BT',
  radial: 'TB',
};

// ─── Constants ───────────────────────────────────────────────

const DEFAULT_NODE_WIDTH = 160;
const DEFAULT_NODE_HEIGHT = 40;
const NODE_SEP = 50;
const RANK_SEP = 70;
const EDGE_SEP = 10;
const LAYOUT_PADDING = 40;

// ─── Dagre Layout ────────────────────────────────────────────

/**
 * Uses dagre to compute hierarchical layout positions for nodes and edges.
 * Supports top-down, left-right, bottom-up, and radial directions.
 * The radial direction uses top-down dagre as a base.
 */
export function computeDagreLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  direction: LayoutDirection = 'top-down',
): LayoutResult {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: RANKDIR_MAP[direction] ?? 'TB',
    nodesep: NODE_SEP,
    ranksep: RANK_SEP,
    edgesep: EDGE_SEP,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    // Dynamically measure label dimensions
    const labelDimensions = measureText(node.label, {
      fontSize: '13px',
      fontFamily: 'Inter, system-ui, sans-serif',
      maxWidth: 200,
    });

    const nodeWidth = Math.max(120, Math.min(250, labelDimensions.width + 40));
    const nodeHeight = Math.max(40, labelDimensions.height + 20);

    g.setNode(node.id, {
      label: node.label,
      width: nodeWidth,
      height: nodeHeight,
    });
  }

  for (const edge of edges) {
    g.setEdge(edge.from, edge.to);
  }

  dagre.layout(g);

  const positionedNodes: PositionedNode[] = nodes.map((node) => {
    const dagreNode = g.node(node.id) as dagre.Node;
    return {
      ...node,
      x: dagreNode.x,
      y: dagreNode.y,
      width: dagreNode.width,
      height: dagreNode.height,
    };
  });

  const positionedEdges: PositionedEdge[] = edges.map((edge) => {
    const dagreEdge = g.edge(edge.from, edge.to) as dagre.GraphEdge;
    return {
      ...edge,
      points: dagreEdge.points,
    };
  });

  // Compute bounding box
  let maxX = 0;
  let maxY = 0;
  for (const n of positionedNodes) {
    const right = n.x + n.width / 2;
    const bottom = n.y + n.height / 2;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  return {
    nodes: positionedNodes,
    edges: positionedEdges,
    width: maxX + LAYOUT_PADDING,
    height: maxY + LAYOUT_PADDING,
  };
}

// ─── Force Layout ────────────────────────────────────────────

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string | InlineNode[];
  type?: string;
  style?: Record<string, string>;
  group?: string;
}

/**
 * Uses D3 force simulation to compute physics-based layout positions.
 * Runs the simulation synchronously for a fixed number of ticks.
 */
export function computeForceLayout(nodes: GraphNode[], edges: GraphEdge[]): LayoutResult {
  const simNodes: SimNode[] = nodes.map((n) => ({
    ...n,
    x: undefined,
    y: undefined,
  }));

  const simLinks = edges.map((e) => ({
    source: e.from,
    target: e.to,
  }));

  const simulation = d3
    .forceSimulation(simNodes)
    .force(
      'link',
      d3
        .forceLink(simLinks)
        .id((d) => (d as SimNode).id)
        .distance(120),
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(400, 300))
    .force('collision', d3.forceCollide().radius(DEFAULT_NODE_WIDTH / 2 + 10))
    .stop();

  // Run simulation synchronously
  const tickCount = 300;
  for (let i = 0; i < tickCount; i++) {
    simulation.tick();
  }

  // Shift positions so all are positive
  let minX = Infinity;
  let minY = Infinity;
  for (const sn of simNodes) {
    if ((sn.x ?? 0) < minX) minX = sn.x ?? 0;
    if ((sn.y ?? 0) < minY) minY = sn.y ?? 0;
  }
  const offsetX = -minX + LAYOUT_PADDING + DEFAULT_NODE_WIDTH / 2;
  const offsetY = -minY + LAYOUT_PADDING + DEFAULT_NODE_HEIGHT / 2;

  const nodeMap = new Map<string, PositionedNode>();
  const positionedNodes: PositionedNode[] = simNodes.map((sn) => {
    const pn: PositionedNode = {
      id: sn.id,
      label: sn.label as string | InlineNode[],
      type: sn.type,
      style: sn.style,
      group: sn.group,
      x: (sn.x ?? 0) + offsetX,
      y: (sn.y ?? 0) + offsetY,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
    };
    nodeMap.set(sn.id, pn);
    return pn;
  });

  const positionedEdges: PositionedEdge[] = edges.map((edge) => {
    const source = nodeMap.get(edge.from);
    const target = nodeMap.get(edge.to);
    return {
      ...edge,
      points: [
        { x: source?.x ?? 0, y: source?.y ?? 0 },
        { x: target?.x ?? 0, y: target?.y ?? 0 },
      ],
    };
  });

  // Compute bounding box
  let maxX = 0;
  let maxY = 0;
  for (const n of positionedNodes) {
    const right = n.x + n.width / 2;
    const bottom = n.y + n.height / 2;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  return {
    nodes: positionedNodes,
    edges: positionedEdges,
    width: maxX + LAYOUT_PADDING,
    height: maxY + LAYOUT_PADDING,
  };
}
