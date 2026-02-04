import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Flowchart } from '../Flowchart.js';
import type { FlowchartData } from '../Flowchart.js';
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

vi.mock('dagre', () => {
  class MockGraph {
    setGraph() {}
    setDefaultEdgeLabel() {}
    setNode() {}
    setEdge() {}
    node() {
      return { x: 100, y: 100, width: 160, height: 40 };
    }
    edge() {
      return {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ],
      };
    }
  }
  return {
    default: {
      graphlib: { Graph: MockGraph },
      layout: vi.fn(),
    },
  };
});

const flowchartData: FlowchartData = {
  title: 'Test Flow',
  nodes: [
    { id: 'start', type: 'start', label: 'Begin' },
    { id: 'process', type: 'process', label: 'Do Work' },
    { id: 'decide', type: 'decision', label: 'Is OK?' },
    { id: 'end', type: 'end', label: 'Finish' },
  ],
  edges: [
    { from: 'start', to: 'process' },
    { from: 'process', to: 'decide' },
    { from: 'decide', to: 'end', label: 'Yes' },
  ],
  direction: 'top-down',
};

describe('Flowchart', () => {
  it('renders an SVG element', () => {
    const props = createMockProps<FlowchartData>(flowchartData, 'ui:flowchart');
    const { container } = render(<Flowchart {...props} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has role="img" on the SVG', () => {
    const props = createMockProps<FlowchartData>(flowchartData, 'ui:flowchart');
    render(<Flowchart {...props} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
  });

  it('includes title in aria-label', () => {
    const props = createMockProps<FlowchartData>(flowchartData, 'ui:flowchart');
    render(<Flowchart {...props} />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-label', 'Test Flow: flowchart with 4 nodes and 3 edges');
  });

  it('renders a hidden accessible data table', () => {
    const props = createMockProps<FlowchartData>(flowchartData, 'ui:flowchart');
    render(<Flowchart {...props} />);
    const table = screen.getByRole('table', { name: 'Flowchart data' });
    expect(table).toBeInTheDocument();
  });

  it('renders all node labels in the accessible table', () => {
    const props = createMockProps<FlowchartData>(flowchartData, 'ui:flowchart');
    render(<Flowchart {...props} />);
    expect(screen.getByText('Begin')).toBeInTheDocument();
    expect(screen.getByText('Do Work')).toBeInTheDocument();
    expect(screen.getByText('Is OK?')).toBeInTheDocument();
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });

  it('renders node types in the accessible table', () => {
    const props = createMockProps<FlowchartData>(flowchartData, 'ui:flowchart');
    render(<Flowchart {...props} />);
    expect(screen.getAllByText('start')).toHaveLength(1);
    expect(screen.getAllByText('process')).toHaveLength(1);
    expect(screen.getAllByText('decision')).toHaveLength(1);
    expect(screen.getAllByText('end')).toHaveLength(1);
  });

  it('shows edge labels in connection descriptions', () => {
    const props = createMockProps<FlowchartData>(flowchartData, 'ui:flowchart');
    render(<Flowchart {...props} />);
    // The "Yes" edge label should appear in the connections column
    const matches = screen.getAllByText(/Yes/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders title text when provided', () => {
    const props = createMockProps<FlowchartData>(flowchartData, 'ui:flowchart');
    render(<Flowchart {...props} />);
    // Title appears as visible heading
    const titles = screen.getAllByText('Test Flow');
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it('renders without title', () => {
    const noTitleData: FlowchartData = {
      nodes: [
        { id: 'a', type: 'start', label: 'A' },
        { id: 'b', type: 'end', label: 'B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
      direction: 'top-down',
    };
    const props = createMockProps<FlowchartData>(noTitleData, 'ui:flowchart');
    render(<Flowchart {...props} />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-label', 'Flowchart with 2 nodes and 1 edges');
  });
});
