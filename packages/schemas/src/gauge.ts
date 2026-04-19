import { z } from 'zod';

// ─── Gauge ─────────────────────────────────────────────────────

export const gaugeSchema = z
  .object({
    label: z.string(),
    value: z.number(),
    min: z.number().default(0),
    max: z.number(),
    unit: z.string().optional(),
    zones: z
      .array(
        z.object({
          max: z.number(),
          label: z.string().optional(),
          sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
        }),
      )
      .min(1)
      .max(6)
      .optional(),
    target: z.number().optional(),
    shape: z.enum(['semicircle', 'full']).default('semicircle'),
  })
  .refine((d) => d.min < d.max, { message: 'min must be less than max' })
  .refine((d) => d.value >= d.min && d.value <= d.max, {
    message: 'value must fall within [min, max]',
  });
