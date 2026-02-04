import { z } from 'zod';

export const sequenceSchema = z.object({
  title: z.string().optional(),
  actors: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
      }),
    )
    .min(2),
  messages: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        label: z.string(),
        type: z.enum(['message', 'reply', 'self']).default('message'),
      }),
    )
    .min(1),
});
