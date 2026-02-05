import type { Meta, StoryObj } from '@storybook/react';
import { Ranker } from './Ranker.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { RankerData } from './Ranker.js';

const meta: Meta<typeof Ranker> = {
  component: Ranker,
  title: 'Components/Ranker',
};

export default meta;
type Story = StoryObj<typeof Ranker>;

export const Default: Story = {
  args: mockProps<RankerData>(
    {
      title: 'Rank by importance',
      items: [
        { id: 'auth', label: 'Authentication', description: 'User login and session management' },
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'api', label: 'API Layer' },
        { id: 'docs', label: 'Documentation' },
      ],
    },
    { block: mockBlock({ id: 'ranker-default', type: 'ui:ranker' }) },
  ),
};

export const LongList: Story = {
  args: mockProps<RankerData>(
    {
      title: 'Priority Features',
      items: [
        { id: 'perf', label: 'Performance', description: 'Speed optimizations' },
        { id: 'sec', label: 'Security', description: 'Vulnerability fixes' },
        { id: 'ux', label: 'UX Polish', description: 'User experience improvements' },
        { id: 'a11y', label: 'Accessibility', description: 'WCAG compliance' },
        { id: 'i18n', label: 'Internationalization', description: 'Multi-language support' },
        { id: 'test', label: 'Test Coverage', description: 'Automated testing' },
      ],
    },
    { block: mockBlock({ id: 'ranker-long', type: 'ui:ranker' }) },
  ),
};
