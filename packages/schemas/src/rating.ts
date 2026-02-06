import { z } from 'zod';

const ratingItem = z.object({
  label: z.string(),
  description: z.string().optional(),
});

export const ratingSchema = z.object({
  title: z.string().optional(),
  scale: z.number().int().min(2).max(10).default(5),
  mode: z.enum(['star', 'number']).default('star'),
  labels: z
    .object({
      low: z.string(),
      high: z.string(),
    })
    .optional(),
  items: z.array(ratingItem).min(1),
  markdown: z.boolean().default(false),
});
