import { z } from 'zod';

const sliderParameter = z.object({
  id: z.string(),
  label: z.string(),
  min: z.number().default(0),
  max: z.number().default(100),
  step: z.number().positive().default(1),
  value: z.number().optional(),
  unit: z.string().optional(),
});

export const sliderSchema = z.object({
  title: z.string().optional(),
  layout: z.enum(['vertical', 'horizontal']).default('vertical'),
  parameters: z.array(sliderParameter).min(1),
});
