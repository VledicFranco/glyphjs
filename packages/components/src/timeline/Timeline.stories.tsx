import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from './Timeline.js';
import { mockProps, mockBlock } from '../__mocks__/data.js';
import type { TimelineData } from './Timeline.js';

const meta: Meta<typeof Timeline> = {
  component: Timeline,
  title: 'Components/Timeline',
};

export default meta;
type Story = StoryObj<typeof Timeline>;

// ─── Vertical ──────────────────────────────────────────────────

export const Vertical: Story = {
  args: mockProps<TimelineData>(
    {
      events: [
        { date: '2024-01-15', title: 'Project Kickoff', description: 'Initial planning and team assembly.', type: 'milestone' },
        { date: '2024-03-01', title: 'Alpha Release', description: 'First internal alpha build.', type: 'release' },
        { date: '2024-05-20', title: 'Beta Release', description: 'Public beta with limited features.', type: 'release' },
        { date: '2024-08-10', title: 'v1.0 Launch', description: 'General availability release.', type: 'milestone' },
      ],
      orientation: 'vertical',
    },
    { block: mockBlock({ id: 'timeline-vert', type: 'ui:timeline' }) },
  ),
};

// ─── Horizontal ────────────────────────────────────────────────

export const Horizontal: Story = {
  args: mockProps<TimelineData>(
    {
      events: [
        { date: '2024-01-01', title: 'Q1 Start', type: 'quarter' },
        { date: '2024-04-01', title: 'Q2 Start', type: 'quarter' },
        { date: '2024-07-01', title: 'Q3 Start', type: 'quarter' },
        { date: '2024-10-01', title: 'Q4 Start', type: 'quarter' },
      ],
      orientation: 'horizontal',
    },
    { block: mockBlock({ id: 'timeline-horiz', type: 'ui:timeline' }) },
  ),
};

// ─── With Descriptions ─────────────────────────────────────────

export const WithDescriptions: Story = {
  args: mockProps<TimelineData>(
    {
      events: [
        { date: '2023-06-01', title: 'Founded', description: 'Company incorporated in Delaware.', type: 'company' },
        { date: '2023-09-15', title: 'Seed Round', description: 'Raised $2M from angel investors.', type: 'funding' },
        { date: '2024-02-01', title: 'Series A', description: 'Raised $15M led by Acme Ventures.', type: 'funding' },
        { date: '2024-06-01', title: 'Product Launch', description: 'Launched v1.0 to the public.', type: 'product' },
        { date: '2024-11-01', title: 'Series B', description: 'Raised $50M at $200M valuation.', type: 'funding' },
      ],
      orientation: 'vertical',
    },
    { block: mockBlock({ id: 'timeline-desc', type: 'ui:timeline' }) },
  ),
};
