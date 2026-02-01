import { z } from 'zod';

// ─── Tabs ────────────────────────────────────────────────────

export const tabsSchema = z.object({
  tabs: z.array(
    z.object({
      label: z.string(),
      content: z.string(),
    }),
  ),
});
