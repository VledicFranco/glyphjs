import { z } from 'zod';

// ─── Relation (ER Diagram) ───────────────────────────────────

export const relationSchema = z.object({
  entities: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      attributes: z
        .array(
          z.object({
            name: z.string(),
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
      label: z.string().optional(),
      cardinality: z.enum(['1:1', '1:N', 'N:1', 'N:M']),
    }),
  ),
  layout: z.enum(['top-down', 'left-right']).optional(),
  interactionMode: z.enum(['modifier-key', 'click-to-activate', 'always']).default('modifier-key'),
  markdown: z.boolean().default(false),
});
