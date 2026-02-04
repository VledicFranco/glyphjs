import { comparisonSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Comparison } from './Comparison.js';
import type { ComparisonData } from './Comparison.js';

export const comparisonDefinition: GlyphComponentDefinition<ComparisonData> = {
  type: 'ui:comparison',
  schema: comparisonSchema,
  render: Comparison,
};

export { Comparison };
export type { ComparisonData, ComparisonOption, ComparisonFeature } from './Comparison.js';
