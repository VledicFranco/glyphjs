import { z } from 'zod';

const annotateLabel = z.object({
  name: z.string(),
  color: z.string(),
});

const annotation = z.object({
  start: z.number().int().min(0),
  end: z.number().int().min(0),
  label: z.string(),
  note: z.string().optional(),
});

export const annotateSchema = z.object({
  title: z.string().optional(),
  labels: z.array(annotateLabel).min(1),
  text: z.string(),
  annotations: z.array(annotation).default([]),
});
