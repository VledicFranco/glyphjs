import { z } from 'zod';

export const comparisonSchema = z
  .object({
    title: z.string().optional(),
    options: z
      .array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
        }),
      )
      .min(2)
      .max(6),
    features: z
      .array(
        z.object({
          name: z.string(),
          values: z.array(z.string()),
        }),
      )
      .min(1),
    markdown: z.boolean().default(false),
  })
  .refine((data) => data.features.every((f) => f.values.length === data.options.length), {
    message: 'Each feature must have one value per option',
  });
