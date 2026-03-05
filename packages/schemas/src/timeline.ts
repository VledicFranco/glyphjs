import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

// ─── Timeline ────────────────────────────────────────────────

export const timelineSchema = z.object({
  events: z.array(
    z.object({
      date: z.string(),
      title: inlineContentSchema,
      description: inlineContentSchema.optional(),
      type: z.string().optional(),
    }),
  ),
  orientation: z.enum(['vertical', 'horizontal']).optional(),
  markdown: z.boolean().default(false),
});
