import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

export const pollSchema = z.object({
  question: inlineContentSchema,
  options: z.array(z.string()).min(2).max(10),
  multiple: z.boolean().default(false),
  showResults: z.boolean().default(true),
  title: z.string().optional(),
  markdown: z.boolean().default(false),
});
