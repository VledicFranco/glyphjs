import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Matrix } from '../Matrix.js';
import type { MatrixData } from '../Matrix.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Matrix', () => {
  const defaultData: MatrixData = {
    columns: [
      { id: 'perf', label: 'Performance', weight: 2 },
      { id: 'dx', label: 'DX', weight: 1 },
    ],
    rows: [
      { id: 'react', label: 'React' },
      { id: 'vue', label: 'Vue' },
    ],
  };

  it('renders column and row headers', () => {
    const props = createMockProps<MatrixData>(defaultData, 'ui:matrix');
    render(<Matrix {...props} />);
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('DX')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
  });

  it('renders grid role', () => {
    const props = createMockProps<MatrixData>(defaultData, 'ui:matrix');
    render(<Matrix {...props} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders number inputs for each cell', () => {
    const props = createMockProps<MatrixData>(defaultData, 'ui:matrix');
    render(<Matrix {...props} />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(4); // 2 rows × 2 columns
  });

  it('cell inputs have correct aria-label', () => {
    const props = createMockProps<MatrixData>(defaultData, 'ui:matrix');
    render(<Matrix {...props} />);
    expect(screen.getByLabelText('Score for React on Performance')).toBeInTheDocument();
    expect(screen.getByLabelText('Score for Vue on DX')).toBeInTheDocument();
  });

  it('fires onInteraction with weightedTotals on change', () => {
    const onInteraction = vi.fn();
    const props = createMockProps<MatrixData>(defaultData, 'ui:matrix');
    render(<Matrix {...props} onInteraction={onInteraction} />);

    const input = screen.getByLabelText('Score for React on Performance');
    fireEvent.change(input, { target: { value: '4' } });

    expect(onInteraction).toHaveBeenCalledOnce();
    const event = onInteraction.mock.calls[0][0];
    expect(event.kind).toBe('matrix-change');
    expect(event.payload.rowId).toBe('react');
    expect(event.payload.columnId).toBe('perf');
    expect(event.payload.value).toBe(4);
    expect(event.payload.weightedTotals).toBeDefined();
    const reactTotal = event.payload.weightedTotals.find(
      (t: { rowId: string }) => t.rowId === 'react',
    );
    expect(reactTotal?.total).toBe(8); // 4 × weight 2
  });

  it('shows totals column by default', () => {
    const props = createMockProps<MatrixData>(defaultData, 'ui:matrix');
    render(<Matrix {...props} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('hides totals when showTotals is false', () => {
    const props = createMockProps<MatrixData>({ ...defaultData, showTotals: false }, 'ui:matrix');
    render(<Matrix {...props} />);
    expect(screen.queryByText('Total')).not.toBeInTheDocument();
  });

  it('shows weight indicators', () => {
    const props = createMockProps<MatrixData>(defaultData, 'ui:matrix');
    render(<Matrix {...props} />);
    expect(screen.getByText('×2')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    const props = createMockProps<MatrixData>({ ...defaultData, title: 'Evaluation' }, 'ui:matrix');
    render(<Matrix {...props} />);
    expect(screen.getByText('Evaluation')).toBeInTheDocument();
  });

  it('works without onInteraction', () => {
    const props = createMockProps<MatrixData>(defaultData, 'ui:matrix');
    render(<Matrix {...props} />);
    const input = screen.getByLabelText('Score for React on Performance');
    expect(() => fireEvent.change(input, { target: { value: '3' } })).not.toThrow();
  });

  // Markdown rendering tests
  it('renders plain text in row label when markdown=false', () => {
    const props = createMockProps<MatrixData>(
      {
        columns: [{ id: 'c', label: 'Column' }],
        rows: [{ id: 'r', label: 'Plain text **not bold**' }],
        markdown: false,
      },
      'ui:matrix',
    );
    render(<Matrix {...props} />);
    expect(screen.getByText('Plain text **not bold**')).toBeInTheDocument();
  });

  it('renders formatted row label when label is InlineNode[]', () => {
    const props = createMockProps<MatrixData>(
      {
        columns: [{ id: 'c', label: 'Column' }],
        rows: [
          {
            id: 'r',
            label: [
              { type: 'text', value: 'This is ' },
              { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
              { type: 'text', value: ' and ' },
              { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] },
            ],
          },
        ],
        markdown: true,
      },
      'ui:matrix',
    );
    render(<Matrix {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');

    const italicEl = screen.getByText('italic');
    expect(italicEl.tagName).toBe('EM');
  });

  it('handles plain string in row label even when markdown=true (backward compat)', () => {
    const props = createMockProps<MatrixData>(
      {
        columns: [{ id: 'c', label: 'Column' }],
        rows: [{ id: 'r', label: 'Plain string' }],
        markdown: true,
      },
      'ui:matrix',
    );
    render(<Matrix {...props} />);
    expect(screen.getByText('Plain string')).toBeInTheDocument();
  });

  it('renders links in InlineNode[] row label', () => {
    const props = createMockProps<MatrixData>(
      {
        columns: [{ id: 'c', label: 'Column' }],
        rows: [
          {
            id: 'r',
            label: [
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
      },
      'ui:matrix',
    );
    render(<Matrix {...props} />);

    const link = screen.getByRole('link', { name: 'our site' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders formatted column label when label is InlineNode[]', () => {
    const props = createMockProps<MatrixData>(
      {
        columns: [
          {
            id: 'c',
            label: [
              { type: 'text', value: 'Column with ' },
              { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
            ],
          },
        ],
        rows: [{ id: 'r', label: 'Row' }],
        markdown: true,
      },
      'ui:matrix',
    );
    render(<Matrix {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');
  });
});
