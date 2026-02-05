import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { SliderData } from './Slider.js';

const meta: Meta<typeof Slider> = {
  component: Slider,
  title: 'Components/Slider',
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: mockProps<SliderData>(
    {
      title: 'Configure preferences',
      parameters: [
        {
          id: 'performance',
          label: 'Performance',
          min: 0,
          max: 100,
          step: 5,
          value: 50,
          unit: '%',
        },
        { id: 'cost', label: 'Budget', min: 0, max: 10000, step: 100, unit: '$' },
        { id: 'quality', label: 'Quality', min: 1, max: 10, step: 1, value: 7 },
      ],
    },
    { block: mockBlock({ id: 'slider-default', type: 'ui:slider' }) },
  ),
};

export const SingleParameter: Story = {
  args: mockProps<SliderData>(
    {
      title: 'Confidence Level',
      parameters: [
        {
          id: 'confidence',
          label: 'How confident are you?',
          min: 0,
          max: 100,
          step: 1,
          value: 50,
          unit: '%',
        },
      ],
    },
    { block: mockBlock({ id: 'slider-single', type: 'ui:slider' }) },
  ),
};
