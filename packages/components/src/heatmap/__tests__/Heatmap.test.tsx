import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Heatmap } from '../Heatmap.js';
import type { HeatmapData } from '../Heatmap.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Heatmap', () => {
  const baseData: HeatmapData = {
    title: 'Freshness',
    rows: ['Alice', 'Bob'],
    cols: ['Mongo', 'Sheets', 'HubSpot'],
    values: [
      [2, 8, 0.5],
      [4, 1, 12],
    ],
    scale: 'sequential',
    domain: [0, 12],
    unit: 'hours',
  };

  it('renders without crashing with minimal data', () => {
    const props = createMockProps<HeatmapData>(
      {
        rows: ['R1'],
        cols: ['C1'],
        values: [[1]],
      },
      'ui:heatmap',
    );
    render(<Heatmap {...props} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('uses role="grid" on the inner table', () => {
    const props = createMockProps<HeatmapData>(baseData, 'ui:heatmap');
    render(<Heatmap {...props} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders row and column headers', () => {
    const props = createMockProps<HeatmapData>(baseData, 'ui:heatmap');
    render(<Heatmap {...props} />);
    expect(screen.getByRole('columnheader', { name: 'Mongo' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Sheets' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'HubSpot' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Bob' })).toBeInTheDocument();
  });

  it('renders the title when provided', () => {
    const props = createMockProps<HeatmapData>(baseData, 'ui:heatmap');
    render(<Heatmap {...props} />);
    expect(screen.getByText('Freshness')).toBeInTheDocument();
  });

  it('applies per-cell aria-label with row, col, value, and unit', () => {
    const props = createMockProps<HeatmapData>(baseData, 'ui:heatmap');
    render(<Heatmap {...props} />);
    expect(screen.getByLabelText('Alice, Mongo: 2 hours')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob, HubSpot: 12 hours')).toBeInTheDocument();
  });

  it('hides values by default (showValues=false)', () => {
    const props = createMockProps<HeatmapData>(baseData, 'ui:heatmap');
    const { container } = render(<Heatmap {...props} />);
    // Numeric value text should not be visible in cell bodies.
    const cells = container.querySelectorAll('tbody td');
    for (const cell of Array.from(cells)) {
      expect(cell.textContent).toBe('');
    }
  });

  it('shows values in cells when showValues=true', () => {
    const props = createMockProps<HeatmapData>({ ...baseData, showValues: true }, 'ui:heatmap');
    const { container } = render(<Heatmap {...props} />);
    const firstRow = container.querySelectorAll('tbody tr')[0]!;
    expect(within(firstRow as HTMLElement).getByText('2')).toBeInTheDocument();
    expect(within(firstRow as HTMLElement).getByText('8')).toBeInTheDocument();
  });

  it('renders null cells distinctly with a diagonal stripe and "no data" label', () => {
    const props = createMockProps<HeatmapData>(
      {
        rows: ['A', 'B'],
        cols: ['X', 'Y'],
        values: [
          [1, null],
          [null, 2],
        ],
      },
      'ui:heatmap',
    );
    const { container } = render(<Heatmap {...props} />);
    // Two null cells exist with the "no data" aria-label.
    expect(screen.getByLabelText('A, Y: no data')).toBeInTheDocument();
    expect(screen.getByLabelText('B, X: no data')).toBeInTheDocument();

    // At least one cell has the striped background-image applied.
    const striped = container.querySelectorAll('td[style*="repeating-linear-gradient"]');
    expect(striped.length).toBe(2);
  });

  it('renders a legend by default with min/max ticks and role=img', () => {
    const props = createMockProps<HeatmapData>(baseData, 'ui:heatmap');
    render(<Heatmap {...props} />);
    const legend = screen.getByRole('img', {
      name: /Color scale:\s*0 to 12 hours/i,
    });
    expect(legend).toBeInTheDocument();
  });

  it('hides the legend when legend=false', () => {
    const props = createMockProps<HeatmapData>({ ...baseData, legend: false }, 'ui:heatmap');
    render(<Heatmap {...props} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('exposes the region with the title as its accessible name', () => {
    const props = createMockProps<HeatmapData>(baseData, 'ui:heatmap');
    render(<Heatmap {...props} />);
    expect(screen.getByRole('region', { name: 'Freshness' })).toBeInTheDocument();
  });

  it('supports diverging scale without crashing', () => {
    const props = createMockProps<HeatmapData>(
      {
        rows: ['r'],
        cols: ['c1', 'c2', 'c3'],
        values: [[-1, 0, 1]],
        scale: 'diverging',
        domain: [-1, 1],
      },
      'ui:heatmap',
    );
    render(<Heatmap {...props} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('auto-computes domain when none provided', () => {
    const props = createMockProps<HeatmapData>(
      {
        rows: ['r'],
        cols: ['a', 'b', 'c'],
        values: [[3, 7, 10]],
        showValues: true,
      },
      'ui:heatmap',
    );
    render(<Heatmap {...props} />);
    // Legend should reflect the data extent rather than a fixed domain.
    expect(screen.getByRole('img', { name: /Color scale:\s*3\s*to\s*10/i })).toBeInTheDocument();
  });

  it('uses a generic label when no title is provided', () => {
    const props = createMockProps<HeatmapData>(
      {
        rows: ['r'],
        cols: ['c'],
        values: [[1]],
      },
      'ui:heatmap',
    );
    render(<Heatmap {...props} />);
    expect(screen.getByRole('region', { name: 'Heatmap' })).toBeInTheDocument();
  });
});
