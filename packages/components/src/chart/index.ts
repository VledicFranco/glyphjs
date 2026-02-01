import type { GlyphComponentDefinition } from '@glyphjs/types';
import { chartSchema } from '@glyphjs/schemas';
import { Chart } from './Chart.js';

export const chartDefinition: GlyphComponentDefinition = {
  type: 'ui:chart',
  schema: chartSchema,
  render: Chart as GlyphComponentDefinition['render'],
};

export { Chart };
export type { ChartData } from './Chart.js';
