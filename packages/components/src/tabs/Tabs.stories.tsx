import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { TabsData } from './Tabs.js';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  title: 'Components/Tabs',
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// ─── Two Tabs ──────────────────────────────────────────────────

export const TwoTabs: Story = {
  args: mockProps<TabsData>(
    {
      tabs: [
        { label: 'Overview', content: 'This is the overview content for the first tab.' },
        { label: 'Details', content: 'These are the detailed notes in the second tab.' },
      ],
    },
    { block: mockBlock({ id: 'tabs-2', type: 'ui:tabs' }) },
  ),
};

// ─── Three Tabs ────────────────────────────────────────────────

export const ThreeTabs: Story = {
  args: mockProps<TabsData>(
    {
      tabs: [
        { label: 'Setup', content: 'Install the package using npm or pnpm.' },
        { label: 'Configuration', content: 'Edit the config file to customize behavior.' },
        { label: 'Usage', content: 'Import the component and use it in your JSX.' },
      ],
    },
    { block: mockBlock({ id: 'tabs-3', type: 'ui:tabs' }) },
  ),
};
