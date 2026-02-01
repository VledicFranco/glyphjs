import type { GlyphComponentDefinition } from '@glyphjs/types';
import { relationSchema } from '@glyphjs/schemas';
import { Relation } from './Relation.js';
import type { RelationData } from './Relation.js';

export const relationDefinition: GlyphComponentDefinition<RelationData> = {
  type: 'ui:relation',
  schema: relationSchema,
  render: Relation,
};

export { Relation };
export type { RelationData };
