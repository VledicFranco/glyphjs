import type { Meta, StoryObj } from '@storybook/react';
import { Kanban } from './Kanban.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { KanbanData } from './Kanban.js';

const meta: Meta<typeof Kanban> = {
  component: Kanban,
  title: 'Components/Kanban',
};

export default meta;
type Story = StoryObj<typeof Kanban>;

export const Default: Story = {
  args: mockProps<KanbanData>(
    {
      title: 'Sprint Board',
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          cards: [
            {
              id: 'auth',
              title: 'Implement Auth',
              description: 'OAuth2 + JWT tokens',
              priority: 'high',
              tags: ['backend', 'security'],
            },
            { id: 'dashboard', title: 'Build Dashboard', priority: 'medium' },
            { id: 'tests', title: 'Add Tests', tags: ['quality'] },
          ],
        },
        {
          id: 'progress',
          title: 'In Progress',
          limit: 3,
          cards: [
            {
              id: 'api',
              title: 'API Layer',
              description: 'REST endpoints',
              priority: 'high',
              tags: ['backend'],
            },
          ],
        },
        {
          id: 'done',
          title: 'Done',
          cards: [{ id: 'setup', title: 'Project Setup', priority: 'low' }],
        },
      ],
    },
    { block: mockBlock({ id: 'kanban-default', type: 'ui:kanban' }) },
  ),
};

export const Empty: Story = {
  args: mockProps<KanbanData>(
    {
      title: 'New Board',
      columns: [
        { id: 'backlog', title: 'Backlog', cards: [] },
        { id: 'todo', title: 'To Do', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
      ],
    },
    { block: mockBlock({ id: 'kanban-empty', type: 'ui:kanban' }) },
  ),
};
