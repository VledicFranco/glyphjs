import type { GlyphComponentDefinition } from '@glyphjs/types';
import { graphSchema } from '@glyphjs/schemas';
import { Graph } from './Graph.js';
import type { GraphData } from './Graph.js';

export const graphDefinition: GlyphComponentDefinition<GraphData> = {
  type: 'ui:graph',
  schema: graphSchema,
  render: Graph,
};

export { Graph };
export type { GraphData };
export { computeDagreLayout, computeForceLayout } from './layout.js';
export type { PositionedNode, PositionedEdge, LayoutResult } from './layout.js';
