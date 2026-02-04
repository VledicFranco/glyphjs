import { z } from 'zod';

export const accordionSchema = z.object({
  title: z.string().optional(),
  sections: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      }),
    )
    .min(1),
  defaultOpen: z.array(z.number()).optional(),
  multiple: z.boolean().default(true),
});
