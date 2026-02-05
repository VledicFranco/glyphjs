import type { Meta, StoryObj } from '@storybook/react';
import { Rating } from './Rating.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { RatingData } from './Rating.js';

const meta: Meta<typeof Rating> = {
  component: Rating,
  title: 'Components/Rating',
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Default: Story = {
  args: mockProps<RatingData>(
    {
      title: 'Rate these features',
      scale: 5,
      mode: 'star',
      labels: { low: 'Poor', high: 'Excellent' },
      items: [
        { label: 'Performance', description: 'Response time and throughput' },
        { label: 'Security' },
        { label: 'Developer Experience' },
      ],
    },
    { block: mockBlock({ id: 'rating-default', type: 'ui:rating' }) },
  ),
};

export const NumberMode: Story = {
  args: mockProps<RatingData>(
    {
      title: 'Number Rating',
      scale: 10,
      mode: 'number',
      items: [{ label: 'Overall satisfaction' }, { label: 'Ease of use' }],
    },
    { block: mockBlock({ id: 'rating-number', type: 'ui:rating' }) },
  ),
};

export const Minimal: Story = {
  args: mockProps<RatingData>(
    {
      items: [{ label: 'How was your experience?' }],
      scale: 5,
    },
    { block: mockBlock({ id: 'rating-minimal', type: 'ui:rating' }) },
  ),
};
