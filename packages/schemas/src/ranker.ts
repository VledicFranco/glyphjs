import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

const rankerItem = z.object({
  id: z.string(),
  label: inlineContentSchema,
  description: z.string().optional(),
});

export const rankerSchema = z.object({
  title: z.string().optional(),
  items: z.array(rankerItem).min(2),
});
