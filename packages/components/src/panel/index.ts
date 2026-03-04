import { panelSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Panel } from './Panel.js';
import type { PanelData } from './Panel.js';

export const panelDefinition: GlyphComponentDefinition<PanelData> = {
  type: 'ui:panel',
  schema: panelSchema,
  render: Panel,
};

export { Panel };
export type { PanelData };
