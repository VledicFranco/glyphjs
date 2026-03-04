import { z } from 'zod';

// ─── Panel ───────────────────────────────────────────────────

export const panelSchema = z.object({
  child: z.string(),
  style: z.enum(['card', 'bordered', 'elevated', 'ghost']).optional(),
  padding: z.string().optional(),
});
