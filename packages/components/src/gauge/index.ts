import { gaugeSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Gauge } from './Gauge.js';
import type { GaugeData } from './Gauge.js';

export const gaugeDefinition: GlyphComponentDefinition<GaugeData> = {
  type: 'ui:gauge',
  schema: gaugeSchema,
  render: Gauge,
};

export { Gauge };
export type { GaugeData, GaugeZone, GaugeSentiment, GaugeShape } from './Gauge.js';
