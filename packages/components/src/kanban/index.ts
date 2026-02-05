import { kanbanSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Kanban } from './Kanban.js';
import type { KanbanData, KanbanColumn, KanbanCard } from './Kanban.js';

export const kanbanDefinition: GlyphComponentDefinition<KanbanData> = {
  type: 'ui:kanban',
  schema: kanbanSchema,
  render: Kanban,
};

export { Kanban };
export type { KanbanData, KanbanColumn, KanbanCard };
