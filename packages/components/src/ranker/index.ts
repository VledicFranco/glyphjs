import { rankerSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Ranker } from './Ranker.js';
import type { RankerData, RankerItemData } from './Ranker.js';

export const rankerDefinition: GlyphComponentDefinition<RankerData> = {
  type: 'ui:ranker',
  schema: rankerSchema,
  render: Ranker,
};

export { Ranker };
export type { RankerData, RankerItemData };
