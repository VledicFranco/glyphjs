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
});
