import { z } from 'zod';

const textField = z.object({
  type: z.literal('text'),
  id: z.string(),
  label: z.string(),
  required: z.boolean().default(false),
  default: z.string().optional(),
  placeholder: z.string().optional(),
});

const textareaField = z.object({
  type: z.literal('textarea'),
  id: z.string(),
  label: z.string(),
  required: z.boolean().default(false),
  default: z.string().optional(),
  placeholder: z.string().optional(),
  rows: z.number().int().min(1).max(20).default(4),
});

const selectField = z.object({
  type: z.literal('select'),
  id: z.string(),
  label: z.string(),
  required: z.boolean().default(false),
  options: z.array(z.string()).min(1),
  default: z.string().optional(),
});

const checkboxField = z.object({
  type: z.literal('checkbox'),
  id: z.string(),
  label: z.string(),
  default: z.boolean().default(false),
});

const rangeField = z.object({
  type: z.literal('range'),
  id: z.string(),
  label: z.string(),
  min: z.number().default(0),
  max: z.number().default(100),
  step: z.number().positive().default(1),
  default: z.number().optional(),
  unit: z.string().optional(),
});

const formField = z.discriminatedUnion('type', [
  textField,
  textareaField,
  selectField,
  checkboxField,
  rangeField,
]);

export const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  submitLabel: z.string().default('Submit'),
  fields: z.array(formField).min(1),
  markdown: z.boolean().default(false),
});
