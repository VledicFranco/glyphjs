import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

export const sequenceSchema = z.object({
  title: inlineContentSchema.optional(),
  actors: z
    .array(
      z.object({
        id: z.string(),
        label: inlineContentSchema,
      }),
    )
    .min(2),
  messages: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        label: inlineContentSchema,
        type: z.enum(['message', 'reply', 'self']).default('message'),
      }),
    )
    .min(1),
  markdown: z.boolean().default(false),
});
