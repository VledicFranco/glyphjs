import { z } from 'zod';

const matrixColumn = z.object({
  id: z.string(),
  label: z.string(),
  weight: z.number().positive().default(1),
});

const matrixRow = z.object({
  id: z.string(),
  label: z.string(),
});

export const matrixSchema = z.object({
  title: z.string().optional(),
  scale: z.number().int().min(2).max(10).default(5),
  showTotals: z.boolean().default(true),
  columns: z.array(matrixColumn).min(1),
  rows: z.array(matrixRow).min(1),
});
