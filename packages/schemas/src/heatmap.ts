import { z } from 'zod';

export const heatmapSchema = z
  .object({
    title: z.string().optional(),
    rows: z.array(z.string()).min(1),
    cols: z.array(z.string()).min(1),
    values: z.array(z.array(z.number().nullable())).min(1),
    scale: z.enum(['sequential', 'diverging']).default('sequential'),
    domain: z.tuple([z.number(), z.number()]).optional(),
    unit: z.string().optional(),
    showValues: z.boolean().default(false),
    legend: z.boolean().default(true),
  })
  .refine(
    (d) => d.values.length === d.rows.length && d.values.every((r) => r.length === d.cols.length),
    { message: 'values matrix dimensions must match rows × cols' },
  );
