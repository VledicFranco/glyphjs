import { funnelSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Funnel } from './Funnel.js';
import type { FunnelData, FunnelStage } from './Funnel.js';

export const funnelDefinition: GlyphComponentDefinition<FunnelData> = {
  type: 'ui:funnel',
  schema: funnelSchema,
  render: Funnel,
};

export { Funnel };
export type { FunnelData, FunnelStage };
