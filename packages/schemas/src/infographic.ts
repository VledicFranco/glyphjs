import { z } from 'zod';

// ─── Infographic Item Types ─────────────────────────────────

const statItemSchema = z.object({
  type: z.literal('stat'),
  label: z.string(),
  value: z.string(),
  description: z.string().optional(),
});

const factItemSchema = z.object({
  type: z.literal('fact'),
  icon: z.string().optional(),
  text: z.string(),
});

const progressItemSchema = z.object({
  type: z.literal('progress'),
  label: z.string(),
  value: z.number().min(0).max(100),
  color: z.string().optional(),
});

const textItemSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
});

const infographicItemSchema = z.discriminatedUnion('type', [
  statItemSchema,
  factItemSchema,
  progressItemSchema,
  textItemSchema,
]);

// ─── Infographic Section ────────────────────────────────────

const infographicSectionSchema = z.object({
  heading: z.string().optional(),
  items: z.array(infographicItemSchema).min(1),
});

// ─── Infographic ────────────────────────────────────────────

export const infographicSchema = z.object({
  title: z.string().optional(),
  sections: z.array(infographicSectionSchema).min(1).max(8),
});
