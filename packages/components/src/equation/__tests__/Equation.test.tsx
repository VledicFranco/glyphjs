import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('katex', () => ({
  default: {
    renderToString: (expr: string) => '<span class="katex">' + expr + '</span>',
  },
}));

import { Equation } from '../Equation.js';
import type { EquationData } from '../Equation.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Equation', () => {
  it('renders a single expression', () => {
    const data: EquationData = { expression: 'E = mc^2' };
    const props = createMockProps<EquationData>(data, 'ui:equation');
    const { container } = render(<Equation {...props} />);
    const katexSpan = container.querySelector('.katex');
    expect(katexSpan).toBeInTheDocument();
    expect(katexSpan?.textContent).toBe('E = mc^2');
  });

  it('renders a label below the expression', () => {
    const data: EquationData = { expression: 'E = mc^2', label: 'Mass-energy equivalence' };
    const props = createMockProps<EquationData>(data, 'ui:equation');
    render(<Equation {...props} />);
    expect(screen.getByText('Mass-energy equivalence')).toBeInTheDocument();
  });

  it('renders steps', () => {
    const data: EquationData = {
      steps: [{ expression: 'x = 1' }, { expression: 'y = 2' }],
    };
    const props = createMockProps<EquationData>(data, 'ui:equation');
    const { container } = render(<Equation {...props} />);
    const katexSpans = container.querySelectorAll('.katex');
    expect(katexSpans).toHaveLength(2);
  });

  it('renders step annotations', () => {
    const data: EquationData = {
      steps: [
        { expression: 'x = 1', annotation: 'Given' },
        { expression: 'y = x + 1', annotation: 'Substitute' },
      ],
    };
    const props = createMockProps<EquationData>(data, 'ui:equation');
    render(<Equation {...props} />);
    expect(screen.getByText('Given')).toBeInTheDocument();
    expect(screen.getByText('Substitute')).toBeInTheDocument();
  });

  it('has aria-label with LaTeX source for single expression', () => {
    const data: EquationData = { expression: 'E = mc^2' };
    const props = createMockProps<EquationData>(data, 'ui:equation');
    render(<Equation {...props} />);
    const mathEl = screen.getByRole('math');
    expect(mathEl).toHaveAttribute('aria-label', 'Equation: E = mc^2');
  });

  it('has aria-label with LaTeX source for steps', () => {
    const data: EquationData = {
      steps: [{ expression: 'x = 1' }, { expression: 'y = 2' }],
    };
    const props = createMockProps<EquationData>(data, 'ui:equation');
    render(<Equation {...props} />);
    const mathEl = screen.getByRole('math');
    expect(mathEl).toHaveAttribute('aria-label', 'Equation steps: x = 1; y = 2');
  });

  it('handles missing expression gracefully', () => {
    const data: EquationData = {};
    const props = createMockProps<EquationData>(data, 'ui:equation');
    render(<Equation {...props} />);
    const mathEl = screen.getByRole('math');
    expect(mathEl).toBeInTheDocument();
    expect(screen.getByText('No equation provided')).toBeInTheDocument();
  });
});
