import { z } from 'zod';

export const pollSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2).max(10),
  multiple: z.boolean().default(false),
  showResults: z.boolean().default(true),
  title: z.string().optional(),
});
