import { z } from 'zod';

export const flowchartSchema = z.object({
  title: z.string().optional(),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(['start', 'end', 'process', 'decision']).default('process'),
        label: z.string(),
      }),
    )
    .min(2),
  edges: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        label: z.string().optional(),
      }),
    )
    .min(1),
  direction: z.enum(['top-down', 'left-right']).default('top-down'),
});
