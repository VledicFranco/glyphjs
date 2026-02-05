import { formSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Form } from './Form.js';
import type { FormData, FormField } from './Form.js';

export const formDefinition: GlyphComponentDefinition<FormData> = {
  type: 'ui:form',
  schema: formSchema,
  render: Form,
};

export { Form };
export type { FormData, FormField };
