import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Accordion } from '../Accordion.js';
import type { AccordionData } from '../Accordion.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Accordion', () => {
  it('renders all section titles', () => {
    const props = createMockProps<AccordionData>(
      {
        sections: [
          { title: 'Section A', content: 'Content A' },
          { title: 'Section B', content: 'Content B' },
        ],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);
    expect(screen.getByText('Section A')).toBeInTheDocument();
    expect(screen.getByText('Section B')).toBeInTheDocument();
  });

  it('renders defaultOpen sections as expanded', () => {
    const props = createMockProps<AccordionData>(
      {
        sections: [
          { title: 'Open', content: 'Visible content' },
          { title: 'Closed', content: 'Hidden content' },
        ],
        defaultOpen: [0],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);
    const details = screen.getAllByRole('group');
    expect(details[0]).toHaveAttribute('open');
    expect(details[1]).not.toHaveAttribute('open');
  });

  it('toggles section visibility on click', () => {
    const props = createMockProps<AccordionData>(
      {
        sections: [{ title: 'Toggle Me', content: 'Toggle content' }],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);
    const summary = screen.getByText('Toggle Me');
    fireEvent.click(summary);
    const details = summary.closest('details');
    expect(details).toHaveAttribute('open');
  });

  it('closes other sections in exclusive mode', () => {
    const props = createMockProps<AccordionData>(
      {
        sections: [
          { title: 'First', content: 'Content 1' },
          { title: 'Second', content: 'Content 2' },
        ],
        multiple: false,
        defaultOpen: [0],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);
    const details = screen.getAllByRole('group');
    expect(details[0]).toHaveAttribute('open');

    // Open the second section — simulate browser behavior
    (details[1] as HTMLDetailsElement).open = true;
    fireEvent(details[1], new Event('toggle'));

    expect(details[1]).toHaveAttribute('open');
    // First should have been closed by the handler
    expect(details[0]).not.toHaveAttribute('open');
  });

  it('has correct ARIA roles and labels', () => {
    const props = createMockProps<AccordionData>(
      {
        title: 'FAQ',
        sections: [
          { title: 'Question 1', content: 'Answer 1' },
          { title: 'Question 2', content: 'Answer 2' },
        ],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'FAQ');
  });

  it('uses default aria-label when title is absent', () => {
    const props = createMockProps<AccordionData>(
      {
        sections: [{ title: 'Item', content: 'Detail' }],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Accordion');
  });

  it('renders title when provided', () => {
    const props = createMockProps<AccordionData>(
      {
        title: 'My Accordion',
        sections: [{ title: 'Item', content: 'Detail' }],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);
    expect(screen.getByText('My Accordion')).toBeInTheDocument();
  });

  it('renders content text for open sections', () => {
    const props = createMockProps<AccordionData>(
      {
        sections: [{ title: 'Open Section', content: 'This content is visible' }],
        defaultOpen: [0],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);
    expect(screen.getByText('This content is visible')).toBeInTheDocument();
  });

  // Markdown rendering tests
  it('renders plain text in content when markdown=false', () => {
    const props = createMockProps<AccordionData>(
      {
        sections: [{ title: 'Section', content: 'Plain text **not bold**' }],
        markdown: false,
        defaultOpen: [0],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);
    expect(screen.getByText('Plain text **not bold**')).toBeInTheDocument();
  });

  it('renders formatted content when content is InlineNode[]', () => {
    const props = createMockProps<AccordionData>(
      {
        sections: [
          {
            title: 'Section',
            content: [
              { type: 'text', value: 'This is ' },
              { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
              { type: 'text', value: ' and ' },
              { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] },
            ],
          },
        ],
        markdown: true,
        defaultOpen: [0],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');

    const italicEl = screen.getByText('italic');
    expect(italicEl.tagName).toBe('EM');
  });

  it('handles plain string in content even when markdown=true (backward compat)', () => {
    const props = createMockProps<AccordionData>(
      {
        sections: [{ title: 'Section', content: 'Plain string' }],
        markdown: true,
        defaultOpen: [0],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);
    expect(screen.getByText('Plain string')).toBeInTheDocument();
  });

  it('renders links in InlineNode[] content', () => {
    const props = createMockProps<AccordionData>(
      {
        sections: [
          {
            title: 'Section',
            content: [
              { type: 'text', value: 'Visit ' },
              {
                type: 'link',
                url: 'https://example.com',
                children: [{ type: 'text', value: 'our site' }],
              },
            ],
          },
        ],
        markdown: true,
        defaultOpen: [0],
      },
      'ui:accordion',
    );
    render(<Accordion {...props} />);

    const link = screen.getByRole('link', { name: 'our site' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });
});
