import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Callout } from '../Callout.js';
import type { CalloutData } from '../Callout.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Callout', () => {
  const variants: CalloutData['type'][] = ['info', 'warning', 'error', 'tip'];
  const ariaLabels: Record<CalloutData['type'], string> = {
    info: 'Information',
    warning: 'Warning',
    error: 'Error',
    tip: 'Tip',
  };

  it.each(variants)('renders %s variant with role="note"', (variant) => {
    const props = createMockProps<CalloutData>(
      { type: variant, content: `${variant} content` },
      'ui:callout',
    );
    render(<Callout {...props} />);
    const note = screen.getByRole('note');
    expect(note).toBeInTheDocument();
  });

  it.each(variants)('renders %s variant with correct aria-label', (variant) => {
    const props = createMockProps<CalloutData>(
      { type: variant, content: `${variant} content` },
      'ui:callout',
    );
    render(<Callout {...props} />);
    const note = screen.getByRole('note');
    expect(note).toHaveAttribute('aria-label', ariaLabels[variant]);
  });

  it('renders title when provided', () => {
    const props = createMockProps<CalloutData>(
      { type: 'info', title: 'Important Notice', content: 'Some content' },
      'ui:callout',
    );
    render(<Callout {...props} />);
    expect(screen.getByText('Important Notice')).toBeInTheDocument();
  });

  it('does not render title element when not provided', () => {
    const props = createMockProps<CalloutData>(
      { type: 'info', content: 'Some content' },
      'ui:callout',
    );
    render(<Callout {...props} />);
    expect(screen.queryByText('Important Notice')).not.toBeInTheDocument();
  });

  it('renders content text', () => {
    const props = createMockProps<CalloutData>(
      { type: 'warning', content: 'Watch out for this!' },
      'ui:callout',
    );
    render(<Callout {...props} />);
    expect(screen.getByText('Watch out for this!')).toBeInTheDocument();
  });
});
