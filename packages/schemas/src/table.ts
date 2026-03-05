import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

// ─── Table ───────────────────────────────────────────────────

export const tableSchema = z.object({
  columns: z.array(
    z.object({
      key: z.string(),
      label: inlineContentSchema,
      sortable: z.boolean().optional(),
      filterable: z.boolean().optional(),
      type: z.enum(['string', 'number', 'date', 'boolean']).optional(),
    }),
  ),
  rows: z.array(z.record(z.unknown())),
  aggregation: z
    .array(
      z.object({
        column: z.string(),
        function: z.enum(['sum', 'avg', 'count', 'min', 'max']),
      }),
    )
    .optional(),
});
