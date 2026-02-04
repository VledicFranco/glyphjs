import type { Meta, StoryObj } from '@storybook/react';
import { Equation } from './Equation.js';
import type { EquationData } from './Equation.js';
import { mockProps } from '../__storybook__/data.js';

const meta: Meta<typeof Equation> = {
  title: 'Components/Equation',
  component: Equation,
};
export default meta;

type Story = StoryObj<typeof Equation>;

export const Default: Story = {
  args: mockProps<EquationData>({
    expression: 'E = mc^2',
    label: 'Mass-energy equivalence',
  }),
};

export const Derivation: Story = {
  args: mockProps<EquationData>({
    steps: [
      { expression: 'f(x) = x^2 + 2x + 1', annotation: 'Original function' },
      { expression: "f'(x) = 2x + 2", annotation: 'Differentiate' },
      { expression: "f'(0) = 2", annotation: 'Evaluate at x = 0' },
    ],
    label: 'Derivative evaluation',
  }),
};

export const ComplexFormula: Story = {
  args: mockProps<EquationData>({
    expression: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
    label: 'Gaussian integral',
  }),
};

export const NoLabel: Story = {
  args: mockProps<EquationData>({
    expression: '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
  }),
};

export const SingleStep: Story = {
  args: mockProps<EquationData>({
    steps: [{ expression: 'a^2 + b^2 = c^2', annotation: 'Pythagorean theorem' }],
  }),
};
