import { z } from 'zod';

// ─── Rows ─────────────────────────────────────────────────────

export const rowsSchema = z.object({
  children: z.array(z.string()).min(1),
  ratio: z.array(z.number().positive()).optional(),
  gap: z.string().optional(),
});
