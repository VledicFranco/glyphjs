import { accordionSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Accordion } from './Accordion.js';
import type { AccordionData } from './Accordion.js';

export const accordionDefinition: GlyphComponentDefinition<AccordionData> = {
  type: 'ui:accordion',
  schema: accordionSchema,
  render: Accordion,
};

export { Accordion };
export type { AccordionData, AccordionSection } from './Accordion.js';
