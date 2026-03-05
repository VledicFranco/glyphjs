import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

export const codediffSchema = z.object({
  language: z.string().optional(),
  before: z.string(),
  after: z.string(),
  beforeLabel: inlineContentSchema.optional(),
  afterLabel: inlineContentSchema.optional(),
});
