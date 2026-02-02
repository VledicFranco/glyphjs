// ─── Architecture Layout (ELK.js) ───────────────────────────

export interface ArchitectureNode {
  id: string;
  label: string;
  icon?: string;
  type?: 'zone';
  children?: ArchitectureNode[];
  style?: Record<string, string>;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'sync' | 'async' | 'data';
  style?: Record<string, string>;
}

export interface ArchitectureData {
  title?: string;
  children: ArchitectureNode[];
  edges: ArchitectureEdge[];
  layout?: 'top-down' | 'left-right' | 'bottom-up';
}

// ─── Positioned Types ───────────────────────────────────────

export interface PositionedArchNode {
  id: string;
  label: string;
  icon?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zoneId?: string;
}

export interface PositionedZone {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
}

export interface PositionedArchEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'sync' | 'async' | 'data';
  style?: Record<string, string>;
  points: { x: number; y: number }[];
}

export interface ArchitectureLayout {
  nodes: PositionedArchNode[];
  zones: PositionedZone[];
  edges: PositionedArchEdge[];
  width: number;
  height: number;
}

// ─── Constants ──────────────────────────────────────────────

const NODE_WIDTH = 120;
const NODE_HEIGHT_WITH_ICON = 60;
const NODE_HEIGHT_NO_ICON = 40;
const ZONE_PADDING_TOP = 40;
const ZONE_PADDING_SIDES = 20;
const ZONE_PADDING_BOTTOM = 20;
const LAYOUT_PADDING = 40;

// ─── Direction Mapping ──────────────────────────────────────

const DIRECTION_MAP: Record<string, string> = {
  'top-down': 'DOWN',
  'left-right': 'RIGHT',
  'bottom-up': 'UP',
};

// ─── ELK Types ──────────────────────────────────────────────

interface ElkNode {
  id: string;
  width?: number;
  height?: number;
  children?: ElkNode[];
  labels?: { text: string }[];
  layoutOptions?: Record<string, string>;
}

interface ElkEdge {
  id: string;
  sources: string[];
  targets: string[];
  labels?: { text: string }[];
}

interface ElkRoot {
  id: string;
  children: ElkNode[];
  edges: ElkEdge[];
  layoutOptions: Record<string, string>;
}

interface ElkPositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children?: ElkPositionedNode[];
  labels?: { text: string }[];
}

interface ElkPositionedEdge {
  id: string;
  sections?: {
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
    bendPoints?: { x: number; y: number }[];
  }[];
}

interface ElkPositionedRoot {
  width?: number;
  height?: number;
  children?: ElkPositionedNode[];
  edges?: ElkPositionedEdge[];
}

// ─── Build ELK Graph ────────────────────────────────────────

function buildElkNode(node: ArchitectureNode): ElkNode {
  if (node.type === 'zone' && node.children?.length) {
    return {
      id: node.id,
      labels: [{ text: node.label }],
      children: node.children.map(buildElkNode),
      layoutOptions: {
        'elk.padding': `[top=${ZONE_PADDING_TOP},left=${ZONE_PADDING_SIDES},bottom=${ZONE_PADDING_BOTTOM},right=${ZONE_PADDING_SIDES}]`,
      },
    };
  }
  return {
    id: node.id,
    width: NODE_WIDTH,
    height: node.icon ? NODE_HEIGHT_WITH_ICON : NODE_HEIGHT_NO_ICON,
    labels: [{ text: node.label }],
  };
}

function buildElkGraph(data: ArchitectureData): ElkRoot {
  const direction = DIRECTION_MAP[data.layout ?? 'top-down'] ?? 'DOWN';
  return {
    id: 'root',
    children: data.children.map(buildElkNode),
    edges: data.edges.map((e, i) => ({
      id: `e${i}`,
      sources: [e.from],
      targets: [e.to],
      labels: e.label ? [{ text: e.label }] : [],
    })),
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.direction': direction,
      'elk.spacing.nodeNode': '40',
      'elk.layered.spacing.nodeNodeBetweenLayers': '60',
      'elk.spacing.edgeNode': '20',
      'elk.spacing.edgeEdge': '15',
    },
  };
}

// ─── Extract Positioned Results ─────────────────────────────

function collectNodes(
  elkNode: ElkPositionedNode,
  nodeMap: Map<string, ArchitectureNode>,
  offsetX: number,
  offsetY: number,
  nodes: PositionedArchNode[],
  zones: PositionedZone[],
  depth: number,
  zoneId?: string,
): void {
  const absX = offsetX + (elkNode.x ?? 0);
  const absY = offsetY + (elkNode.y ?? 0);
  const original = nodeMap.get(elkNode.id);

  if (original?.type === 'zone' && elkNode.children?.length) {
    zones.push({
      id: elkNode.id,
      label: original.label,
      x: absX,
      y: absY,
      width: elkNode.width,
      height: elkNode.height,
      depth,
    });

    for (const child of elkNode.children) {
      collectNodes(child, nodeMap, absX, absY, nodes, zones, depth + 1, elkNode.id);
    }
  } else {
    nodes.push({
      id: elkNode.id,
      label: original?.label ?? elkNode.id,
      icon: original?.icon,
      x: absX,
      y: absY,
      width: elkNode.width,
      height: elkNode.height,
      zoneId,
    });
  }
}

function flattenNodeMap(children: ArchitectureNode[], map: Map<string, ArchitectureNode>): void {
  for (const node of children) {
    map.set(node.id, node);
    if (node.children) {
      flattenNodeMap(node.children, map);
    }
  }
}

function extractEdges(
  elkEdges: ElkPositionedEdge[] | undefined,
  dataEdges: ArchitectureEdge[],
): PositionedArchEdge[] {
  if (!elkEdges) return [];
  return elkEdges.map((elkEdge, i) => {
    const dataEdge = dataEdges[i];
    const points: { x: number; y: number }[] = [];
    if (elkEdge.sections) {
      for (const section of elkEdge.sections) {
        points.push(section.startPoint);
        if (section.bendPoints) {
          points.push(...section.bendPoints);
        }
        points.push(section.endPoint);
      }
    }
    return {
      from: dataEdge?.from ?? '',
      to: dataEdge?.to ?? '',
      label: dataEdge?.label,
      type: dataEdge?.type,
      style: dataEdge?.style,
      points,
    };
  });
}

// ─── Public API ─────────────────────────────────────────────

export async function computeArchitectureLayout(
  data: ArchitectureData,
): Promise<ArchitectureLayout> {
  const ELK = await import('elkjs/lib/elk.bundled.js');
  const elk = new ELK.default();

  const elkGraph = buildElkGraph(data);
  const result = (await elk.layout(
    elkGraph as unknown as Parameters<typeof elk.layout>[0],
  )) as unknown as ElkPositionedRoot;

  const nodeMap = new Map<string, ArchitectureNode>();
  flattenNodeMap(data.children, nodeMap);

  const nodes: PositionedArchNode[] = [];
  const zones: PositionedZone[] = [];

  if (result.children) {
    for (const child of result.children) {
      collectNodes(child, nodeMap, 0, 0, nodes, zones, 0);
    }
  }

  const edges = extractEdges(result.edges, data.edges);

  // Compute bounding box
  let maxX = 0;
  let maxY = 0;
  for (const n of nodes) {
    const right = n.x + n.width;
    const bottom = n.y + n.height;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }
  for (const z of zones) {
    const right = z.x + z.width;
    const bottom = z.y + z.height;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  return {
    nodes,
    zones,
    edges,
    width: maxX + LAYOUT_PADDING,
    height: maxY + LAYOUT_PADDING,
  };
}
