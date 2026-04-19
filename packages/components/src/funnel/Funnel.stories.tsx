import type { Meta, StoryObj } from '@storybook/react';
import { Funnel } from './Funnel.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { FunnelData } from './Funnel.js';

const meta: Meta<typeof Funnel> = {
  component: Funnel,
  title: 'Components/Funnel',
};

export default meta;
type Story = StoryObj<typeof Funnel>;

// ─── Default (vertical) ────────────────────────────────────────

export const Default: Story = {
  args: mockProps<FunnelData>(
    {
      title: 'Action acceptance (last 30 days)',
      stages: [
        { label: 'Recommended', value: 420 },
        { label: 'Reviewed', value: 310 },
        { label: 'Accepted', value: 180 },
        { label: 'Executed', value: 155 },
      ],
      showConversion: true,
      orientation: 'vertical',
      unit: 'actions',
    },
    { block: mockBlock({ id: 'funnel-default', type: 'ui:funnel' }) },
  ),
};

// ─── Horizontal ────────────────────────────────────────────────

export const Horizontal: Story = {
  args: mockProps<FunnelData>(
    {
      title: 'Signup funnel',
      stages: [
        { label: 'Visited', value: 10000 },
        { label: 'Started', value: 4800 },
        { label: 'Completed', value: 2100 },
        { label: 'Verified', value: 1820 },
      ],
      showConversion: true,
      orientation: 'horizontal',
      unit: 'users',
    },
    { block: mockBlock({ id: 'funnel-horizontal', type: 'ui:funnel' }) },
  ),
};

// ─── With stage descriptions ───────────────────────────────────

export const WithDescriptions: Story = {
  args: mockProps<FunnelData>(
    {
      title: 'Multi-step form completion',
      stages: [
        { label: 'Opened', value: 2400, description: 'Form landing page viewed' },
        { label: 'Step 1', value: 1820, description: 'Basic info submitted' },
        { label: 'Step 2', value: 1200, description: 'Payment details entered' },
        { label: 'Submitted', value: 980, description: 'Final submission confirmed' },
      ],
      showConversion: true,
      orientation: 'vertical',
      unit: 'sessions',
    },
    { block: mockBlock({ id: 'funnel-descriptions', type: 'ui:funnel' }) },
  ),
};

// ─── Without conversion annotations ────────────────────────────

export const NoConversion: Story = {
  args: mockProps<FunnelData>(
    {
      title: 'Simple pipeline',
      stages: [
        { label: 'Leads', value: 820 },
        { label: 'Qualified', value: 410 },
        { label: 'Won', value: 92 },
      ],
      showConversion: false,
      orientation: 'vertical',
    },
    { block: mockBlock({ id: 'funnel-no-conversion', type: 'ui:funnel' }) },
  ),
};

// ─── Deep funnel (8+ stages) ───────────────────────────────────

export const DeepFunnel: Story = {
  args: mockProps<FunnelData>(
    {
      title: 'Full customer acquisition funnel',
      stages: [
        { label: 'Impressions', value: 100000 },
        { label: 'Clicks', value: 24000 },
        { label: 'Landing views', value: 21800 },
        { label: 'Sign-ups', value: 4600 },
        { label: 'Email verified', value: 3900 },
        { label: 'First action', value: 2400 },
        { label: 'Paid', value: 420 },
        { label: 'Retained (30d)', value: 310 },
      ],
      showConversion: true,
      orientation: 'vertical',
    },
    { block: mockBlock({ id: 'funnel-deep', type: 'ui:funnel' }) },
  ),
};
