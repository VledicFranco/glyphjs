import { kpiSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Kpi } from './Kpi.js';
import type { KpiData } from './Kpi.js';

export const kpiDefinition: GlyphComponentDefinition<KpiData> = {
  type: 'ui:kpi',
  schema: kpiSchema,
  render: Kpi,
};

export { Kpi };
export type { KpiData, KpiMetric } from './Kpi.js';
