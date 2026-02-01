import { z } from 'zod';

// ─── Timeline ────────────────────────────────────────────────

export const timelineSchema = z.object({
  events: z.array(
    z.object({
      date: z.string(),
      title: z.string(),
      description: z.string().optional(),
      type: z.string().optional(),
    }),
  ),
  orientation: z.enum(['vertical', 'horizontal']).optional(),
});
