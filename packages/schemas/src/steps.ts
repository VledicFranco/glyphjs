import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

// ─── Steps ───────────────────────────────────────────────────

export const stepsSchema = z.object({
  steps: z.array(
    z.object({
      title: z.string(),
      status: z.enum(['pending', 'active', 'completed']).optional(),
      content: inlineContentSchema,
    }),
  ),
  markdown: z.boolean().default(false),
  _slotChildCounts: z.array(z.number()).optional(),
});
