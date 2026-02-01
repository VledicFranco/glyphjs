import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Relation } from '../Relation.js';
import type { RelationData } from '../Relation.js';
import { createMockProps } from '../../__tests__/helpers.js';

// Mock D3 and dagre to avoid jsdom limitations.
// vi.mock factories are hoisted and run in isolation, so helpers must be inline.
vi.mock('d3', () => {
  function mockSel(): Record<string, unknown> {
    const s: Record<string, unknown> = {};
    s.selectAll = () => ({ remove: () => {} });
    s.append = () => s;
    s.attr = () => s;
    s.text = () => s;
    s.on = () => s;
    s.call = () => s;
    return s;
  }
  return {
    select: () => mockSel(),
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
  };
});

vi.mock('dagre', () => {
  class MockGraph {
    setGraph() {}
    setDefaultEdgeLabel() {}
    setNode() {}
    setEdge() {}
    node() {
      return { x: 100, y: 100 };
    }
    edge() {
      return { points: [{ x: 0, y: 0 }, { x: 100, y: 100 }] };
    }
  }
  return {
    default: {
      graphlib: { Graph: MockGraph },
      layout() {},
    },
  };
});

const relationData: RelationData = {
  entities: [
    { id: 'users', label: 'Users', attributes: [{ name: 'id', type: 'int', primaryKey: true }] },
    { id: 'orders', label: 'Orders', attributes: [{ name: 'id', type: 'int', primaryKey: true }] },
  ],
  relationships: [
    { from: 'users', to: 'orders', label: 'places', cardinality: '1:N' },
  ],
};

describe('Relation', () => {
  it('renders an SVG element', () => {
    const props = createMockProps<RelationData>(relationData, 'ui:relation');
    const { container } = render(<Relation {...props} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has role="img" on the SVG', () => {
    const props = createMockProps<RelationData>(relationData, 'ui:relation');
    render(<Relation {...props} />);

    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
  });

  it('has a descriptive aria-label', () => {
    const props = createMockProps<RelationData>(relationData, 'ui:relation');
    render(<Relation {...props} />);

    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute(
      'aria-label',
      'Entity-relationship diagram with 2 entities and 1 relationships',
    );
  });

  it('renders a hidden accessible data table', () => {
    const props = createMockProps<RelationData>(relationData, 'ui:relation');
    render(<Relation {...props} />);

    const table = screen.getByRole('table', { name: 'Entity-relationship data' });
    expect(table).toBeInTheDocument();
  });

  it('renders entity labels in the accessible table', () => {
    const props = createMockProps<RelationData>(relationData, 'ui:relation');
    render(<Relation {...props} />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });
});
