import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { sankeySchema } from '@glyphjs/schemas';
import { Sankey, computeSankeyLayout } from '../Sankey.js';
import type { SankeyData } from '../Sankey.js';
import { createMockProps } from '../../__tests__/helpers.js';

const funnelData: SankeyData = {
  title: 'Signup funnel',
  nodes: [
    { id: 'visitors', label: 'Visitors' },
    { id: 'signup', label: 'Signed up' },
    { id: 'trial', label: 'Started trial' },
    { id: 'paid', label: 'Paid' },
    { id: 'drop', label: 'Dropped off' },
  ],
  flows: [
    { from: 'visitors', to: 'signup', value: 3000 },
    { from: 'visitors', to: 'drop', value: 7000 },
    { from: 'signup', to: 'trial', value: 1800 },
    { from: 'signup', to: 'drop', value: 1200 },
    { from: 'trial', to: 'paid', value: 600 },
    { from: 'trial', to: 'drop', value: 1200 },
  ],
  orientation: 'left-right',
  unit: 'users',
};

describe('Sankey', () => {
  it('renders an SVG element with role="img"', () => {
    const props = createMockProps<SankeyData>(funnelData, 'ui:sankey');
    render(<Sankey {...props} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
  });

  it('includes the title and flow count in the aria-label', () => {
    const props = createMockProps<SankeyData>(funnelData, 'ui:sankey');
    render(<Sankey {...props} />);
    const svg = screen.getByRole('img');
    const label = svg.getAttribute('aria-label') ?? '';
    expect(label).toContain('Signup funnel');
    expect(label).toContain('5 nodes');
    expect(label).toContain('6 flows');
  });

  it('renders without a title', () => {
    const props = createMockProps<SankeyData>(
      {
        ...funnelData,
        title: undefined,
      },
      'ui:sankey',
    );
    render(<Sankey {...props} />);
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('aria-label')).toContain('Sankey diagram with 5 nodes and 6 flows');
  });

  it('renders node labels as visible SVG text', () => {
    const props = createMockProps<SankeyData>(funnelData, 'ui:sankey');
    const { container } = render(<Sankey {...props} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    const svgText = svg?.textContent ?? '';
    expect(svgText).toContain('Visitors');
    expect(svgText).toContain('Signed up');
    expect(svgText).toContain('Paid');
    expect(svgText).toContain('Dropped off');
  });

  it('exposes a hidden accessible table of all flows', () => {
    const props = createMockProps<SankeyData>(funnelData, 'ui:sankey');
    render(<Sankey {...props} />);
    const table = screen.getByRole('table', { name: 'Sankey flows' });
    expect(table).toBeInTheDocument();
    const rows = within(table).getAllByRole('row');
    // 1 header row + 6 flow rows.
    expect(rows).toHaveLength(7);
  });

  it('lists every flow in the accessible table with source and target labels', () => {
    const props = createMockProps<SankeyData>(funnelData, 'ui:sankey');
    render(<Sankey {...props} />);
    const table = screen.getByRole('table', { name: 'Sankey flows' });
    const body = within(table).getAllByRole('row').slice(1);
    const rowsText = body.map((r) => r.textContent ?? '');
    expect(rowsText.some((t) => t.includes('Visitors') && t.includes('Signed up'))).toBe(true);
    expect(rowsText.some((t) => t.includes('Started trial') && t.includes('Paid'))).toBe(true);
    expect(rowsText.some((t) => t.includes('Dropped off'))).toBe(true);
  });

  it('renders minimal two-node one-flow configuration', () => {
    const minimal: SankeyData = {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      flows: [{ from: 'a', to: 'b', value: 10 }],
    };
    const props = createMockProps<SankeyData>(minimal, 'ui:sankey');
    const { container } = render(<Sankey {...props} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    const svgText = container.querySelector('svg')?.textContent ?? '';
    expect(svgText).toContain('A');
    expect(svgText).toContain('B');
  });

  it('supports top-down orientation', () => {
    const props = createMockProps<SankeyData>(
      { ...funnelData, orientation: 'top-down' },
      'ui:sankey',
    );
    const { container } = render(<Sankey {...props} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Top-down swaps width/height — width becomes the canonical cross size.
    const viewBox = svg?.getAttribute('viewBox') ?? '';
    const [, , w, h] = viewBox.split(' ').map(Number);
    // Canonical LR width is 720, height is 420. Top-down swaps them.
    expect(w).toBeLessThan(h as number);
  });

  it('computes layout with nodes positioned in correct layers', () => {
    const layout = computeSankeyLayout(funnelData.nodes, funnelData.flows);
    const visitors = layout.nodes.find((n) => n.id === 'visitors')!;
    const signup = layout.nodes.find((n) => n.id === 'signup')!;
    const paid = layout.nodes.find((n) => n.id === 'paid')!;
    expect(visitors.layer).toBe(0);
    expect(signup.layer).toBe(1);
    // Paid is the deepest outgoing-terminal chain; either layer 3 or pulled to max.
    expect(paid.layer).toBeGreaterThanOrEqual(2);
  });

  it('cycles ribbon colors from the palette by node insertion order', () => {
    const layout = computeSankeyLayout(funnelData.nodes, funnelData.flows);
    expect(layout.nodes[0]!.color).toContain('palette-color-1');
    expect(layout.nodes[1]!.color).toContain('palette-color-2');
  });
});

describe('sankeySchema cycle rejection', () => {
  it('rejects a 3-node cycle', () => {
    const cyclic = {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ],
      flows: [
        { from: 'a', to: 'b', value: 1 },
        { from: 'b', to: 'c', value: 1 },
        { from: 'c', to: 'a', value: 1 },
      ],
    };
    const result = sankeySchema.safeParse(cyclic);
    expect(result.success).toBe(false);
  });

  it('rejects a self-loop', () => {
    const selfLoop = {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      flows: [
        { from: 'a', to: 'a', value: 1 },
        { from: 'a', to: 'b', value: 1 },
      ],
    };
    const result = sankeySchema.safeParse(selfLoop);
    expect(result.success).toBe(false);
  });

  it('rejects flows referencing unknown node ids', () => {
    const unknown = {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      flows: [{ from: 'a', to: 'ghost', value: 1 }],
    };
    const result = sankeySchema.safeParse(unknown);
    expect(result.success).toBe(false);
  });

  it('accepts a valid DAG with branching', () => {
    const result = sankeySchema.safeParse(funnelData);
    expect(result.success).toBe(true);
  });
});
