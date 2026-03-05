import type { Meta, StoryObj } from '@storybook/react';
import { Columns } from './Columns.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { ColumnsData } from './Columns.js';

const meta: Meta<typeof Columns> = {
  component: Columns,
  title: 'Layout/Columns',
};

export default meta;
type Story = StoryObj<typeof Columns>;

const leftBlock = mockBlock({
  id: 'col-left',
  type: 'ui:callout',
  data: { type: 'info', content: 'Left column content.' },
});
const rightBlock = mockBlock({
  id: 'col-right',
  type: 'ui:callout',
  data: { type: 'tip', content: 'Right column content.' },
});

// ─── Equal Columns ─────────────────────────────────────────────

export const EqualColumns: Story = {
  args: mockProps<ColumnsData>(
    { children: ['left', 'right'] },
    {
      block: mockBlock({
        id: 'columns-equal',
        type: 'ui:columns',
        children: [leftBlock, rightBlock],
      }),
    },
  ),
};

// ─── Weighted Columns ──────────────────────────────────────────

export const WeightedColumns: Story = {
  args: mockProps<ColumnsData>(
    { children: ['left', 'right'], ratio: [2, 1], gap: '2rem' },
    {
      block: mockBlock({
        id: 'columns-weighted',
        type: 'ui:columns',
        children: [leftBlock, rightBlock],
      }),
    },
  ),
};

// ─── Three Columns ─────────────────────────────────────────────

const thirdBlock = mockBlock({
  id: 'col-third',
  type: 'ui:callout',
  data: { type: 'warning', content: 'Third column.' },
});

export const ThreeColumns: Story = {
  args: mockProps<ColumnsData>(
    { children: ['a', 'b', 'c'], ratio: [1, 2, 1] },
    {
      block: mockBlock({
        id: 'columns-three',
        type: 'ui:columns',
        children: [leftBlock, rightBlock, thirdBlock],
      }),
    },
  ),
};
