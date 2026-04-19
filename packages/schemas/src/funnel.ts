import { z } from 'zod';

// ─── Funnel ──────────────────────────────────────────────────

export const funnelSchema = z
  .object({
    title: z.string().optional(),
    stages: z
      .array(
        z.object({
          label: z.string(),
          value: z.number().nonnegative(),
          description: z.string().optional(),
        }),
      )
      .min(2)
      .max(12),
    showConversion: z.boolean().default(true),
    orientation: z.enum(['vertical', 'horizontal']).default('vertical'),
    unit: z.string().optional(),
  })
  .refine(
    (d) => {
      for (let i = 1; i < d.stages.length; i++) {
        const prev = d.stages[i - 1];
        const curr = d.stages[i];
        if (prev === undefined || curr === undefined) return false;
        if (curr.value > prev.value) return false;
      }
      return true;
    },
    { message: 'funnel stages must be monotonically non-increasing' },
  );
