import type { Meta, StoryObj } from '@storybook/react';
import { Matrix } from './Matrix.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { MatrixData } from './Matrix.js';

const meta: Meta<typeof Matrix> = {
  component: Matrix,
  title: 'Components/Matrix',
};

export default meta;
type Story = StoryObj<typeof Matrix>;

export const Default: Story = {
  args: mockProps<MatrixData>(
    {
      title: 'Framework Evaluation',
      scale: 5,
      columns: [
        { id: 'perf', label: 'Performance', weight: 2 },
        { id: 'dx', label: 'DX', weight: 1.5 },
        { id: 'eco', label: 'Ecosystem', weight: 1 },
      ],
      rows: [
        { id: 'react', label: 'React' },
        { id: 'vue', label: 'Vue' },
        { id: 'svelte', label: 'Svelte' },
      ],
    },
    { block: mockBlock({ id: 'matrix-default', type: 'ui:matrix' }) },
  ),
};

export const NoTotals: Story = {
  args: mockProps<MatrixData>(
    {
      title: 'Simple Scoring',
      showTotals: false,
      scale: 3,
      columns: [
        { id: 'ease', label: 'Ease of Use' },
        { id: 'power', label: 'Power' },
      ],
      rows: [
        { id: 'a', label: 'Option A' },
        { id: 'b', label: 'Option B' },
      ],
    },
    { block: mockBlock({ id: 'matrix-nototals', type: 'ui:matrix' }) },
  ),
};
