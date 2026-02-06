import { z } from 'zod';

// ─── Steps ───────────────────────────────────────────────────

export const stepsSchema = z.object({
  steps: z.array(
    z.object({
      title: z.string(),
      status: z.enum(['pending', 'active', 'completed']).optional(),
      content: z.string(),
    }),
  ),
  markdown: z.boolean().default(false),
});
