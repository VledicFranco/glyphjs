import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

export const equationSchema = z
  .object({
    expression: z.string().optional(),
    label: inlineContentSchema.optional(),
    steps: z
      .array(
        z.object({
          expression: z.string(),
          annotation: inlineContentSchema.optional(),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => data.expression !== undefined || (data.steps !== undefined && data.steps.length > 0),
    { message: 'Either expression or steps must be provided' },
  );
