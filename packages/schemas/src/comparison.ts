import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

export const comparisonSchema = z
  .object({
    title: z.string().optional(),
    options: z
      .array(
        z.object({
          name: z.string(),
          description: inlineContentSchema.optional(),
        }),
      )
      .min(2)
      .max(6),
    features: z
      .array(
        z.object({
          name: z.string(),
          values: z.array(inlineContentSchema),
        }),
      )
      .min(1),
  })
  .refine((data) => data.features.every((f) => f.values.length === data.options.length), {
    message: 'Each feature must have one value per option',
  });
