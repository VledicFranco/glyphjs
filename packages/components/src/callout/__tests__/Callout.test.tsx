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

  it('renders plain text when markdown=false', () => {
    const props = createMockProps<CalloutData>(
      { type: 'info', content: 'Plain text **not bold**', markdown: false },
      'ui:callout',
    );
    render(<Callout {...props} />);
    expect(screen.getByText('Plain text **not bold**')).toBeInTheDocument();
  });

  it('renders formatted content when content is InlineNode[]', () => {
    const props = createMockProps<CalloutData>(
      {
        type: 'info',
        content: [
          { type: 'text', value: 'This is ' },
          { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
          { type: 'text', value: ' and ' },
          { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] },
        ],
        markdown: true,
      },
      'ui:callout',
    );
    render(<Callout {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');

    const italicEl = screen.getByText('italic');
    expect(italicEl.tagName).toBe('EM');
  });

  it('handles plain string even when markdown=true (backward compat)', () => {
    const props = createMockProps<CalloutData>(
      { type: 'info', content: 'Plain string', markdown: true },
      'ui:callout',
    );
    render(<Callout {...props} />);
    expect(screen.getByText('Plain string')).toBeInTheDocument();
  });

  it('renders links in InlineNode[] content', () => {
    const props = createMockProps<CalloutData>(
      {
        type: 'tip',
        content: [
          { type: 'text', value: 'Visit ' },
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ type: 'text', value: 'our site' }],
          },
        ],
        markdown: true,
      },
      'ui:callout',
    );
    render(<Callout {...props} />);

    const link = screen.getByRole('link', { name: 'our site' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });
});
