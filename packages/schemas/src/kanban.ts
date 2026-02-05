import { z } from 'zod';

const kanbanCard = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  tags: z.array(z.string()).optional(),
});

const kanbanColumn = z.object({
  id: z.string(),
  title: z.string(),
  cards: z.array(kanbanCard).default([]),
  limit: z.number().int().positive().optional(),
});

export const kanbanSchema = z.object({
  title: z.string().optional(),
  columns: z.array(kanbanColumn).min(1),
});
