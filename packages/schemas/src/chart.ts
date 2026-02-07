import { z } from 'zod';

// ─── Chart ───────────────────────────────────────────────────

export const chartSchema = z.object({
  type: z.enum(['line', 'bar', 'area', 'ohlc']),
  series: z.array(
    z.object({
      name: z.string(),
      data: z.array(z.record(z.union([z.number(), z.string()]))),
    }),
  ),
  xAxis: z.object({ key: z.string(), label: z.string().optional() }).optional(),
  yAxis: z.object({ key: z.string(), label: z.string().optional() }).optional(),
  legend: z.boolean().optional(),
  markdown: z.boolean().default(false),
});
