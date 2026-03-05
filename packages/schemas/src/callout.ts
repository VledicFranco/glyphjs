import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

// ─── Callout ─────────────────────────────────────────────────

export const calloutSchema = z.object({
  type: z.enum(['info', 'warning', 'error', 'tip']),
  title: inlineContentSchema.optional(),
  content: inlineContentSchema,
  markdown: z.boolean().default(false),
});
