import { pollSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Poll } from './Poll.js';
import type { PollData } from './Poll.js';

export const pollDefinition: GlyphComponentDefinition<PollData> = {
  type: 'ui:poll',
  schema: pollSchema,
  render: Poll,
};

export { Poll };
export type { PollData };
