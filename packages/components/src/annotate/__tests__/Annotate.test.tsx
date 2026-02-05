import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Annotate } from '../Annotate.js';
import type { AnnotateData } from '../Annotate.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Annotate', () => {
  const defaultData: AnnotateData = {
    title: 'Code Review',
    labels: [
      { name: 'Bug', color: '#dc2626' },
      { name: 'Good', color: '#16a34a' },
    ],
    text: 'function processData(input) {\n  var result = input.split(",");\n  eval(result[0]);\n  return result;\n}',
    annotations: [{ start: 62, end: 78, label: 'Bug', note: 'eval() is dangerous' }],
  };

  it('renders text content', () => {
    const props = createMockProps<AnnotateData>(defaultData, 'ui:annotate');
    render(<Annotate {...props} />);
    expect(screen.getByText(/processData/)).toBeInTheDocument();
  });

  it('renders pre-existing annotations as marks', () => {
    const props = createMockProps<AnnotateData>(defaultData, 'ui:annotate');
    render(<Annotate {...props} />);
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders annotation sidebar with count', () => {
    const props = createMockProps<AnnotateData>(defaultData, 'ui:annotate');
    render(<Annotate {...props} />);
    expect(screen.getByText('Annotations (1)')).toBeInTheDocument();
  });

  it('shows annotation label and note in sidebar', () => {
    const props = createMockProps<AnnotateData>(defaultData, 'ui:annotate');
    render(<Annotate {...props} />);
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('eval() is dangerous')).toBeInTheDocument();
  });

  it('ARIA: document role on text area', () => {
    const props = createMockProps<AnnotateData>(defaultData, 'ui:annotate');
    render(<Annotate {...props} />);
    expect(screen.getByRole('document')).toBeInTheDocument();
  });

  it('ARIA: complementary role on sidebar', () => {
    const props = createMockProps<AnnotateData>(defaultData, 'ui:annotate');
    render(<Annotate {...props} />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('ARIA: list role for annotations', () => {
    const props = createMockProps<AnnotateData>(defaultData, 'ui:annotate');
    render(<Annotate {...props} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('renders title when provided', () => {
    const props = createMockProps<AnnotateData>(defaultData, 'ui:annotate');
    render(<Annotate {...props} />);
    expect(screen.getByText('Code Review')).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Code Review');
  });

  it('renders without annotations', () => {
    const props = createMockProps<AnnotateData>({ ...defaultData, annotations: [] }, 'ui:annotate');
    render(<Annotate {...props} />);
    expect(screen.getByText('Annotations (0)')).toBeInTheDocument();
    expect(screen.getByText('Select text to add annotations.')).toBeInTheDocument();
  });

  it('works without onInteraction', () => {
    const props = createMockProps<AnnotateData>(defaultData, 'ui:annotate');
    expect(() => render(<Annotate {...props} />)).not.toThrow();
  });
});
