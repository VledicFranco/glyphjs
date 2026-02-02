import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Graph } from '../Graph.js';
import type { GraphData } from '../Graph.js';
import { createMockProps } from '../../__tests__/helpers.js';

// Mock D3 and dagre to avoid jsdom limitations with SVG rendering
vi.mock('d3', () => ({
  select: () => ({
    selectAll: () => ({ remove: () => {} }),
    append: () => mockSelection(),
    attr: () => mockSelection(),
    call: () => mockSelection(),
  }),
  zoom: () => ({
    scaleExtent: () => ({
      on: () => ({}),
    }),
  }),
  line: () => ({
    x: () => ({
      y: () => ({
        curve: () => () => '',
      }),
    }),
  }),
  curveBasis: {},
  color: () => ({ darker: () => ({ toString: () => '#000' }) }),
}));

function mockSelection(): Record<string, unknown> {
  const sel: Record<string, unknown> = {};
  sel.selectAll = () => ({ remove: () => {} });
  sel.append = () => sel;
  sel.attr = () => sel;
  sel.text = () => sel;
  sel.on = () => sel;
  sel.call = () => sel;
  return sel;
}

vi.mock('../layout.js', () => ({
  computeDagreLayout: () => ({
    nodes: [],
    edges: [],
    width: 400,
    height: 300,
  }),
  computeForceLayout: () => ({
    nodes: [],
    edges: [],
    width: 400,
    height: 300,
  }),
}));

const graphData: GraphData = {
  type: 'dag',
  nodes: [
    { id: 'a', label: 'Node A' },
    { id: 'b', label: 'Node B' },
  ],
  edges: [{ from: 'a', to: 'b' }],
};

describe('Graph', () => {
  it('renders an SVG element', () => {
    const props = createMockProps<GraphData>(graphData, 'ui:graph');
    const { container } = render(<Graph {...props} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has role="img" on the SVG', () => {
    const props = createMockProps<GraphData>(graphData, 'ui:graph');
    render(<Graph {...props} />);

    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
  });

  it('has a descriptive aria-label', () => {
    const props = createMockProps<GraphData>(graphData, 'ui:graph');
    render(<Graph {...props} />);

    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute(
      'aria-label',
      'dag graph with 2 nodes and 1 edges',
    );
  });

  it('renders a hidden accessible data table', () => {
    const props = createMockProps<GraphData>(graphData, 'ui:graph');
    render(<Graph {...props} />);

    const table = screen.getByRole('table', { name: 'Graph data' });
    expect(table).toBeInTheDocument();
  });

  it('renders node labels in the accessible table', () => {
    const props = createMockProps<GraphData>(graphData, 'ui:graph');
    render(<Graph {...props} />);

    expect(screen.getByText('Node A')).toBeInTheDocument();
    expect(screen.getByText('Node B')).toBeInTheDocument();
  });
});
