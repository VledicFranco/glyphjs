import type { Meta, StoryObj } from '@storybook/react';
import { Rows } from './Rows.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { RowsData } from './Rows.js';

const meta: Meta<typeof Rows> = {
  component: Rows,
  title: 'Layout/Rows',
};

export default meta;
type Story = StoryObj<typeof Rows>;

const topBlock = mockBlock({
  id: 'row-top',
  type: 'ui:callout',
  data: { type: 'info', title: 'Top', content: 'Top row content.' },
});
const bottomBlock = mockBlock({
  id: 'row-bottom',
  type: 'ui:callout',
  data: { type: 'tip', title: 'Bottom', content: 'Bottom row content.' },
});
const thirdBlock = mockBlock({
  id: 'row-third',
  type: 'ui:callout',
  data: { type: 'warning', title: 'Third', content: 'Third row content.' },
});

// ─── Equal Rows ────────────────────────────────────────────────

export const EqualRows: Story = {
  args: mockProps<RowsData>(
    { children: ['top', 'bottom'] },
    { block: mockBlock({ id: 'rows-equal', type: 'ui:rows', children: [topBlock, bottomBlock] }) },
  ),
};

// ─── Weighted Rows ─────────────────────────────────────────────

export const WeightedRows: Story = {
  args: mockProps<RowsData>(
    { children: ['top', 'bottom'], ratio: [2, 1], gap: '0.5rem' },
    {
      block: mockBlock({ id: 'rows-weighted', type: 'ui:rows', children: [topBlock, bottomBlock] }),
    },
  ),
};

// ─── Three Rows ────────────────────────────────────────────────

export const ThreeRows: Story = {
  args: mockProps<RowsData>(
    { children: ['top', 'mid', 'bottom'] },
    {
      block: mockBlock({
        id: 'rows-three',
        type: 'ui:rows',
        children: [topBlock, thirdBlock, bottomBlock],
      }),
    },
  ),
};
