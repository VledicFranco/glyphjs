import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

export const flowchartSchema = z.object({
  title: inlineContentSchema.optional(),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(['start', 'end', 'process', 'decision']).default('process'),
        label: inlineContentSchema,
      }),
    )
    .min(2),
  edges: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        label: inlineContentSchema.optional(),
      }),
    )
    .min(1),
  direction: z.enum(['top-down', 'left-right']).default('top-down'),
  interactionMode: z.enum(['modifier-key', 'click-to-activate', 'always']).default('modifier-key'),
});
