import { z } from 'zod';

const fileNodeSchema: z.ZodType<{
  name: string;
  annotation?: string;
  children?: { name: string; annotation?: string; children?: unknown[] }[];
}> = z.object({
  name: z.string(),
  annotation: z.string().optional(),
  children: z.array(z.lazy(() => fileNodeSchema)).optional(),
});

export const filetreeSchema = z.object({
  root: z.string().optional(),
  tree: z.array(fileNodeSchema).min(1),
  defaultExpanded: z.boolean().default(true),
});
