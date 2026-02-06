import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import dagre from 'dagre';
import type { GlyphComponentProps } from '@glyphjs/types';
import { useZoomInteraction } from '../graph/useZoomInteraction.js';
import { InteractionOverlay } from '../graph/InteractionOverlay.js';
import { ZoomControls } from '../graph/ZoomControls.js';

// ─── Types ───────────────────────────────────────────────────

interface Attribute {
  name: string;
  type: string;
  primaryKey?: boolean;
}

interface Entity {
  id: string;
  label: string;
  attributes?: Attribute[];
}

interface Relationship {
  from: string;
  to: string;
  label?: string;
  cardinality: '1:1' | '1:N' | 'N:1' | 'N:M';
}

export interface RelationData {
  entities: Entity[];
  relationships: Relationship[];
  layout?: 'top-down' | 'left-right';
  interactionMode?: 'modifier-key' | 'click-to-activate' | 'always';
}

// ─── Layout Constants ────────────────────────────────────────

const ENTITY_MIN_WIDTH = 180;
const ENTITY_HEADER_HEIGHT = 32;
const ENTITY_ATTR_HEIGHT = 22;
const ENTITY_PADDING = 12;
const NODE_SEP = 60;
const RANK_SEP = 80;
const EDGE_SEP = 10;
const LAYOUT_PADDING = 40;
const CHAR_WIDTH = 7.5;

// ─── Entity sizing ───────────────────────────────────────────

function computeEntitySize(entity: Entity): { width: number; height: number } {
  const attrs = entity.attributes ?? [];
  const height = ENTITY_HEADER_HEIGHT + attrs.length * ENTITY_ATTR_HEIGHT + ENTITY_PADDING;

  // Width is determined by the longest text line
  let maxTextWidth = entity.label.length * (CHAR_WIDTH + 1);
  for (const attr of attrs) {
    const attrText = `${attr.name}: ${attr.type}`;
    maxTextWidth = Math.max(maxTextWidth, attrText.length * CHAR_WIDTH);
  }
  const width = Math.max(ENTITY_MIN_WIDTH, maxTextWidth + ENTITY_PADDING * 2 + 16);

  return { width, height };
}

// ─── Positioned Types ────────────────────────────────────────

interface PositionedEntity extends Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PositionedRelationship extends Relationship {
  points: { x: number; y: number }[];
}

interface RelationLayout {
  entities: PositionedEntity[];
  relationships: PositionedRelationship[];
  width: number;
  height: number;
}

// ─── Dagre Layout ────────────────────────────────────────────

