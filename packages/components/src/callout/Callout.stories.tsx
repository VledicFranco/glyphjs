import type { Meta, StoryObj } from '@storybook/react';
import { Callout } from './Callout.js';
import { mockProps, mockBlock } from '../__mocks__/data.js';
import type { CalloutData } from './Callout.js';

const meta: Meta<typeof Callout> = {
  component: Callout,
  title: 'Components/Callout',
};

export default meta;
type Story = StoryObj<typeof Callout>;

// ─── Info ──────────────────────────────────────────────────────

export const Info: Story = {
  args: mockProps<CalloutData>(
    { type: 'info', title: 'Did you know?', content: 'Glyph supports multiple component types out of the box.' },
    { block: mockBlock({ id: 'callout-info', type: 'ui:callout' }) },
  ),
};

// ─── Warning ───────────────────────────────────────────────────

export const Warning: Story = {
  args: mockProps<CalloutData>(
    { type: 'warning', title: 'Caution', content: 'This action cannot be undone. Please proceed carefully.' },
    { block: mockBlock({ id: 'callout-warning', type: 'ui:callout' }) },
  ),
};

// ─── Error ─────────────────────────────────────────────────────

export const Error: Story = {
  args: mockProps<CalloutData>(
    { type: 'error', title: 'Error occurred', content: 'Failed to load the resource. Check your network connection.' },
    { block: mockBlock({ id: 'callout-error', type: 'ui:callout' }) },
  ),
};

// ─── Tip ───────────────────────────────────────────────────────

export const Tip: Story = {
  args: mockProps<CalloutData>(
    { type: 'tip', title: 'Pro tip', content: 'Use keyboard shortcuts to navigate between blocks faster.' },
    { block: mockBlock({ id: 'callout-tip', type: 'ui:callout' }) },
  ),
};

// ─── Without Title ─────────────────────────────────────────────

export const InfoWithoutTitle: Story = {
  args: mockProps<CalloutData>(
    { type: 'info', content: 'This is an info callout without a title.' },
    { block: mockBlock({ id: 'callout-no-title', type: 'ui:callout' }) },
  ),
};

export const WarningWithoutTitle: Story = {
  args: mockProps<CalloutData>(
    { type: 'warning', content: 'This is a warning callout without a title.' },
    { block: mockBlock({ id: 'callout-no-title-warn', type: 'ui:callout' }) },
  ),
};
