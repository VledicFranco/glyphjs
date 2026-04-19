import { heatmapSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Heatmap } from './Heatmap.js';
import type { HeatmapData, HeatmapScale } from './Heatmap.js';

export const heatmapDefinition: GlyphComponentDefinition<HeatmapData> = {
  type: 'ui:heatmap',
  schema: heatmapSchema,
  render: Heatmap,
};

export { Heatmap };
export type { HeatmapData, HeatmapScale };
