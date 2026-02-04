import { z } from 'zod';

const mindmapNodeSchema: z.ZodType<{
  label: string;
  children?: { label: string; children?: unknown[] }[];
}> = z.object({
  label: z.string(),
  children: z.array(z.lazy(() => mindmapNodeSchema)).optional(),
});

export const mindmapSchema = z.object({
  root: z.string(),
  children: z.array(mindmapNodeSchema).min(1),
  layout: z.enum(['radial', 'tree']).default('radial'),
});
