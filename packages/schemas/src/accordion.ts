import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

export const accordionSchema = z.object({
  title: z.string().optional(),
  sections: z
    .array(
      z.object({
        title: z.string(),
        content: inlineContentSchema,
      }),
    )
    .min(1),
  defaultOpen: z.array(z.number()).optional(),
  multiple: z.boolean().default(true),
});
