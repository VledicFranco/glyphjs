import type { Meta, StoryObj } from '@storybook/react';
import { Graph } from './Graph.js';
import React from 'react';
import { mockProps, mockBlock, mockContainer } from '../__storybook__/data.js';
import type { GraphData } from './Graph.js';

const meta: Meta<typeof Graph> = {
  component: Graph,
  title: 'Components/Graph',
};

export default meta;
type Story = StoryObj<typeof Graph>;

// ─── DAG (small) ───────────────────────────────────────────────

export const DagSmall: Story = {
  args: mockProps<GraphData>(
    {
      type: 'dag',
      nodes: [
        { id: 'a', label: 'Start' },
        { id: 'b', label: 'Process' },
        { id: 'c', label: 'End' },
      ],
      edges: [
        { from: 'a', to: 'b', label: 'step 1' },
        { from: 'b', to: 'c', label: 'step 2' },
      ],
    },
    { block: mockBlock({ id: 'graph-dag-sm', type: 'ui:graph' }) },
  ),
};

// ─── DAG (medium) ──────────────────────────────────────────────

export const DagMedium: Story = {
  args: mockProps<GraphData>(
    {
      type: 'dag',
      nodes: [
        { id: 'src', label: 'Source', group: 'input' },
        { id: 'parse', label: 'Parser', group: 'processing' },
        { id: 'transform', label: 'Transform', group: 'processing' },
        { id: 'validate', label: 'Validate', group: 'processing' },
        { id: 'output', label: 'Output', group: 'output' },
        { id: 'errors', label: 'Errors', group: 'output' },
      ],
      edges: [
        { from: 'src', to: 'parse' },
        { from: 'parse', to: 'transform' },
        { from: 'parse', to: 'errors', label: 'on failure' },
        { from: 'transform', to: 'validate' },
        { from: 'validate', to: 'output' },
        { from: 'validate', to: 'errors', label: 'on failure' },
      ],
    },
    { block: mockBlock({ id: 'graph-dag-md', type: 'ui:graph' }) },
  ),
};

// ─── Flowchart ─────────────────────────────────────────────────

export const Flowchart: Story = {
  args: mockProps<GraphData>(
    {
      type: 'flowchart',
      nodes: [
        { id: 'start', label: 'Start' },
        { id: 'decision', label: 'Is valid?' },
        { id: 'yes', label: 'Process' },
        { id: 'no', label: 'Reject' },
        { id: 'end', label: 'Done' },
      ],
      edges: [
        { from: 'start', to: 'decision' },
        { from: 'decision', to: 'yes', label: 'Yes' },
        { from: 'decision', to: 'no', label: 'No' },
        { from: 'yes', to: 'end' },
        { from: 'no', to: 'end' },
      ],
    },
    { block: mockBlock({ id: 'graph-flow', type: 'ui:graph' }) },
  ),
};

// ─── Force Layout ──────────────────────────────────────────────

export const ForceLayout: Story = {
  args: mockProps<GraphData>(
    {
      type: 'force',
      nodes: [
        { id: 'hub', label: 'Hub', group: 'core' },
        { id: 'n1', label: 'Node 1', group: 'satellite' },
        { id: 'n2', label: 'Node 2', group: 'satellite' },
        { id: 'n3', label: 'Node 3', group: 'satellite' },
        { id: 'n4', label: 'Node 4', group: 'satellite' },
      ],
      edges: [
        { from: 'hub', to: 'n1' },
        { from: 'hub', to: 'n2' },
        { from: 'hub', to: 'n3' },
        { from: 'hub', to: 'n4' },
        { from: 'n1', to: 'n2' },
      ],
    },
    { block: mockBlock({ id: 'graph-force', type: 'ui:graph' }) },
  ),
};

// ─── Compact ────────────────────────────────────────────────

export const Compact: Story = {
  args: mockProps<GraphData>(
    {
      type: 'dag',
      nodes: [
        { id: 'a', label: 'Start' },
        { id: 'b', label: 'Process' },
        { id: 'c', label: 'End' },
      ],
      edges: [
        { from: 'a', to: 'b', label: 'step 1' },
        { from: 'b', to: 'c', label: 'step 2' },
      ],
    },
    {
      block: mockBlock({ id: 'graph-compact', type: 'ui:graph' }),
      container: mockContainer({ tier: 'compact', width: 400 }),
    },
  ),
  decorators: [
    (Story) =>
      React.createElement('div', { style: { maxWidth: '400px' } }, React.createElement(Story)),
  ],
};
