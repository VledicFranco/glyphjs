import { z } from 'zod';

// ─── Callout ─────────────────────────────────────────────────

export const calloutSchema = z.object({
  type: z.enum(['info', 'warning', 'error', 'tip']),
  title: z.string().optional(),
  content: z.string(),
});
