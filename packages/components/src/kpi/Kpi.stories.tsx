import type { Meta, StoryObj } from '@storybook/react';
import { Kpi } from './Kpi.js';
import React from 'react';
import { mockProps, mockBlock, mockContainer } from '../__storybook__/data.js';
import type { KpiData } from './Kpi.js';

const meta: Meta<typeof Kpi> = {
  component: Kpi,
  title: 'Components/Kpi',
};

export default meta;
type Story = StoryObj<typeof Kpi>;

// ─── Default ──────────────────────────────────────────────────

export const Default: Story = {
  args: mockProps<KpiData>(
    {
      title: 'Business Metrics',
      metrics: [
        { label: 'Revenue', value: '$2.3M', delta: '+15%', trend: 'up' },
        { label: 'Users', value: '48,200', delta: '+3,100', trend: 'up' },
        { label: 'Churn', value: '2.1%', delta: '-0.3%', trend: 'down', sentiment: 'positive' },
      ],
    },
    { block: mockBlock({ id: 'kpi-default', type: 'ui:kpi' }) },
  ),
};

// ─── Single Metric ────────────────────────────────────────────

export const SingleMetric: Story = {
  args: mockProps<KpiData>(
    {
      metrics: [{ label: 'Total Revenue', value: '$12.5M', delta: '+22%', trend: 'up' }],
    },
    { block: mockBlock({ id: 'kpi-single', type: 'ui:kpi' }) },
  ),
};

// ─── All Trends ───────────────────────────────────────────────

export const AllTrends: Story = {
  args: mockProps<KpiData>(
    {
      title: 'Trend Variants',
      metrics: [
        { label: 'Growth', value: '15%', delta: '+5%', trend: 'up' },
        { label: 'Decline', value: '8%', delta: '-3%', trend: 'down' },
        { label: 'Steady', value: '50%', delta: '0%', trend: 'flat' },
      ],
    },
    { block: mockBlock({ id: 'kpi-trends', type: 'ui:kpi' }) },
  ),
};

// ─── No Deltas ────────────────────────────────────────────────

export const NoDeltas: Story = {
  args: mockProps<KpiData>(
    {
      title: 'Current Snapshot',
      metrics: [
        { label: 'CPU', value: '72%' },
        { label: 'Memory', value: '4.2 GB' },
        { label: 'Disk', value: '89%' },
        { label: 'Network', value: '1.2 Gbps' },
      ],
    },
    { block: mockBlock({ id: 'kpi-no-deltas', type: 'ui:kpi' }) },
  ),
};

// ─── Four Columns ─────────────────────────────────────────────

export const FourColumns: Story = {
  args: mockProps<KpiData>(
    {
      title: 'Quarterly KPIs',
      columns: 4,
      metrics: [
        { label: 'Q1', value: '$1.2M', delta: '+8%', trend: 'up' },
        { label: 'Q2', value: '$1.5M', delta: '+25%', trend: 'up' },
        { label: 'Q3', value: '$1.3M', delta: '-13%', trend: 'down', sentiment: 'negative' },
        { label: 'Q4', value: '$2.1M', delta: '+62%', trend: 'up' },
      ],
    },
    { block: mockBlock({ id: 'kpi-four-cols', type: 'ui:kpi' }) },
  ),
};

// ─── Compact ────────────────────────────────────────────────

export const Compact: Story = {
  args: mockProps<KpiData>(
    {
      title: 'Business Metrics',
      metrics: [
        { label: 'Revenue', value: '$2.3M', delta: '+15%', trend: 'up' },
        { label: 'Users', value: '48,200', delta: '+3,100', trend: 'up' },
        { label: 'Churn', value: '2.1%', delta: '-0.3%', trend: 'down', sentiment: 'positive' },
      ],
    },
    {
      block: mockBlock({ id: 'kpi-compact', type: 'ui:kpi' }),
      container: mockContainer({ tier: 'compact', width: 400 }),
    },
  ),
  decorators: [
    (Story) =>
      React.createElement('div', { style: { maxWidth: '400px' } }, React.createElement(Story)),
  ],
};
