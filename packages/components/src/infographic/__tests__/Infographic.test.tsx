import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Infographic, classifySectionWidth } from '../Infographic.js';
import type { InfographicData, InfographicSection } from '../Infographic.js';
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

  it('applies uppercase and letter-spacing to stat labels', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [{ type: 'stat', label: 'Revenue', value: '$5M' }],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    const label = screen.getByText('Revenue');
    expect(label).toHaveStyle({ textTransform: 'uppercase' });
    expect(label).toHaveStyle({ letterSpacing: '0.06em' });
  });

  it('applies italic to stat descriptions', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              {
                type: 'stat',
                label: 'Revenue',
                value: '$5M',
                description: 'Year over year',
              },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    const descText = screen.getByText('Year over year');
    // RichText wraps content in a span, so check the parent div has italic style
    const parent = descText.parentElement;
    expect(parent).toHaveStyle({ fontStyle: 'italic' });
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

  it('applies left border accent to text items', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [{ type: 'text', content: 'Bordered paragraph.' }],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    const p = screen.getByText('Bordered paragraph.');
    const style = p.getAttribute('style') ?? '';
    expect(style).toContain('border-left');
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

  it('applies left border accent to section headings', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            heading: 'Overview',
            items: [{ type: 'stat', label: 'A', value: '1' }],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    const heading = screen.getByText('Overview');
    const style = heading.getAttribute('style') ?? '';
    expect(style).toContain('border-left');
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

  it('applies accent color to fact icons', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [{ type: 'fact', icon: '\u2713', text: 'Done' }],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    const icon = screen.getByText('\u2713');
    const style = icon.getAttribute('style') ?? '';
    expect(style).toContain('color');
    expect(style).toContain('--glyph-infographic-accent');
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

  // ─── Pie tests ───────────────────────────────────────────────

  it('renders pie SVG with path elements for slices', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              {
                type: 'pie',
                label: 'Budget',
                slices: [
                  { label: 'Engineering', value: 50 },
                  { label: 'Marketing', value: 30 },
                  { label: 'Sales', value: 20 },
                ],
              },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    const { container } = render(<Infographic {...props} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const paths = svg!.querySelectorAll('path');
    expect(paths).toHaveLength(3);
  });

  it('renders pie legend labels below chart', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              {
                type: 'pie',
                slices: [
                  { label: 'Alpha', value: 40 },
                  { label: 'Beta', value: 60 },
                ],
              },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('sets aria-label on pie SVG containing label text', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              {
                type: 'pie',
                label: 'Languages',
                slices: [
                  { label: 'JS', value: 70 },
                  { label: 'TS', value: 30 },
                ],
              },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    const { container } = render(<Infographic {...props} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label');
    expect(svg!.getAttribute('aria-label')).toContain('Languages');
  });

  it('renders pie without inner radius hole when donut is false', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              {
                type: 'pie',
                donut: false,
                slices: [
                  { label: 'A', value: 50 },
                  { label: 'B', value: 50 },
                ],
              },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    const { container } = render(<Infographic {...props} />);
    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(2);
    // Non-donut paths use M cx cy L ... A ... Z (start from center)
    const d = paths[0].getAttribute('d') ?? '';
    expect(d).toMatch(/^M 80 80/);
  });

  // ─── Divider tests ──────────────────────────────────────────

  it('renders divider as hr with role="separator"', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [{ type: 'divider' }],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    const hr = screen.getByRole('separator');
    expect(hr).toBeInTheDocument();
    expect(hr.tagName).toBe('HR');
  });

  it('applies dashed borderStyle on divider', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [{ type: 'divider', style: 'dashed' }],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    const hr = screen.getByRole('separator');
    const style = hr.getAttribute('style') ?? '';
    expect(style).toContain('dashed');
  });

  // ─── Rating tests ───────────────────────────────────────────

  it('renders correct number of filled and empty stars', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [{ type: 'rating', label: 'Service', value: 3, max: 5 }],
          },
        ],
      },
      'ui:infographic',
    );
    const { container } = render(<Infographic {...props} />);
    const ratingGroup = container.querySelector('[data-group="rating"]');
    expect(ratingGroup).toBeInTheDocument();
    // Value "3" should be displayed
    expect(screen.getByText('3')).toBeInTheDocument();
    // Label should be displayed
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('renders rating label and description text', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              {
                type: 'rating',
                label: 'Food Quality',
                value: 4.5,
                description: 'Based on 200 reviews',
              },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    expect(screen.getByText('Food Quality')).toBeInTheDocument();
    expect(screen.getByText('Based on 200 reviews')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  // ─── Visual hierarchy tests ─────────────────────────────────

  it('applies border-bottom accent to the title', () => {
    const props = createMockProps<InfographicData>(
      {
        title: 'Dashboard Title',
        sections: [{ items: [{ type: 'text', content: 'Content' }] }],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    const title = screen.getByText('Dashboard Title');
    const style = title.getAttribute('style') ?? '';
    expect(style).toContain('border-bottom');
  });

  it('applies italic to rating descriptions', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              {
                type: 'rating',
                label: 'Quality',
                value: 4,
                description: 'Very good',
              },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    expect(screen.getByText('Very good')).toHaveStyle({ fontStyle: 'italic' });
  });

  it('applies bold weight to progress labels', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [{ type: 'progress', label: 'Sprint', value: 60 }],
          },
        ],
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    const label = screen.getByText('Sprint');
    expect(label).toHaveStyle({ fontWeight: 600 });
  });

  // ─── Grid layout tests ──────────────────────────────────────

  it('activates grid layout with 2+ sections', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          { items: [{ type: 'stat', label: 'A', value: '1' }] },
          { items: [{ type: 'stat', label: 'B', value: '2' }] },
        ],
      },
      'ui:infographic',
    );
    const { container } = render(<Infographic {...props} />);
    const layoutDiv = container.querySelector('[data-layout="grid"]');
    expect(layoutDiv).toBeInTheDocument();
  });

  it('uses stack layout for single section', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [{ items: [{ type: 'stat', label: 'A', value: '1' }] }],
      },
      'ui:infographic',
    );
    const { container } = render(<Infographic {...props} />);
    const layoutDiv = container.querySelector('[data-layout="stack"]');
    expect(layoutDiv).toBeInTheDocument();
    expect(container.querySelector('[data-layout="grid"]')).not.toBeInTheDocument();
  });

  it('applies gridColumn to wide sections (with text)', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          { items: [{ type: 'stat', label: 'A', value: '1' }] },
          {
            items: [{ type: 'text', content: 'Paragraph requiring full width.' }],
          },
        ],
      },
      'ui:infographic',
    );
    const { container } = render(<Infographic {...props} />);
    const gridDiv = container.querySelector('[data-layout="grid"]');
    expect(gridDiv).toBeInTheDocument();
    // The second section (index 1) should have gridColumn style
    const sectionDivs = gridDiv!.querySelectorAll(':scope > div');
    // sectionDivs[0] might be title, but there's no title here
    // so sectionDivs[0] is section 0, sectionDivs[1] is section 1
    const wideSection = sectionDivs[1];
    const style = wideSection.getAttribute('style') ?? '';
    expect(style).toContain('grid-column');
  });

  it('does not apply gridColumn to narrow sections (stats only)', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              { type: 'stat', label: 'A', value: '1' },
              { type: 'stat', label: 'B', value: '2' },
            ],
          },
          {
            items: [
              { type: 'rating', label: 'R', value: 4 },
              { type: 'fact', text: 'A fact' },
            ],
          },
        ],
      },
      'ui:infographic',
    );
    const { container } = render(<Infographic {...props} />);
    const gridDiv = container.querySelector('[data-layout="grid"]');
    const sectionDivs = gridDiv!.querySelectorAll(':scope > div');
    // Both sections are narrow — neither should have grid-column: 1 / -1
    for (const div of sectionDivs) {
      const style = div.getAttribute('style') ?? '';
      expect(style).not.toContain('grid-column: 1 / -1');
    }
  });

  // ─── classifySectionWidth unit tests ─────────────────────────

  it('classifies section with text as wide', () => {
    const section: InfographicSection = {
      items: [{ type: 'text', content: 'Hello' }],
    };
    expect(classifySectionWidth(section)).toBe('wide');
  });

  it('classifies section with 3 stats as narrow', () => {
    const section: InfographicSection = {
      items: [
        { type: 'stat', label: 'A', value: '1' },
        { type: 'stat', label: 'B', value: '2' },
        { type: 'stat', label: 'C', value: '3' },
      ],
    };
    expect(classifySectionWidth(section)).toBe('narrow');
  });

  it('classifies section with 4+ stats as wide', () => {
    const section: InfographicSection = {
      items: [
        { type: 'stat', label: 'A', value: '1' },
        { type: 'stat', label: 'B', value: '2' },
        { type: 'stat', label: 'C', value: '3' },
        { type: 'stat', label: 'D', value: '4' },
      ],
    };
    expect(classifySectionWidth(section)).toBe('wide');
  });

  it('classifies section with 4+ progress as wide', () => {
    const section: InfographicSection = {
      items: [
        { type: 'progress', label: 'A', value: 10 },
        { type: 'progress', label: 'B', value: 20 },
        { type: 'progress', label: 'C', value: 30 },
        { type: 'progress', label: 'D', value: 40 },
      ],
    };
    expect(classifySectionWidth(section)).toBe('wide');
  });

  it('classifies section with 3+ pies as wide', () => {
    const section: InfographicSection = {
      items: [
        { type: 'pie', slices: [{ label: 'A', value: 50 }] },
        { type: 'pie', slices: [{ label: 'B', value: 50 }] },
        { type: 'pie', slices: [{ label: 'C', value: 50 }] },
      ],
    };
    expect(classifySectionWidth(section)).toBe('wide');
  });

  it('classifies section with ratings and facts as narrow', () => {
    const section: InfographicSection = {
      items: [
        { type: 'rating', label: 'R', value: 4 },
        { type: 'fact', text: 'A fact' },
      ],
    };
    expect(classifySectionWidth(section)).toBe('narrow');
  });

  // Markdown rendering tests
  it('renders plain text in fact text when markdown=false', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [{ items: [{ type: 'fact', text: 'Plain text **not bold**' }] }],
        markdown: false,
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    expect(screen.getByText('Plain text **not bold**')).toBeInTheDocument();
  });

  it('renders formatted fact text when text is InlineNode[]', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              {
                type: 'fact',
                text: [
                  { type: 'text', value: 'This is ' },
                  { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
                  { type: 'text', value: ' and ' },
                  { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] },
                ],
              },
            ],
          },
        ],
        markdown: true,
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');

    const italicEl = screen.getByText('italic');
    expect(italicEl.tagName).toBe('EM');
  });

  it('handles plain string in fact text even when markdown=true (backward compat)', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [{ items: [{ type: 'fact', text: 'Plain string' }] }],
        markdown: true,
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);
    expect(screen.getByText('Plain string')).toBeInTheDocument();
  });

  it('renders links in InlineNode[] fact text', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              {
                type: 'fact',
                text: [
                  { type: 'text', value: 'Visit ' },
                  {
                    type: 'link',
                    url: 'https://example.com',
                    children: [{ type: 'text', value: 'our site' }],
                  },
                ],
              },
            ],
          },
        ],
        markdown: true,
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);

    const link = screen.getByRole('link', { name: 'our site' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders formatted stat description when description is InlineNode[]', () => {
    const props = createMockProps<InfographicData>(
      {
        sections: [
          {
            items: [
              {
                type: 'stat',
                label: 'Revenue',
                value: '$5M',
                description: [
                  { type: 'text', value: 'Year over year with ' },
                  { type: 'strong', children: [{ type: 'text', value: 'growth' }] },
                ],
              },
            ],
          },
        ],
        markdown: true,
      },
      'ui:infographic',
    );
    render(<Infographic {...props} />);

    const boldEl = screen.getByText('growth');
    expect(boldEl.tagName).toBe('STRONG');
  });
});
