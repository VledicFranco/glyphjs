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

// ─── With Markdown ─────────────────────────────────────────────

export const WithMarkdown: Story = {
  args: mockProps<TabsData>(
    {
      markdown: true,
      tabs: [
        {
          label: [
            { type: 'text', value: 'Getting ' },
            { type: 'strong', children: [{ type: 'text', value: 'Started' }] },
          ],
          content: [
            { type: 'text', value: 'Install using ' },
            { type: 'inlineCode', value: 'npm install glyphjs' },
            { type: 'text', value: ' or check the ' },
            {
              type: 'link',
              url: 'https://glyphjs.dev',
              children: [{ type: 'text', value: 'documentation' }],
            },
            { type: 'text', value: '.' },
          ],
        },
        {
          label: [
            { type: 'text', value: 'API ' },
            { type: 'emphasis', children: [{ type: 'text', value: 'Reference' }] },
          ],
          content: [
            { type: 'text', value: 'The ' },
            { type: 'inlineCode', value: 'compile()' },
            { type: 'text', value: ' function accepts ' },
            { type: 'strong', children: [{ type: 'text', value: 'markdown' }] },
            { type: 'text', value: ' strings and returns IR.' },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'tabs-md', type: 'ui:tabs' }) },
  ),
};
