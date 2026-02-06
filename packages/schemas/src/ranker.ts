import { z } from 'zod';

const rankerItem = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export const rankerSchema = z.object({
  title: z.string().optional(),
  items: z.array(rankerItem).min(2),
  markdown: z.boolean().default(false),
});