function computeRelationLayout(data: RelationData): RelationLayout {
  const direction = data.layout ?? 'top-down';
  const rankdir = direction === 'left-right' ? 'LR' : 'TB';

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir,
    nodesep: NODE_SEP,
    ranksep: RANK_SEP,
    edgesep: EDGE_SEP,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const sizeMap = new Map<string, { width: number; height: number }>();
  for (const entity of data.entities) {
    const size = computeEntitySize(entity);
    sizeMap.set(entity.id, size);
    g.setNode(entity.id, {
      label: entity.label,
      width: size.width,
      height: size.height,
    });
  }

  for (const rel of data.relationships) {
    g.setEdge(rel.from, rel.to);
  }

  dagre.layout(g);

  const positionedEntities: PositionedEntity[] = data.entities.map((entity) => {
    const dagreNode = g.node(entity.id) as dagre.Node;
    const size = sizeMap.get(entity.id) ?? {
      width: ENTITY_MIN_WIDTH,
      height: ENTITY_HEADER_HEIGHT,
    };
    return {
      ...entity,
      x: dagreNode.x,
      y: dagreNode.y,
      width: size.width,
      height: size.height,
    };
  });

  const positionedRelationships: PositionedRelationship[] = data.relationships.map((rel) => {
    const dagreEdge = g.edge(rel.from, rel.to) as dagre.GraphEdge;
    return {
      ...rel,
      points: dagreEdge.points,
    };
  });

  // Compute bounding box
  let maxX = 0;
  let maxY = 0;
  for (const e of positionedEntities) {
    const right = e.x + e.width / 2;
    const bottom = e.y + e.height / 2;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  return {
    entities: positionedEntities,
    relationships: positionedRelationships,
    width: maxX + LAYOUT_PADDING,
    height: maxY + LAYOUT_PADDING,
  };
}

// ─── Crow's Foot Drawing ─────────────────────────────────────

/**
 * Returns the cardinality symbol at each end.
 * For "1:N", the "from" end is "1" and the "to" end is "N".
 */
function parseCardinality(cardinality: string): { fromSymbol: string; toSymbol: string } {
  const parts = cardinality.split(':');
  return { fromSymbol: parts[0] ?? '1', toSymbol: parts[1] ?? '1' };
}

/**
 * Draws a crow's foot symbol at a given point on an edge.
 * @param g - The D3 selection group to draw into
 * @param x - X position of the endpoint
 * @param y - Y position of the endpoint
 * @param angle - Angle in radians pointing away from the entity
 * @param symbol - "1" or "N"
 */
function drawCrowsFoot(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  angle: number,
  symbol: string,
): void {
  const len = 12;
  const spread = Math.PI / 6; // 30 degrees

  if (symbol === 'N' || symbol === 'M') {
    // Crow's foot: three lines spreading out
    const cx = x + Math.cos(angle) * len;
    const cy = y + Math.sin(angle) * len;

    // Center line
    g.append('line')
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', cx)
      .attr('y2', cy)
      .attr('stroke', 'var(--glyph-relation-line, #6b7a94)')
      .attr('stroke-width', 'var(--glyph-node-stroke-width, 1.5)');

    // Left fork
    const lx = x + Math.cos(angle + spread) * len;
    const ly = y + Math.sin(angle + spread) * len;
    g.append('line')
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', lx)
      .attr('y2', ly)
      .attr('stroke', 'var(--glyph-relation-line, #6b7a94)')
      .attr('stroke-width', 'var(--glyph-node-stroke-width, 1.5)');

    // Right fork
    const rx = x + Math.cos(angle - spread) * len;
    const ry = y + Math.sin(angle - spread) * len;
    g.append('line')
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', rx)
      .attr('y2', ry)
      .attr('stroke', 'var(--glyph-relation-line, #6b7a94)')
      .attr('stroke-width', 'var(--glyph-node-stroke-width, 1.5)');
  } else {
    // Single line perpendicular to the edge for "1"
    const perpAngle = angle + Math.PI / 2;
    const halfLen = 8;
    const tx = x + Math.cos(angle) * 6;
    const ty = y + Math.sin(angle) * 6;
    g.append('line')
      .attr('x1', tx - Math.cos(perpAngle) * halfLen)
      .attr('y1', ty - Math.sin(perpAngle) * halfLen)
      .attr('x2', tx + Math.cos(perpAngle) * halfLen)
      .attr('y2', ty + Math.sin(perpAngle) * halfLen)
      .attr('stroke', 'var(--glyph-relation-line, #6b7a94)')
      .attr('stroke-width', 'var(--glyph-node-stroke-width, 1.5)');
  }
}

// ─── SVG Rendering ───────────────────────────────────────────

function renderRelation(
  svgElement: SVGSVGElement,
  layout: RelationLayout,
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>,
): void {
  const svg = d3.select(svgElement);
  svg.selectAll('*').remove();

  const width = Math.max(layout.width, 200);
  const height = Math.max(layout.height, 200);

  svg.attr('viewBox', `0 0 ${width} ${height}`);

  // Root group for zoom/pan
  const root = svg.append('g').attr('class', 'glyph-relation-root');

  // Apply zoom behavior
  svg.call(zoomBehavior);

  // Build an entity position lookup for edge endpoint computation
  const entityMap = new Map<string, PositionedEntity>();
  for (const entity of layout.entities) {
    entityMap.set(entity.id, entity);
  }

  // ─── Relationship lines ─────────────────────────────────────

  const lineGen = d3
    .line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveBasis);

  const edgeGroup = root.append('g').attr('class', 'glyph-relation-edges');

  for (const rel of layout.relationships) {
    const edgeG = edgeGroup.append('g').attr('class', 'glyph-relation-edge');

    edgeG
      .append('path')
      .attr('d', lineGen(rel.points) ?? '')
      .attr('fill', 'none')
      .attr('stroke', 'var(--glyph-relation-line, #6b7a94)')
      .attr('stroke-width', 'var(--glyph-node-stroke-width, 1.5)');

    // Cardinality notation
    const { fromSymbol, toSymbol } = parseCardinality(rel.cardinality);

    // Crow's foot at the "from" end (first point)
    const p0 = rel.points[0];
    const p1 = rel.points[1];
    if (p0 && p1) {
      const angleFrom = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      drawCrowsFoot(edgeG, p0.x, p0.y, angleFrom, fromSymbol);
    }

    // Crow's foot at the "to" end (last point)
    const pLast = rel.points[rel.points.length - 1];
    const pPrev = rel.points[rel.points.length - 2];
    if (pLast && pPrev) {
      const angleTo = Math.atan2(pPrev.y - pLast.y, pPrev.x - pLast.x);
      drawCrowsFoot(edgeG, pLast.x, pLast.y, angleTo, toSymbol);
    }

    // Relationship label at midpoint
    if (rel.label) {
      const mid = rel.points[Math.floor(rel.points.length / 2)];
      if (mid) {
        edgeG
          .append('text')
          .attr('x', mid.x)
          .attr('y', mid.y - 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('font-family', 'Inter, system-ui, sans-serif')
          .attr('fill', 'var(--glyph-relation-label, #6b7a94)')
          .text(rel.label);
      }
    }

    // Cardinality labels near endpoints
    const pFirst = rel.points[0];
    const pSecond = rel.points[1];
    if (pFirst && pSecond) {
      const fromLabelX = pFirst.x + (pSecond.x - pFirst.x) * 0.15;
      const fromLabelY = pFirst.y + (pSecond.y - pFirst.y) * 0.15 - 10;
      edgeG
        .append('text')
        .attr('x', fromLabelX)
        .attr('y', fromLabelY)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .attr('fill', 'var(--glyph-relation-cardinality, #6b7a94)')
        .text(fromSymbol);
    }

    const pEnd = rel.points[rel.points.length - 1];
    const pBeforeEnd = rel.points[rel.points.length - 2];
    if (pEnd && pBeforeEnd) {
      const toLabelX = pEnd.x + (pBeforeEnd.x - pEnd.x) * 0.15;
      const toLabelY = pEnd.y + (pBeforeEnd.y - pEnd.y) * 0.15 - 10;
      edgeG
        .append('text')
        .attr('x', toLabelX)
        .attr('y', toLabelY)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .attr('fill', 'var(--glyph-relation-cardinality, #6b7a94)')
        .text(toSymbol);
    }
  }

  // ─── Entities ───────────────────────────────────────────────

  const entityGroup = root.append('g').attr('class', 'glyph-relation-entities');

  for (const entity of layout.entities) {
    const entityG = entityGroup.append('g').attr('class', 'glyph-relation-entity');
    const x = entity.x - entity.width / 2;
    const y = entity.y - entity.height / 2;
    const attrs = entity.attributes ?? [];

    // Entity box
    entityG
      .append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', entity.width)
      .attr('height', entity.height)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'var(--glyph-relation-entity-bg, #f4f6fa)')
      .attr('stroke', 'var(--glyph-relation-entity-border, #a8b5c8)')
      .attr('stroke-width', 'var(--glyph-node-stroke-width, 1.5)');

    // Header background
    const headerHeight = ENTITY_HEADER_HEIGHT;
    entityG
      .append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', entity.width)
      .attr('height', headerHeight)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'var(--glyph-relation-header-bg, #00d4aa)');

    // Clip the bottom corners of the header rectangle so it's flat at the bottom
    entityG
      .append('rect')
      .attr('x', x)
      .attr('y', y + headerHeight - 4)
      .attr('width', entity.width)
      .attr('height', 4)
      .attr('fill', 'var(--glyph-relation-header-bg, #00d4aa)');

    // Header label
    entityG
      .append('text')
      .attr('x', entity.x)
      .attr('y', y + headerHeight / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('fill', 'var(--glyph-relation-header-text, #fff)')
      .text(entity.label);

    // Separator line below header
    if (attrs.length > 0) {
      entityG
        .append('line')
        .attr('x1', x)
        .attr('y1', y + headerHeight)
        .attr('x2', x + entity.width)
        .attr('y2', y + headerHeight)
        .attr('stroke', 'var(--glyph-relation-entity-border, #a8b5c8)')
        .attr('stroke-width', 1);
    }

    // Attributes
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      if (!attr) continue;
      const attrY = y + headerHeight + i * ENTITY_ATTR_HEIGHT + ENTITY_ATTR_HEIGHT / 2 + 4;

      const textEl = entityG
        .append('text')
        .attr('x', x + ENTITY_PADDING)
        .attr('y', attrY)
        .attr('dy', '0.35em')
        .attr('font-size', '12px')
        .attr('font-family', 'system-ui, -apple-system, monospace')
        .attr('fill', 'var(--glyph-relation-attr-text, #1a2035)');

      // Attribute name (bold + underline if primary key)
      const nameSpan = textEl.append('tspan').text(attr.name);
      if (attr.primaryKey) {
        nameSpan.attr('font-weight', 'bold').attr('text-decoration', 'underline');
      }

      // Attribute type
      textEl
        .append('tspan')
        .attr('fill', 'var(--glyph-relation-attr-type, #6b7a94)')
        .text(`: ${attr.type}`);
    }
  }
}

