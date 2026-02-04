import { equationSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Equation } from './Equation.js';
import type { EquationData } from './Equation.js';

export const equationDefinition: GlyphComponentDefinition<EquationData> = {
  type: 'ui:equation',
  schema: equationSchema,
  render: Equation,
};

export { Equation };
export type { EquationData, EquationStep } from './Equation.js';
