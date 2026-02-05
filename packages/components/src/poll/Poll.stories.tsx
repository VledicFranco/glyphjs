import type { Meta, StoryObj } from '@storybook/react';
import { Poll } from './Poll.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { PollData } from './Poll.js';

const meta: Meta<typeof Poll> = {
  component: Poll,
  title: 'Components/Poll',
};

export default meta;
type Story = StoryObj<typeof Poll>;

export const Default: Story = {
  args: mockProps<PollData>(
    {
      title: 'Framework Poll',
      question: 'Which framework do you prefer?',
      options: ['React', 'Vue', 'Angular', 'Svelte'],
    },
    { block: mockBlock({ id: 'poll-default', type: 'ui:poll' }) },
  ),
};

export const MultipleSelection: Story = {
  args: mockProps<PollData>(
    {
      question: 'Which languages do you use? (select all that apply)',
      options: ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go'],
      multiple: true,
    },
    { block: mockBlock({ id: 'poll-multi', type: 'ui:poll' }) },
  ),
};

export const NoResults: Story = {
  args: mockProps<PollData>(
    {
      question: 'What is your favorite color?',
      options: ['Red', 'Blue', 'Green', 'Yellow'],
      showResults: false,
    },
    { block: mockBlock({ id: 'poll-noresults', type: 'ui:poll' }) },
  ),
};
