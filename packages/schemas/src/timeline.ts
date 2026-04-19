import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

// ─── Timeline ────────────────────────────────────────────────

/**
 * An event must have at least one of `date` or `label`. We express this as a
 * union of two object variants so that the constraint translates cleanly to
 * JSON Schema (`anyOf`) — a `.refine()` would not survive zod-to-json-schema.
 *
 * `label` is the modern, free-form marker. `date` is kept for backwards
 * compatibility with existing timelines and is also a perfectly valid marker
 * (the runtime treats both as plain strings — no parsing).
 */
const baseEventFields = {
  title: inlineContentSchema,
  description: inlineContentSchema.optional(),
  type: z.string().optional(),
};

const eventWithDate = z.object({
  ...baseEventFields,
  date: z.string(),
  label: z.string().optional(),
});

const eventWithLabel = z.object({
  ...baseEventFields,
  date: z.string().optional(),
  label: z.string(),
});

export const timelineSchema = z.object({
  events: z.array(z.union([eventWithDate, eventWithLabel])),
  orientation: z.enum(['vertical', 'horizontal']).optional(),
});
