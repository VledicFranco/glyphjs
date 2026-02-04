import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Comparison } from '../Comparison.js';
import type { ComparisonData } from '../Comparison.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Comparison', () => {
  const baseData: ComparisonData = {
    title: 'Framework Comparison',
    options: [
      { name: 'React', description: 'Component library' },
      { name: 'Vue', description: 'Progressive framework' },
    ],
    features: [
      { name: 'TypeScript', values: ['yes', 'yes'] },
      { name: 'SSR', values: ['yes', 'partial'] },
      { name: 'Bundle Size', values: ['42KB', '33KB'] },
    ],
  };

  it('renders option headers', () => {
    const props = createMockProps<ComparisonData>(baseData, 'ui:comparison');
    render(<Comparison {...props} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
  });

  it('renders option descriptions', () => {
    const props = createMockProps<ComparisonData>(baseData, 'ui:comparison');
    render(<Comparison {...props} />);
    expect(screen.getByText('Component library')).toBeInTheDocument();
    expect(screen.getByText('Progressive framework')).toBeInTheDocument();
  });

  it('renders feature rows', () => {
    const props = createMockProps<ComparisonData>(baseData, 'ui:comparison');
    render(<Comparison {...props} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('SSR')).toBeInTheDocument();
    expect(screen.getByText('Bundle Size')).toBeInTheDocument();
  });

  it('renders yes/no/partial icons', () => {
    const props = createMockProps<ComparisonData>(
      {
        options: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
        features: [{ name: 'Feature', values: ['yes', 'no', 'partial'] }],
      },
      'ui:comparison',
    );
    render(<Comparison {...props} />);
    expect(screen.getByLabelText('Supported')).toBeInTheDocument();
    expect(screen.getByLabelText('Not supported')).toBeInTheDocument();
    expect(screen.getByLabelText('Partially supported')).toBeInTheDocument();
  });

  it('passes through custom text values', () => {
    const props = createMockProps<ComparisonData>(
      {
        options: [{ name: 'A' }, { name: 'B' }],
        features: [{ name: 'Size', values: ['42KB', '33KB'] }],
      },
      'ui:comparison',
    );
    render(<Comparison {...props} />);
    expect(screen.getByText('42KB')).toBeInTheDocument();
    expect(screen.getByText('33KB')).toBeInTheDocument();
  });

  it('has correct ARIA roles', () => {
    const props = createMockProps<ComparisonData>(baseData, 'ui:comparison');
    render(<Comparison {...props} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Framework Comparison');
  });

  it('uses column and row headers with scope', () => {
    const props = createMockProps<ComparisonData>(baseData, 'ui:comparison');
    const { container } = render(<Comparison {...props} />);
    const colHeaders = container.querySelectorAll('th[scope="col"]');
    // Feature + 2 options = 3
    expect(colHeaders).toHaveLength(3);
    const rowHeaders = container.querySelectorAll('th[scope="row"]');
    expect(rowHeaders).toHaveLength(3);
  });

  it('handles case-insensitive value matching', () => {
    const props = createMockProps<ComparisonData>(
      {
        options: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
        features: [{ name: 'Feature', values: ['YES', 'No', 'Partial'] }],
      },
      'ui:comparison',
    );
    render(<Comparison {...props} />);
    expect(screen.getByLabelText('Supported')).toBeInTheDocument();
    expect(screen.getByLabelText('Not supported')).toBeInTheDocument();
    expect(screen.getByLabelText('Partially supported')).toBeInTheDocument();
  });

  it('uses default aria-label when title is absent', () => {
    const props = createMockProps<ComparisonData>(
      {
        options: [{ name: 'A' }, { name: 'B' }],
        features: [{ name: 'F', values: ['yes', 'no'] }],
      },
      'ui:comparison',
    );
    render(<Comparison {...props} />);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Comparison');
  });
});
