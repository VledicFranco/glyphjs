import type { Meta, StoryObj } from '@storybook/react';
import { Steps } from './Steps.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { StepsData } from './Steps.js';

const meta: Meta<typeof Steps> = {
  component: Steps,
  title: 'Components/Steps',
};

export default meta;
type Story = StoryObj<typeof Steps>;

// ─── All Pending ───────────────────────────────────────────────

export const AllPending: Story = {
  args: mockProps<StepsData>(
    {
      steps: [
        { title: 'Create project', status: 'pending', content: 'Initialize a new project with the CLI.' },
        { title: 'Install dependencies', status: 'pending', content: 'Run pnpm install to fetch packages.' },
        { title: 'Configure', status: 'pending', content: 'Set up your configuration file.' },
      ],
    },
    { block: mockBlock({ id: 'steps-pending', type: 'ui:steps' }) },
  ),
};

// ─── Mixed Status ──────────────────────────────────────────────

export const MixedStatus: Story = {
  args: mockProps<StepsData>(
    {
      steps: [
        { title: 'Create project', status: 'completed', content: 'Project initialized successfully.' },
        { title: 'Install dependencies', status: 'active', content: 'Currently installing packages...' },
        { title: 'Configure', status: 'pending', content: 'Set up your configuration file.' },
        { title: 'Deploy', status: 'pending', content: 'Deploy to production environment.' },
      ],
    },
    { block: mockBlock({ id: 'steps-mixed', type: 'ui:steps' }) },
  ),
};

// ─── All Completed ─────────────────────────────────────────────

export const AllCompleted: Story = {
  args: mockProps<StepsData>(
    {
      steps: [
        { title: 'Create project', status: 'completed', content: 'Project initialized.' },
        { title: 'Install dependencies', status: 'completed', content: 'All packages installed.' },
        { title: 'Configure', status: 'completed', content: 'Configuration applied.' },
      ],
    },
    { block: mockBlock({ id: 'steps-completed', type: 'ui:steps' }) },
  ),
};
