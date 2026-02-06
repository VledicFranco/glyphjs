import { z } from 'zod';

// ─── KPI ──────────────────────────────────────────────────────

export const kpiSchema = z.object({
  title: z.string().optional(),
  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        delta: z.string().optional(),
        trend: z.enum(['up', 'down', 'flat']).optional(),
        sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
        unit: z.string().optional(),
      }),
    )
    .min(1)
    .max(8),
  columns: z.number().min(1).max(4).optional(),
  markdown: z.boolean().default(false),
});
