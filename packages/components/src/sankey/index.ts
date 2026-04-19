import { sankeySchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Sankey } from './Sankey.js';
import type { SankeyData } from './Sankey.js';

export const sankeyDefinition: GlyphComponentDefinition<SankeyData> = {
  type: 'ui:sankey',
  schema: sankeySchema,
  render: Sankey,
};

export { Sankey, computeSankeyLayout } from './Sankey.js';
export type { SankeyData, SankeyNode, SankeyFlow, SankeyLayout } from './Sankey.js';
