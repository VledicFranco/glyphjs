import { z } from 'zod';

const cardActionSchema = z.object({
  label: z.string(),
  url: z.string(),
});

const cardItemSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  body: z.string().optional(),
  actions: z.array(cardActionSchema).max(3).optional(),
});

export const cardSchema = z.object({
  title: z.string().optional(),
  cards: z.array(cardItemSchema).min(1).max(12),
  variant: z.enum(['default', 'outlined', 'elevated']).default('default'),
  columns: z.number().min(1).max(4).optional(),
  markdown: z.boolean().default(false),
});
