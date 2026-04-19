import type { Meta, StoryObj } from '@storybook/react';
import { Sankey } from './Sankey.js';
import type { SankeyData } from './Sankey.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';

const meta: Meta<typeof Sankey> = {
  title: 'Components/Sankey',
  component: Sankey,
};
export default meta;

type Story = StoryObj<typeof Sankey>;

// ─── Default — User funnel with branching ──────────────────

export const Default: Story = {
  args: mockProps<SankeyData>(
    {
      title: 'Signup funnel',
      nodes: [
        { id: 'visitors', label: 'Visitors' },
        { id: 'signup', label: 'Signed up' },
        { id: 'trial', label: 'Started trial' },
        { id: 'paid', label: 'Paid' },
        { id: 'drop', label: 'Dropped off' },
      ],
      flows: [
        { from: 'visitors', to: 'signup', value: 3000 },
        { from: 'visitors', to: 'drop', value: 7000 },
        { from: 'signup', to: 'trial', value: 1800 },
        { from: 'signup', to: 'drop', value: 1200 },
        { from: 'trial', to: 'paid', value: 600 },
        { from: 'trial', to: 'drop', value: 1200 },
      ],
      orientation: 'left-right',
      unit: 'users',
    },
    { block: mockBlock({ id: 'sankey-default', type: 'ui:sankey' }) },
  ),
};

// ─── Multi-tier budget allocation ──────────────────────────

export const BudgetAllocation: Story = {
  args: mockProps<SankeyData>(
    {
      title: 'Q3 engineering budget flow',
      nodes: [
        { id: 'budget', label: 'Total budget' },
        { id: 'product', label: 'Product' },
        { id: 'platform', label: 'Platform' },
        { id: 'security', label: 'Security' },
        { id: 'salaries', label: 'Salaries' },
        { id: 'infra', label: 'Infrastructure' },
        { id: 'tooling', label: 'Tooling' },
        { id: 'training', label: 'Training' },
        { id: 'bonus', label: 'Bonus pool' },
      ],
      flows: [
        { from: 'budget', to: 'product', value: 500 },
        { from: 'budget', to: 'platform', value: 300 },
        { from: 'budget', to: 'security', value: 200 },
        { from: 'product', to: 'salaries', value: 320 },
        { from: 'product', to: 'tooling', value: 80 },
        { from: 'product', to: 'bonus', value: 100 },
        { from: 'platform', to: 'salaries', value: 180 },
        { from: 'platform', to: 'infra', value: 90 },
        { from: 'platform', to: 'tooling', value: 30 },
        { from: 'security', to: 'salaries', value: 140 },
        { from: 'security', to: 'training', value: 60 },
      ],
      orientation: 'left-right',
      unit: 'k USD',
    },
    { block: mockBlock({ id: 'sankey-budget', type: 'ui:sankey' }) },
  ),
};

// ─── Top-down orientation ──────────────────────────────────

export const TopDown: Story = {
  args: mockProps<SankeyData>(
    {
      title: 'Traffic sources to conversions',
      nodes: [
        { id: 'organic', label: 'Organic search' },
        { id: 'social', label: 'Social' },
        { id: 'paid', label: 'Paid ads' },
        { id: 'home', label: 'Homepage' },
        { id: 'product', label: 'Product page' },
        { id: 'convert', label: 'Converted' },
        { id: 'bounce', label: 'Bounced' },
      ],
      flows: [
        { from: 'organic', to: 'home', value: 1200 },
        { from: 'social', to: 'home', value: 600 },
        { from: 'paid', to: 'home', value: 900 },
        { from: 'social', to: 'product', value: 400 },
        { from: 'paid', to: 'product', value: 800 },
        { from: 'home', to: 'product', value: 1500 },
        { from: 'home', to: 'bounce', value: 1200 },
        { from: 'product', to: 'convert', value: 900 },
        { from: 'product', to: 'bounce', value: 1800 },
      ],
      orientation: 'top-down',
      unit: 'sessions',
    },
    { block: mockBlock({ id: 'sankey-topdown', type: 'ui:sankey' }) },
  ),
};

// ─── Minimal two-node diagram ──────────────────────────────

export const MinimalTwoNode: Story = {
  args: mockProps<SankeyData>(
    {
      title: 'Single transfer',
      nodes: [
        { id: 'a', label: 'Source' },
        { id: 'b', label: 'Sink' },
      ],
      flows: [{ from: 'a', to: 'b', value: 100 }],
      unit: 'units',
    },
    { block: mockBlock({ id: 'sankey-minimal', type: 'ui:sankey' }) },
  ),
};

// ─── Many flows stress test ────────────────────────────────

export const ManyFlows: Story = {
  args: mockProps<SankeyData>(
    {
      title: 'Energy flow across sectors',
      nodes: [
        { id: 'fossil', label: 'Fossil fuels' },
        { id: 'renewable', label: 'Renewables' },
        { id: 'nuclear', label: 'Nuclear' },
        { id: 'electricity', label: 'Electricity' },
        { id: 'heat', label: 'Heat' },
        { id: 'transport', label: 'Transport fuel' },
        { id: 'residential', label: 'Residential' },
        { id: 'commercial', label: 'Commercial' },
        { id: 'industrial', label: 'Industrial' },
        { id: 'mobility', label: 'Mobility' },
        { id: 'loss', label: 'Conversion loss' },
      ],
      flows: [
        { from: 'fossil', to: 'electricity', value: 420 },
        { from: 'fossil', to: 'heat', value: 260 },
        { from: 'fossil', to: 'transport', value: 310 },
        { from: 'fossil', to: 'loss', value: 180 },
        { from: 'renewable', to: 'electricity', value: 280 },
        { from: 'renewable', to: 'heat', value: 60 },
        { from: 'renewable', to: 'loss', value: 40 },
        { from: 'nuclear', to: 'electricity', value: 150 },
        { from: 'nuclear', to: 'loss', value: 80 },
        { from: 'electricity', to: 'residential', value: 240 },
        { from: 'electricity', to: 'commercial', value: 200 },
        { from: 'electricity', to: 'industrial', value: 320 },
        { from: 'electricity', to: 'loss', value: 90 },
        { from: 'heat', to: 'residential', value: 140 },
        { from: 'heat', to: 'industrial', value: 180 },
        { from: 'transport', to: 'mobility', value: 290 },
        { from: 'transport', to: 'loss', value: 20 },
      ],
      orientation: 'left-right',
      unit: 'TWh',
    },
    { block: mockBlock({ id: 'sankey-many', type: 'ui:sankey' }) },
  ),
};
