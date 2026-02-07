import { z } from 'zod';

export const codediffSchema = z.object({
  language: z.string().optional(),
  before: z.string(),
  after: z.string(),
  beforeLabel: z.string().optional(),
  afterLabel: z.string().optional(),
  markdown: z.boolean().default(false),
});
