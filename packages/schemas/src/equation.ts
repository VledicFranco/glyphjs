import { z } from 'zod';

export const equationSchema = z
  .object({
    expression: z.string().optional(),
    label: z.string().optional(),
    steps: z
      .array(
        z.object({
          expression: z.string(),
          annotation: z.string().optional(),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => data.expression !== undefined || (data.steps !== undefined && data.steps.length > 0),
    { message: 'Either expression or steps must be provided' },
  );
