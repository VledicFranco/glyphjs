import { stepsSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Steps } from './Steps.js';
import type { StepsData } from './Steps.js';

export const stepsDefinition: GlyphComponentDefinition<StepsData> = {
  type: 'ui:steps',
  schema: stepsSchema,
  render: Steps,
};

export { Steps };
export type { StepsData };
