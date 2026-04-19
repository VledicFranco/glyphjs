import type { Meta, StoryObj } from '@storybook/react';
import { Heatmap } from './Heatmap.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { HeatmapData } from './Heatmap.js';

const meta: Meta<typeof Heatmap> = {
  component: Heatmap,
  title: 'Components/Heatmap',
};

export default meta;
type Story = StoryObj<typeof Heatmap>;

// ─── Default (sequential) ─────────────────────────────────────────

export const Default: Story = {
  args: mockProps<HeatmapData>(
    {
      title: 'Data freshness across leaders',
      rows: ['Alice', 'Bob', 'Carol', 'Dave'],
      cols: ['Mongo', 'Sheets', 'HubSpot', 'GitHub', 'Sentry'],
      values: [
        [2, 8, 0.5, 1, 3],
        [4, 1, 2, 12, 0.5],
        [1, 0, 6, 3, 18],
        [24, 1, 2, 4, 2],
      ],
      scale: 'sequential',
      domain: [0, 24],
      unit: 'hours',
      showValues: true,
      legend: true,
    },
    { block: mockBlock({ id: 'heatmap-default', type: 'ui:heatmap' }) },
  ),
};

// ─── Diverging ────────────────────────────────────────────────────

export const Diverging: Story = {
  args: mockProps<HeatmapData>(
    {
      title: 'Week-over-week change (%)',
      rows: ['Search', 'Onboarding', 'Checkout', 'Account'],
      cols: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      values: [
        [-12, -4, 1, 6, 15],
        [-8, -2, -1, 3, 9],
        [-20, -15, -5, 2, 4],
        [5, 8, 10, 12, 14],
      ],
      scale: 'diverging',
      domain: [-20, 20],
      unit: '%',
      showValues: true,
      legend: true,
    },
    { block: mockBlock({ id: 'heatmap-diverging', type: 'ui:heatmap' }) },
  ),
};

// ─── With null cells ──────────────────────────────────────────────

export const WithNullCells: Story = {
  args: mockProps<HeatmapData>(
    {
      title: 'Availability by region',
      rows: ['US-East', 'US-West', 'EU', 'APAC'],
      cols: ['Web', 'Mobile', 'Desktop', 'TV'],
      values: [
        [99.9, 99.8, 99.7, null],
        [99.5, 99.9, 99.6, 98.2],
        [99.9, 99.9, null, null],
        [98.1, 99.2, null, null],
      ],
      scale: 'sequential',
      domain: [95, 100],
      unit: '%',
      showValues: true,
      legend: true,
    },
    { block: mockBlock({ id: 'heatmap-nulls', type: 'ui:heatmap' }) },
  ),
};

// ─── Contribution calendar (many cells, no numeric labels) ────────

function makeContributionRow(seed: number, len: number): number[] {
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < len; i++) {
    // Deterministic pseudo-random walk in [0, 8]
    x = (x * 9301 + 49297) % 233280;
    const r = x / 233280;
    out.push(Math.round(r * 8));
  }
  return out;
}

export const ContributionCalendar: Story = {
  args: mockProps<HeatmapData>(
    {
      title: 'Contributions — last 12 weeks',
      rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      cols: Array.from({ length: 12 }, (_, i) => `W${String(i + 1)}`),
      values: [
        makeContributionRow(17, 12),
        makeContributionRow(42, 12),
        makeContributionRow(97, 12),
        makeContributionRow(3, 12),
        makeContributionRow(128, 12),
        makeContributionRow(61, 12),
        makeContributionRow(211, 12),
      ],
      scale: 'sequential',
      domain: [0, 8],
      unit: 'commits',
      showValues: false,
      legend: true,
    },
    { block: mockBlock({ id: 'heatmap-calendar', type: 'ui:heatmap' }) },
  ),
};

// ─── Correlation matrix (symmetric, diverging) ────────────────────

export const CorrelationMatrix: Story = {
  args: mockProps<HeatmapData>(
    {
      title: 'Feature correlations',
      rows: ['revenue', 'signups', 'retention', 'churn', 'nps'],
      cols: ['revenue', 'signups', 'retention', 'churn', 'nps'],
      values: [
        [1, 0.82, 0.65, -0.54, 0.41],
        [0.82, 1, 0.58, -0.47, 0.36],
        [0.65, 0.58, 1, -0.71, 0.52],
        [-0.54, -0.47, -0.71, 1, -0.39],
        [0.41, 0.36, 0.52, -0.39, 1],
      ],
      scale: 'diverging',
      domain: [-1, 1],
      showValues: true,
      legend: true,
    },
    { block: mockBlock({ id: 'heatmap-correlation', type: 'ui:heatmap' }) },
  ),
};
