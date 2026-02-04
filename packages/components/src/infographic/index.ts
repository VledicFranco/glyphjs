import { infographicSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Infographic } from './Infographic.js';
import type { InfographicData } from './Infographic.js';

export const infographicDefinition: GlyphComponentDefinition<InfographicData> = {
  type: 'ui:infographic',
  schema: infographicSchema,
  render: Infographic,
};

export { Infographic, classifySectionWidth } from './Infographic.js';
export type {
  InfographicData,
  InfographicSection,
  InfographicItem,
  PieItem,
  PieSlice,
  DividerItem,
  RatingItem,
} from './Infographic.js';
