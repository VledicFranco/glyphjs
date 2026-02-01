import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Chart } from '../Chart.js';
import type { ChartData } from '../Chart.js';
import { createMockProps } from '../../__tests__/helpers.js';

// Mock D3 to avoid jsdom limitations.
// vi.mock factory runs in an isolated scope, so helpers must be inline.
vi.mock('d3', () => {
  function mockSel(): Record<string, unknown> {
    const s: Record<string, unknown> = {};
    s.selectAll = () => s;
    s.select = () => s;
    s.append = () => s;
    s.attr = () => s;
    s.text = () => s;
    s.on = () => s;
    s.call = () => s;
    s.datum = () => s;
    s.data = () => s;
    s.join = () => s;
    s.style = () => s;
    s.remove = () => s;
    s.forEach = () => {};
    return s;
  }
  return {
    select: () => mockSel(),
    scaleLinear: () => {
      const fn = () => 0;
      fn.domain = () => fn;
      fn.nice = () => fn;
      fn.range = () => fn;
      fn.ticks = () => [];
      return fn;
    },
    scaleBand: () => {
      const fn = () => 0;
      fn.domain = () => fn;
      fn.range = () => fn;
      fn.padding = () => fn;
      fn.bandwidth = () => 20;
      return fn;
    },
    extent: () => [0, 100],
    min: () => 0,
    max: () => 100,
    axisBottom: () => () => {},
    axisLeft: () => () => {},
    line: () => ({
      x: () => ({
        y: () => () => '',
      }),
    }),
    area: () => ({
      x: () => ({
        y0: () => ({
          y1: () => () => '',
        }),
      }),
    }),
    schemeCategory10: ['#1f77b4'],
  };
});

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

const chartData: ChartData = {
  type: 'bar',
  series: [
    {
      name: 'Sales',
      data: [
        { x: 'Jan', y: 10 },
        { x: 'Feb', y: 20 },
      ],
    },
  ],
  xAxis: { key: 'x', label: 'Month' },
  yAxis: { key: 'y', label: 'Amount' },
};

describe('Chart', () => {
  it('renders an SVG element', () => {
    const props = createMockProps<ChartData>(chartData, 'ui:chart');
    const { container } = render(<Chart {...props} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has role="img" on the SVG', () => {
    const props = createMockProps<ChartData>(chartData, 'ui:chart');
    render(<Chart {...props} />);

    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
  });

  it('has a descriptive aria-label', () => {
    const props = createMockProps<ChartData>(chartData, 'ui:chart');
    render(<Chart {...props} />);

    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute(
      'aria-label',
      'bar chart with 1 series: Sales',
    );
  });

  it('renders a hidden accessible data table', () => {
    const props = createMockProps<ChartData>(chartData, 'ui:chart');
    const { container } = render(<Chart {...props} />);

    const caption = container.querySelector('caption');
    expect(caption).toBeInTheDocument();
    expect(caption).toHaveTextContent('bar chart data');
  });

  it('renders series name in the accessible table', () => {
    const props = createMockProps<ChartData>(chartData, 'ui:chart');
    render(<Chart {...props} />);

    expect(screen.getByText('Sales')).toBeInTheDocument();
  });
});
