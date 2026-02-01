import { tabsSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Tabs } from './Tabs.js';
import type { TabsData } from './Tabs.js';

export const tabsDefinition: GlyphComponentDefinition<TabsData> = {
  type: 'ui:tabs',
  schema: tabsSchema,
  render: Tabs,
};

export { Tabs };
export type { TabsData };
