import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

// ─── Chart ───────────────────────────────────────────────────

export const chartSchema = z.object({
  type: z.enum(['line', 'bar', 'area', 'ohlc']),
  series: z.array(
    z.object({
      name: inlineContentSchema,
      data: z.array(z.record(z.union([z.number(), z.string()]))),
    }),
  ),
  xAxis: z.object({ key: z.string(), label: inlineContentSchema.optional() }).optional(),
  yAxis: z.object({ key: z.string(), label: inlineContentSchema.optional() }).optional(),
  legend: z.boolean().optional(),
  markdown: z.boolean().default(false),
});
