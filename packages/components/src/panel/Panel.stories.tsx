import type { Meta, StoryObj } from '@storybook/react';
import { Panel } from './Panel.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { PanelData } from './Panel.js';

const meta: Meta<typeof Panel> = {
  component: Panel,
  title: 'Layout/Panel',
};

export default meta;
type Story = StoryObj<typeof Panel>;

const innerBlock = mockBlock({
  id: 'panel-inner',
  type: 'ui:callout',
  data: { type: 'info', title: 'Inside Panel', content: 'Panel wraps any block.', markdown: false },
});

// ─── Card ──────────────────────────────────────────────────────

export const Card: Story = {
  args: mockProps<PanelData>(
    { child: 'content', style: 'card' },
    { block: mockBlock({ id: 'panel-card', type: 'ui:panel', children: [innerBlock] }) },
  ),
};

// ─── Bordered ──────────────────────────────────────────────────

export const Bordered: Story = {
  args: mockProps<PanelData>(
    { child: 'content', style: 'bordered', padding: '1.5rem' },
    { block: mockBlock({ id: 'panel-bordered', type: 'ui:panel', children: [innerBlock] }) },
  ),
};

// ─── Elevated ──────────────────────────────────────────────────

export const Elevated: Story = {
  args: mockProps<PanelData>(
    { child: 'content', style: 'elevated', padding: '2rem' },
    { block: mockBlock({ id: 'panel-elevated', type: 'ui:panel', children: [innerBlock] }) },
  ),
};

// ─── Ghost ─────────────────────────────────────────────────────

export const Ghost: Story = {
  args: mockProps<PanelData>(
    { child: 'content', style: 'ghost' },
    { block: mockBlock({ id: 'panel-ghost', type: 'ui:panel', children: [innerBlock] }) },
  ),
};
