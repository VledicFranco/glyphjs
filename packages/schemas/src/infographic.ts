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

const pieSliceSchema = z.object({
  label: z.string(),
  value: z.number().positive(),
  color: z.string().optional(),
});

const pieItemSchema = z.object({
  type: z.literal('pie'),
  label: z.string().optional(),
  slices: z.array(pieSliceSchema).min(1).max(12),
  donut: z.boolean().optional(),
  size: z.number().min(80).max(300).optional(),
});

const dividerItemSchema = z.object({
  type: z.literal('divider'),
  style: z.enum(['solid', 'dashed', 'dotted']).optional(),
});

const ratingItemSchema = z.object({
  type: z.literal('rating'),
  label: z.string(),
  value: z.number().min(0).max(5),
  max: z.number().min(1).max(5).optional(),
  description: z.string().optional(),
});

const infographicItemSchema = z.discriminatedUnion('type', [
  statItemSchema,
  factItemSchema,
  progressItemSchema,
  textItemSchema,
  pieItemSchema,
  dividerItemSchema,
  ratingItemSchema,
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
