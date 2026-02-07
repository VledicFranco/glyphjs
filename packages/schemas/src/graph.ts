import { z } from 'zod';

// ─── Graph ───────────────────────────────────────────────────

export const graphSchema = z.object({
  type: z.enum(['dag', 'flowchart', 'mindmap', 'force']),
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      type: z.string().optional(),
      style: z.record(z.string()).optional(),
      group: z.string().optional(),
    }),
  ),
  edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: z.string().optional(),
      type: z.string().optional(),
      style: z.record(z.string()).optional(),
    }),
  ),
  layout: z.enum(['top-down', 'left-right', 'bottom-up', 'radial', 'force']).optional(),
  interactionMode: z.enum(['modifier-key', 'click-to-activate', 'always']).default('modifier-key'),
  markdown: z.boolean().default(false),
});
