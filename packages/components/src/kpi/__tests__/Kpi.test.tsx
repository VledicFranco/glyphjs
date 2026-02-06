import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Kpi } from '../Kpi.js';
import type { KpiData } from '../Kpi.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Kpi', () => {
  it('renders with minimal data', () => {
    const props = createMockProps<KpiData>(
      { metrics: [{ label: 'Revenue', value: '$2.3M' }] },
      'ui:kpi',
    );
    render(<Kpi {...props} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$2.3M')).toBeInTheDocument();
  });

  it('renders all metric fields', () => {
    const props = createMockProps<KpiData>(
      {
        metrics: [
          { label: 'Users', value: '48,200', delta: '+3,100', trend: 'up', unit: 'active' },
        ],
      },
      'ui:kpi',
    );
    render(<Kpi {...props} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('48,200')).toBeInTheDocument();
    expect(screen.getByText('+3,100')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders trend arrows', () => {
    const props = createMockProps<KpiData>(
      {
        metrics: [
          { label: 'Up', value: '1', trend: 'up', delta: '+1' },
          { label: 'Down', value: '2', trend: 'down', delta: '-1' },
          { label: 'Flat', value: '3', trend: 'flat', delta: '0' },
        ],
      },
      'ui:kpi',
    );
    render(<Kpi {...props} />);
    // ▲ ▼ — are the trend symbols
    expect(screen.getByText('\u25B2')).toBeInTheDocument();
    expect(screen.getByText('\u25BC')).toBeInTheDocument();
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const props = createMockProps<KpiData>(
      {
        metrics: [{ label: 'Simple', value: '42' }],
      },
      'ui:kpi',
    );
    render(<Kpi {...props} />);
    expect(screen.getByText('Simple')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    // No delta or trend elements should be rendered
    expect(screen.queryByText('\u25B2')).not.toBeInTheDocument();
    expect(screen.queryByText('\u25BC')).not.toBeInTheDocument();
  });

  it('has correct ARIA roles', () => {
    const props = createMockProps<KpiData>(
      {
        title: 'Dashboard Metrics',
        metrics: [
          { label: 'Revenue', value: '$2.3M', delta: '+15%', trend: 'up' },
          { label: 'Churn', value: '2.1%' },
        ],
      },
      'ui:kpi',
    );
    render(<Kpi {...props} />);
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Dashboard Metrics');
    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveAttribute('aria-label', 'Revenue: $2.3M, up +15%');
    expect(groups[1]).toHaveAttribute('aria-label', 'Churn: 2.1%');
  });

  it('renders title when provided', () => {
    const props = createMockProps<KpiData>(
      {
        title: 'Q4 Results',
        metrics: [{ label: 'Revenue', value: '$5M' }],
      },
      'ui:kpi',
    );
    render(<Kpi {...props} />);
    expect(screen.getByText('Q4 Results')).toBeInTheDocument();
  });

  it('uses default aria-label when title is absent', () => {
    const props = createMockProps<KpiData>({ metrics: [{ label: 'X', value: '1' }] }, 'ui:kpi');
    render(<Kpi {...props} />);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Key metrics');
  });

  it('overrides default sentiment with explicit sentiment', () => {
    const props = createMockProps<KpiData>(
      {
        metrics: [
          { label: 'Churn', value: '2.1%', delta: '-0.3%', trend: 'down', sentiment: 'positive' },
        ],
      },
      'ui:kpi',
    );
    render(<Kpi {...props} />);
    // The down arrow should still render
    expect(screen.getByText('\u25BC')).toBeInTheDocument();
    // The group label includes the trend direction
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'Churn: 2.1%, down -0.3%');
  });

  // Markdown rendering tests
  it('renders plain text in label when markdown=false', () => {
    const props = createMockProps<KpiData>(
      {
        metrics: [{ label: 'Plain text **not bold**', value: '100' }],
        markdown: false,
      },
      'ui:kpi',
    );
    render(<Kpi {...props} />);
    expect(screen.getByText('Plain text **not bold**')).toBeInTheDocument();
  });

  it('renders formatted label when label is InlineNode[]', () => {
    const props = createMockProps<KpiData>(
      {
        metrics: [
          {
            label: [
              { type: 'text', value: 'This is ' },
              { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
              { type: 'text', value: ' and ' },
              { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] },
            ],
            value: '100',
          },
        ],
        markdown: true,
      },
      'ui:kpi',
    );
    render(<Kpi {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');

    const italicEl = screen.getByText('italic');
    expect(italicEl.tagName).toBe('EM');
  });

  it('handles plain string in label even when markdown=true (backward compat)', () => {
    const props = createMockProps<KpiData>(
      {
        metrics: [{ label: 'Plain string', value: '100' }],
        markdown: true,
      },
      'ui:kpi',
    );
    render(<Kpi {...props} />);
    expect(screen.getByText('Plain string')).toBeInTheDocument();
  });

  it('renders links in InlineNode[] label', () => {
    const props = createMockProps<KpiData>(
      {
        metrics: [
          {
            label: [
              { type: 'text', value: 'Visit ' },
              {
                type: 'link',
                url: 'https://example.com',
                children: [{ type: 'text', value: 'our site' }],
              },
            ],
            value: '100',
          },
        ],
        markdown: true,
      },
      'ui:kpi',
    );
    render(<Kpi {...props} />);

    const link = screen.getByRole('link', { name: 'our site' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });
});
