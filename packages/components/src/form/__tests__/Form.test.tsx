import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Form } from '../Form.js';
import type { FormData } from '../Form.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Form', () => {
  const defaultData: FormData = {
    title: 'Project Setup',
    fields: [
      { type: 'text', id: 'name', label: 'Name', required: true },
      { type: 'select', id: 'framework', label: 'Framework', options: ['React', 'Vue'] },
      { type: 'checkbox', id: 'ts', label: 'TypeScript', default: true },
      { type: 'range', id: 'budget', label: 'Budget', min: 0, max: 1000, unit: '$' },
      { type: 'textarea', id: 'desc', label: 'Description', rows: 3 },
    ],
  };

  it('renders all field types', () => {
    const props = createMockProps<FormData>(defaultData, 'ui:form');
    render(<Form {...props} />);
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Framework/)).toBeInTheDocument();
    expect(screen.getByLabelText(/TypeScript/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Budget/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
  });

  it('renders title and submit button', () => {
    const props = createMockProps<FormData>(defaultData, 'ui:form');
    render(<Form {...props} />);
    expect(screen.getByText('Project Setup')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('fires onInteraction with values on submit', () => {
    const onInteraction = vi.fn();
    const props = createMockProps<FormData>(defaultData, 'ui:form');
    render(<Form {...props} onInteraction={onInteraction} />);

    // Fill required field
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'MyProject' } });
    fireEvent.click(screen.getByText('Submit'));

    expect(onInteraction).toHaveBeenCalledOnce();
    const event = onInteraction.mock.calls[0][0];
    expect(event.kind).toBe('form-submit');
    expect(event.payload.values.name).toBe('MyProject');
    expect(event.payload.values.ts).toBe(true);
    expect(event.payload.fields).toHaveLength(5);
  });

  it('prevents submit when required field is empty', () => {
    const onInteraction = vi.fn();
    const props = createMockProps<FormData>(defaultData, 'ui:form');
    render(<Form {...props} onInteraction={onInteraction} />);

    fireEvent.click(screen.getByText('Submit'));
    expect(onInteraction).not.toHaveBeenCalled();
  });

  it('marks invalid fields with aria-invalid', () => {
    const props = createMockProps<FormData>(defaultData, 'ui:form');
    render(<Form {...props} />);
    fireEvent.click(screen.getByText('Submit'));
    const nameInput = screen.getByLabelText(/Name/);
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders required indicator', () => {
    const props = createMockProps<FormData>(defaultData, 'ui:form');
    render(<Form {...props} />);
    const nameInput = screen.getByLabelText(/Name/);
    expect(nameInput).toHaveAttribute('aria-required', 'true');
  });

  it('renders description when provided', () => {
    const props = createMockProps<FormData>(
      { ...defaultData, description: 'Tell us about your project' },
      'ui:form',
    );
    render(<Form {...props} />);
    expect(screen.getByText('Tell us about your project')).toBeInTheDocument();
  });

  it('custom submit label', () => {
    const props = createMockProps<FormData>(
      { ...defaultData, submitLabel: 'Create Project' },
      'ui:form',
    );
    render(<Form {...props} />);
    expect(screen.getByText('Create Project')).toBeInTheDocument();
  });

  it('disables form after submission', () => {
    const props = createMockProps<FormData>(defaultData, 'ui:form');
    render(<Form {...props} />);
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });

  it('works without onInteraction', () => {
    const props = createMockProps<FormData>(defaultData, 'ui:form');
    render(<Form {...props} />);
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Test' } });
    expect(() => fireEvent.click(screen.getByText('Submit'))).not.toThrow();
  });

  // Markdown rendering tests
  it('renders plain text in description when markdown=false', () => {
    const props = createMockProps<FormData>(
      {
        fields: [{ type: 'text', id: 'name', label: 'Name' }],
        description: 'Plain text **not bold**',
        markdown: false,
      },
      'ui:form',
    );
    render(<Form {...props} />);
    expect(screen.getByText('Plain text **not bold**')).toBeInTheDocument();
  });

  it('renders formatted description when description is InlineNode[]', () => {
    const props = createMockProps<FormData>(
      {
        fields: [{ type: 'text', id: 'name', label: 'Name' }],
        description: [
          { type: 'text', value: 'This is ' },
          { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
          { type: 'text', value: ' and ' },
          { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] },
        ],
        markdown: true,
      },
      'ui:form',
    );
    render(<Form {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');

    const italicEl = screen.getByText('italic');
    expect(italicEl.tagName).toBe('EM');
  });

  it('handles plain string in description even when markdown=true (backward compat)', () => {
    const props = createMockProps<FormData>(
      {
        fields: [{ type: 'text', id: 'name', label: 'Name' }],
        description: 'Plain string',
        markdown: true,
      },
      'ui:form',
    );
    render(<Form {...props} />);
    expect(screen.getByText('Plain string')).toBeInTheDocument();
  });

  it('renders links in InlineNode[] description', () => {
    const props = createMockProps<FormData>(
      {
        fields: [{ type: 'text', id: 'name', label: 'Name' }],
        description: [
          { type: 'text', value: 'Visit ' },
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ type: 'text', value: 'our site' }],
          },
        ],
        markdown: true,
      },
      'ui:form',
    );
    render(<Form {...props} />);

    const link = screen.getByRole('link', { name: 'our site' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });
});
