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
});
