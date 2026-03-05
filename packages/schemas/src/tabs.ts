import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

// ─── Tabs ────────────────────────────────────────────────────

export const tabsSchema = z.object({
  tabs: z.array(
    z.object({
      label: inlineContentSchema,
      content: inlineContentSchema,
    }),
  ),
  markdown: z.boolean().default(false),
  _slotChildCounts: z.array(z.number()).optional(),
});
