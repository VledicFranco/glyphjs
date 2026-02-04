import type { Meta, StoryObj } from '@storybook/react';
import { Infographic } from './Infographic.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { InfographicData } from './Infographic.js';

const meta: Meta<typeof Infographic> = {
  component: Infographic,
  title: 'Components/Infographic',
};

export default meta;
type Story = StoryObj<typeof Infographic>;

// ─── Default ──────────────────────────────────────────────────

export const Default: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Company Overview',
      sections: [
        {
          heading: 'Key Metrics',
          items: [
            { type: 'stat', label: 'Revenue', value: '$12.5M' },
            { type: 'stat', label: 'Customers', value: '2,340' },
            { type: 'stat', label: 'Growth', value: '+28%' },
          ],
        },
        {
          heading: 'Goals Progress',
          items: [
            { type: 'progress', label: 'Q4 Target', value: 78 },
            { type: 'progress', label: 'Customer Satisfaction', value: 92 },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-default', type: 'ui:infographic' }) },
  ),
};

// ─── StatsOnly ────────────────────────────────────────────────

export const StatsOnly: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Performance Snapshot',
      sections: [
        {
          items: [
            { type: 'stat', label: 'Uptime', value: '99.97%', description: 'Last 30 days' },
            { type: 'stat', label: 'Response Time', value: '45ms', description: 'p95 latency' },
            { type: 'stat', label: 'Throughput', value: '1.2M', description: 'Requests/day' },
            { type: 'stat', label: 'Error Rate', value: '0.02%', description: 'Last 24 hours' },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-stats', type: 'ui:infographic' }) },
  ),
};

// ─── ProgressBars ─────────────────────────────────────────────

export const ProgressBars: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Sprint Progress',
      sections: [
        {
          items: [
            { type: 'progress', label: 'Development', value: 85 },
            { type: 'progress', label: 'Testing', value: 62 },
            { type: 'progress', label: 'Documentation', value: 40 },
            { type: 'progress', label: 'Deployment', value: 15 },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-progress', type: 'ui:infographic' }) },
  ),
};

// ─── MixedItems ───────────────────────────────────────────────

export const MixedItems: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Project Report',
      sections: [
        {
          items: [
            {
              type: 'text',
              content: 'The Q4 results exceeded expectations across all key metrics.',
            },
            { type: 'stat', label: 'Revenue', value: '$8.2M' },
            { type: 'stat', label: 'Profit', value: '$2.1M' },
            { type: 'progress', label: 'Annual Target', value: 91 },
            { type: 'fact', text: 'Largest quarter in company history' },
            { type: 'fact', text: 'Customer base grew 34% year-over-year' },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-mixed', type: 'ui:infographic' }) },
  ),
};

// ─── MultipleSections ─────────────────────────────────────────

export const MultipleSections: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Quarterly Review',
      sections: [
        {
          heading: 'Financial',
          items: [
            { type: 'stat', label: 'Revenue', value: '$5.4M' },
            { type: 'stat', label: 'Expenses', value: '$3.1M' },
            { type: 'stat', label: 'Net Profit', value: '$2.3M' },
          ],
        },
        {
          heading: 'Engineering',
          items: [
            { type: 'progress', label: 'Sprint Velocity', value: 88 },
            { type: 'progress', label: 'Code Coverage', value: 76 },
            { type: 'fact', text: 'Deployed 142 features this quarter' },
          ],
        },
        {
          heading: 'Customer Success',
          items: [
            { type: 'stat', label: 'NPS Score', value: '72' },
            { type: 'stat', label: 'Churn Rate', value: '1.8%' },
            {
              type: 'text',
              content:
                'Customer satisfaction improved significantly after launching the new onboarding flow.',
            },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-multi', type: 'ui:infographic' }) },
  ),
};

// ─── WithIcons ────────────────────────────────────────────────

export const WithIcons: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Key Highlights',
      sections: [
        {
          heading: 'Achievements',
          items: [
            { type: 'fact', icon: '\u2713', text: 'Launched mobile app v2.0' },
            { type: 'fact', icon: '\u2713', text: 'Reached 1M monthly active users' },
            { type: 'fact', icon: '\u2713', text: 'Achieved SOC2 compliance' },
            { type: 'fact', icon: '\u26A0', text: 'Data migration still in progress' },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-icons', type: 'ui:infographic' }) },
  ),
};
