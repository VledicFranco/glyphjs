import { ratingSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Rating } from './Rating.js';
import type { RatingData, RatingItem } from './Rating.js';

export const ratingDefinition: GlyphComponentDefinition<RatingData> = {
  type: 'ui:rating',
  schema: ratingSchema,
  render: Rating,
};

export { Rating };
export type { RatingData, RatingItem };
