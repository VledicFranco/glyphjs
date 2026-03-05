import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

// ─── Relation (ER Diagram) ───────────────────────────────────

export const relationSchema = z.object({
  entities: z.array(
    z.object({
      id: z.string(),
      label: inlineContentSchema,
      attributes: z
        .array(
          z.object({
            name: inlineContentSchema,
            type: z.string(),
            primaryKey: z.boolean().optional(),
          }),
        )
        .optional(),
    }),
  ),
  relationships: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: inlineContentSchema.optional(),
      cardinality: z.enum(['1:1', '1:N', 'N:1', 'N:M']),
    }),
  ),
  layout: z.enum(['top-down', 'left-right']).optional(),
  interactionMode: z.enum(['modifier-key', 'click-to-activate', 'always']).default('modifier-key'),
});
