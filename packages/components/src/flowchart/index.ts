import { flowchartSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Flowchart } from './Flowchart.js';
import type { FlowchartData } from './Flowchart.js';

export const flowchartDefinition: GlyphComponentDefinition<FlowchartData> = {
  type: 'ui:flowchart',
  schema: flowchartSchema,
  render: Flowchart,
};

export { Flowchart } from './Flowchart.js';
export type { FlowchartData } from './Flowchart.js';
