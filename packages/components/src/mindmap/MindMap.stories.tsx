import type { Meta, StoryObj } from '@storybook/react';
import { MindMap } from './MindMap.js';
import type { MindMapData } from './MindMap.js';
import React from 'react';
import { mockProps, mockContainer } from '../__storybook__/data.js';

const meta: Meta<typeof MindMap> = {
  title: 'Components/MindMap',
  component: MindMap,
};
export default meta;

type Story = StoryObj<typeof MindMap>;

export const Default: Story = {
  args: mockProps<MindMapData>({
    root: 'JavaScript',
    children: [
      {
        label: 'Frontend',
        children: [{ label: 'React' }, { label: 'Vue' }, { label: 'Angular' }],
      },
      {
        label: 'Backend',
        children: [{ label: 'Node.js' }, { label: 'Deno' }],
      },
      {
        label: 'Tooling',
        children: [{ label: 'Vite' }, { label: 'Webpack' }, { label: 'ESLint' }],
      },
    ],
    layout: 'radial',
  }),
};

export const TreeLayout: Story = {
  args: mockProps<MindMapData>({
    root: 'Computer Science',
    children: [
      {
        label: 'Algorithms',
        children: [{ label: 'Sorting' }, { label: 'Searching' }, { label: 'Graphs' }],
      },
      {
        label: 'Data Structures',
        children: [{ label: 'Trees' }, { label: 'Hash Maps' }, { label: 'Queues' }],
      },
      {
        label: 'Languages',
        children: [{ label: 'TypeScript' }, { label: 'Rust' }, { label: 'Go' }],
      },
    ],
    layout: 'tree',
  }),
};

export const DeepNesting: Story = {
  args: mockProps<MindMapData>({
    root: 'Root',
    children: [
      {
        label: 'Level 1',
        children: [
          {
            label: 'Level 2',
            children: [
              {
                label: 'Level 3',
                children: [
                  {
                    label: 'Level 4',
                    children: [{ label: 'Level 5' }, { label: 'Level 5b' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    layout: 'radial',
  }),
};

export const SingleBranch: Story = {
  args: mockProps<MindMapData>({
    root: 'Main Topic',
    children: [
      {
        label: 'Subtopic',
        children: [{ label: 'Detail A' }, { label: 'Detail B' }],
      },
    ],
    layout: 'radial',
  }),
};

export const ManyChildren: Story = {
  args: mockProps<MindMapData>({
    root: 'Central Idea',
    children: [
      { label: 'Branch 1' },
      { label: 'Branch 2' },
      { label: 'Branch 3' },
      { label: 'Branch 4' },
      { label: 'Branch 5' },
      { label: 'Branch 6' },
      { label: 'Branch 7' },
      { label: 'Branch 8' },
    ],
    layout: 'radial',
  }),
};

// ─── Compact ────────────────────────────────────────────────

export const Compact: Story = {
  args: mockProps<MindMapData>(
    {
      root: 'JavaScript',
      children: [
        {
          label: 'Frontend',
          children: [{ label: 'React' }, { label: 'Vue' }, { label: 'Angular' }],
        },
        {
          label: 'Backend',
          children: [{ label: 'Node.js' }, { label: 'Deno' }],
        },
        {
          label: 'Tooling',
          children: [{ label: 'Vite' }, { label: 'Webpack' }, { label: 'ESLint' }],
        },
      ],
      layout: 'radial',
    },
    {
      container: mockContainer({ tier: 'compact', width: 400 }),
    },
  ),
  decorators: [
    (Story) =>
      React.createElement('div', { style: { maxWidth: '400px' } }, React.createElement(Story)),
  ],
};
