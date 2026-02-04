import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Infographic } from '../Infographic.js';
import type { InfographicData } from '../Infographic.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Infographic', () => {
  it('renders stat items with value and label', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              { type: 'stat', label: 'Revenue', value: '$2.3M' },
              { type: 'stat', label: 'Users', value: '48,200' },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    expect(screen.getByText('$2.3M')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('48,200')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders progress bars with correct fill width', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              { type: 'progress', label: 'Completion', value: 75 },
              { type: 'progress', label: 'Quality', value: 42 },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(2);
    expect(progressBars[0]).toHaveStyle({ width: '75%' });
    expect(progressBars[1]).toHaveStyle({ width: '42%' });
  });

  it('renders fact items with text content', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              { type: 'fact', text: 'First important fact' },
              { type: 'fact', text: 'Second important fact' },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    expect(screen.getByText('First important fact')).toBeInTheDocument();
    expect(screen.getByText('Second important fact')).toBeInTheDocument();
  });

  it('renders text items as paragraphs', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              { type: 'text', content: 'A descriptive paragraph about results.' },
              { type: 'text', content: 'Another paragraph with context.' },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    const p1 = screen.getByText('A descriptive paragraph about results.');
    const p2 = screen.getByText('Another paragraph with context.');
    expect(p1.tagName).toBe('P');
    expect(p2.tagName).toBe('P');
  });

  it('groups consecutive same-type items together', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              { type: 'stat', label: 'A', value: '1' },
              { type: 'stat', label: 'B', value: '2' },
              { type: 'progress', label: 'C', value: 50 },
              { type: 'stat', label: 'D', value: '3' },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    const { container } = render(<Infographic {...props} />);
    // Should produce 3 groups: stat, progress, stat
    const statGroups = container.querySelectorAll('[data-group="stat"]');
    const progressGroups = container.querySelectorAll('[data-group="progress"]');
    expect(statGroups).toHaveLength(2);
    expect(progressGroups).toHaveLength(1);
  });

  it('displays section headings', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            heading: 'Financial Overview',
            items: [{ type: 'stat', label: 'Revenue', value: '$5M' }],
          },
          {
            heading: 'User Metrics',
            items: [{ type: 'stat', label: 'Active Users', value: '10K' }],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    expect(screen.getByText('Financial Overview')).toBeInTheDocument();
    expect(screen.getByText('User Metrics')).toBeInTheDocument();
  });

  it('has correct ARIA roles and attributes', () => {
    const props = createMockProps<InfographicData>(
      {
        title: 'Project Summary',
        sections: [
          {
            items: [
              { type: 'progress', label: 'Sprint Progress', value: 80 },
              { type: 'progress', label: 'Test Coverage', value: 65 },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);

    // region role on container
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Project Summary');

    // progressbar roles with correct attributes
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(2);
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '80');
    expect(progressBars[0]).toHaveAttribute('aria-valuemin', '0');
    expect(progressBars[0]).toHaveAttribute('aria-valuemax', '100');
    expect(progressBars[1]).toHaveAttribute('aria-valuenow', '65');
  });

  it('uses default aria-label when title is absent', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [{ items: [{ type: 'text', content: 'Hello' }] }],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Infographic');
  });

  it('renders fact items with icon prefix', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [{ type: 'fact', icon: '\u2713', text: 'Task completed' }],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    expect(screen.getByText('\u2713')).toBeInTheDocument();
    expect(screen.getByText('Task completed')).toBeInTheDocument();
  });

  it('renders stat description when provided', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              {
                type: 'stat',
                label: 'Revenue',
                value: '$5M',
                description: 'Year over year growth',
              },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    expect(screen.getByText('Year over year growth')).toBeInTheDocument();
  });
});
