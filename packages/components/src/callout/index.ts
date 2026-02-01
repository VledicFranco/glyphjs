import { calloutSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Callout } from './Callout.js';
import type { CalloutData } from './Callout.js';

export const calloutDefinition: GlyphComponentDefinition<CalloutData> = {
  type: 'ui:callout',
  schema: calloutSchema,
  render: Callout,
};

export { Callout };
export type { CalloutData };
