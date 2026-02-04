import { sequenceSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Sequence } from './Sequence.js';
import type { SequenceData } from './Sequence.js';

export const sequenceDefinition: GlyphComponentDefinition<SequenceData> = {
  type: 'ui:sequence',
  schema: sequenceSchema,
  render: Sequence,
};

export { Sequence } from './Sequence.js';
export type { SequenceData } from './Sequence.js';
