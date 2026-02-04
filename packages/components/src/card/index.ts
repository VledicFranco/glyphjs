import { cardSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Card } from './Card.js';
import type { CardData } from './Card.js';

export const cardDefinition: GlyphComponentDefinition<CardData> = {
  type: 'ui:card',
  schema: cardSchema,
  render: Card,
};

export { Card };
export type { CardData, CardItem, CardAction } from './Card.js';