// ─── Component ──────────────────────────────────────────────

export function Relation({ data, block }: GlyphComponentProps<RelationData>): ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<SVGGElement>(null);

  const layoutResult = useMemo<RelationLayout>(() => {
    return computeRelationLayout(data);
  }, [data]);

  const { overlayProps, zoomBehavior, zoomIn, zoomOut, resetZoom } = useZoomInteraction({
    svgRef,
    rootRef,
    interactionMode: data.interactionMode ?? 'modifier-key',
    blockId: block.id,
  });

  useEffect(() => {
    if (!svgRef.current) return;
    renderRelation(svgRef.current, layoutResult, zoomBehavior);
    // Store reference to the D3-created root group so zoom controls can transform it
    const rootElement = svgRef.current.querySelector('.glyph-relation-root') as SVGGElement;
    if (rootElement) {
      rootRef.current = rootElement;
    }
  }, [layoutResult, zoomBehavior]);

  // Build accessible description
  const ariaLabel = `Entity-relationship diagram with ${data.entities.length} entities and ${data.relationships.length} relationships`;

  return (
    <div className="glyph-relation-container">
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          role="img"
          aria-label={ariaLabel}
          width="100%"
          height="100%"
          style={{ minHeight: 300, maxHeight: 700, display: 'block' }}
        />
        {overlayProps && <InteractionOverlay {...overlayProps} />}
        <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />
      </div>
      {/* Hidden table fallback for screen readers */}
      <table className="sr-only" aria-label="Entity-relationship data" style={SR_ONLY_STYLE}>
        <caption>Entities and relationships</caption>
        <thead>
          <tr>
            <th scope="col">Entity</th>
            <th scope="col">Attributes</th>
            <th scope="col">Relationships</th>
          </tr>
        </thead>
        <tbody>
          {data.entities.map((entity) => {
            const attrs = (entity.attributes ?? [])
              .map((a) => `${a.name}: ${a.type}${a.primaryKey ? ' (PK)' : ''}`)
              .join(', ');
            const rels = data.relationships
              .filter((r) => r.from === entity.id || r.to === entity.id)
              .map((r) => {
                const target = r.from === entity.id ? r.to : r.from;
                const dir = r.from === entity.id ? '->' : '<-';
                return `${dir} ${target} [${r.cardinality}]${r.label ? ` (${r.label})` : ''}`;
              })
              .join(', ');
            return (
              <tr key={entity.id}>
                <td>{entity.label}</td>
                <td>{attrs}</td>
                <td>{rels}</td>
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
