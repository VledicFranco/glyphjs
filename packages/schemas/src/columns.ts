import { z } from 'zod';

// ─── Columns ─────────────────────────────────────────────────

export const columnsSchema = z.object({
  children: z.array(z.string()).min(1),
  ratio: z.array(z.number().positive()).optional(),
  gap: z.string().optional(),
});
