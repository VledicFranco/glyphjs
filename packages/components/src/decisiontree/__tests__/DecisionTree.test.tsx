import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DecisionTree } from '../DecisionTree.js';
import type { DecisionTreeData } from '../DecisionTree.js';
import { createMockProps } from '../../__tests__/helpers.js';

// ─── Fixtures ────────────────────────────────────────────────

const routingData: DecisionTreeData = {
  title: 'Action routing',
  nodes: [
    { id: 'root', type: 'question', label: 'User tier?' },
    { id: 'free', type: 'question', label: 'Over free limit?' },
    { id: 'paid', type: 'outcome', label: 'Allow unlimited', sentiment: 'positive' },
    { id: 'upgrade', type: 'outcome', label: 'Show upgrade prompt', sentiment: 'neutral' },
    { id: 'allow', type: 'outcome', label: 'Allow request', sentiment: 'positive' },
  ],
  edges: [
    { from: 'root', to: 'free', condition: 'free' },
    { from: 'root', to: 'paid', condition: 'paid' },
    { from: 'free', to: 'upgrade', condition: 'yes' },
    { from: 'free', to: 'allow', condition: 'no' },
  ],
  orientation: 'left-right',
};

const reasoningData: DecisionTreeData = {
  nodes: [
    { id: 'root', type: 'question', label: 'Intent?', confidence: 0.82 },
    { id: 'search', type: 'outcome', label: 'Run search', sentiment: 'positive', confidence: 0.9 },
    {
      id: 'create',
      type: 'outcome',
      label: 'Create record',
      sentiment: 'neutral',
      confidence: 0.6,
    },
  ],
  edges: [
    { from: 'root', to: 'search', condition: 'lookup' },
    { from: 'root', to: 'create', condition: 'new' },
  ],
};

const trivialData: DecisionTreeData = {
  nodes: [
    { id: 'root', type: 'question', label: 'Proceed?' },
    { id: 'yes', type: 'outcome', label: 'Ship it', sentiment: 'positive' },
  ],
  edges: [{ from: 'root', to: 'yes', condition: 'yes' }],
};

// 3-level tree: root → 2 children → 4 grandchildren (2 each)
const threeLevelData: DecisionTreeData = {
  nodes: [
    { id: 'root', type: 'question', label: 'Root' },
    { id: 'c1', type: 'question', label: 'Child 1' },
    { id: 'c2', type: 'question', label: 'Child 2' },
    { id: 'g1', type: 'outcome', label: 'Grand 1', sentiment: 'positive' },
    { id: 'g2', type: 'outcome', label: 'Grand 2', sentiment: 'positive' },
    { id: 'g3', type: 'outcome', label: 'Grand 3', sentiment: 'positive' },
    { id: 'g4', type: 'outcome', label: 'Grand 4', sentiment: 'positive' },
  ],
  edges: [
    { from: 'root', to: 'c1' },
    { from: 'root', to: 'c2' },
    { from: 'c1', to: 'g1' },
    { from: 'c1', to: 'g2' },
    { from: 'c2', to: 'g3' },
    { from: 'c2', to: 'g4' },
  ],
};

// Helper: parse the centre coordinates of a rendered node from its <rect> attrs.
function nodeCentre(container: HTMLElement, id: string): { x: number; y: number } | null {
  const group = container.querySelector(`[data-testid="decisiontree-node-${id}"]`);
  if (!group) return null;
  const rect = group.querySelector('rect');
  if (!rect) return null;
  const x = parseFloat(rect.getAttribute('x') ?? 'NaN');
  const y = parseFloat(rect.getAttribute('y') ?? 'NaN');
  const w = parseFloat(rect.getAttribute('width') ?? 'NaN');
  const h = parseFloat(rect.getAttribute('height') ?? 'NaN');
  if ([x, y, w, h].some(Number.isNaN)) return null;
  return { x: x + w / 2, y: y + h / 2 };
}

// ─── Tests ───────────────────────────────────────────────────

describe('DecisionTree', () => {
  it('renders an SVG element', () => {
    const props = createMockProps<DecisionTreeData>(routingData, 'ui:decisiontree');
    const { container } = render(<DecisionTree {...props} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('SVG has role="tree" with aria-label', () => {
    const props = createMockProps<DecisionTreeData>(routingData, 'ui:decisiontree');
    render(<DecisionTree {...props} />);
    const tree = screen.getByRole('tree');
    expect(tree).toBeInTheDocument();
    const ariaLabel = tree.getAttribute('aria-label') ?? '';
    expect(ariaLabel).toContain('Action routing');
    expect(ariaLabel).toContain('decisions');
    expect(ariaLabel).toContain('outcomes');
  });

  it('renders each node label inside the SVG', () => {
    const props = createMockProps<DecisionTreeData>(routingData, 'ui:decisiontree');
    render(<DecisionTree {...props} />);
    expect(screen.getAllByText('User tier?').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Over free limit?').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Allow unlimited').length).toBeGreaterThanOrEqual(1);
  });

  it('marks outcome nodes distinctly from question nodes', () => {
    const props = createMockProps<DecisionTreeData>(routingData, 'ui:decisiontree');
    const { container } = render(<DecisionTree {...props} />);
    const outcomeNode = container.querySelector('[data-testid="decisiontree-node-paid"]');
    const questionNode = container.querySelector('[data-testid="decisiontree-node-root"]');
    expect(outcomeNode).toHaveAttribute('data-node-type', 'outcome');
    expect(questionNode).toHaveAttribute('data-node-type', 'question');

    // Outcome node carries sentiment in its aria-label
    expect(outcomeNode?.getAttribute('aria-label')).toContain('outcome');
    expect(outcomeNode?.getAttribute('aria-label')).toContain('positive');
  });

  it('renders edge condition labels', () => {
    const props = createMockProps<DecisionTreeData>(routingData, 'ui:decisiontree');
    render(<DecisionTree {...props} />);
    // Condition labels "free", "paid", "yes", "no" should all be rendered
    expect(screen.getAllByText('free').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('paid').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('yes').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('no').length).toBeGreaterThanOrEqual(1);
  });

  it('renders confidence badges for nodes with confidence set', () => {
    const props = createMockProps<DecisionTreeData>(reasoningData, 'ui:decisiontree');
    const { container } = render(<DecisionTree {...props} />);

    // Each node with confidence should render a badge group
    expect(
      container.querySelector('[data-testid="decisiontree-confidence-root"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="decisiontree-confidence-search"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="decisiontree-confidence-create"]'),
    ).toBeInTheDocument();

    // Text content rounds to integer percent
    expect(screen.getAllByText('82%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('90%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('60%').length).toBeGreaterThanOrEqual(1);
  });

  it('does not render confidence badge when confidence is unset', () => {
    const props = createMockProps<DecisionTreeData>(routingData, 'ui:decisiontree');
    const { container } = render(<DecisionTree {...props} />);
    expect(
      container.querySelector('[data-testid="decisiontree-confidence-root"]'),
    ).not.toBeInTheDocument();
  });

  it('exposes an accessible nested list fallback for screen readers', () => {
    const props = createMockProps<DecisionTreeData>(routingData, 'ui:decisiontree');
    render(<DecisionTree {...props} />);
    const list = screen.getByRole('list', { name: /decision tree/i });
    expect(list).toBeInTheDocument();
    // The list should include the root label as text content
    expect(within(list).getByText(/User tier\?/i)).toBeInTheDocument();
  });

  it('renders in left-right orientation producing a different layout than top-down', () => {
    const lr = createMockProps<DecisionTreeData>(
      { ...routingData, orientation: 'left-right' },
      'ui:decisiontree',
    );
    const td = createMockProps<DecisionTreeData>(
      { ...routingData, orientation: 'top-down' },
      'ui:decisiontree',
    );
    const { container: lrContainer } = render(<DecisionTree {...lr} />);
    const { container: tdContainer } = render(<DecisionTree {...td} />);
    const lrBox = lrContainer.querySelector('svg[role="tree"]')?.getAttribute('viewBox') ?? '';
    const tdBox = tdContainer.querySelector('svg[role="tree"]')?.getAttribute('viewBox') ?? '';
    expect(lrBox).not.toBe('');
    expect(tdBox).not.toBe('');

    // Orientation must materially change node placement.
    // In top-down the root sits topmost; in left-right it sits leftmost.
    const lrRoot = nodeCentre(lrContainer, 'root');
    const lrLeaf = nodeCentre(lrContainer, 'paid');
    const tdRoot = nodeCentre(tdContainer, 'root');
    const tdLeaf = nodeCentre(tdContainer, 'paid');
    expect(lrRoot).not.toBeNull();
    expect(lrLeaf).not.toBeNull();
    expect(tdRoot).not.toBeNull();
    expect(tdLeaf).not.toBeNull();

    // left-right: leaf is to the right of root (greater x).
    expect(lrLeaf!.x).toBeGreaterThan(lrRoot!.x);
    // top-down: leaf is below root (greater y).
    expect(tdLeaf!.y).toBeGreaterThan(tdRoot!.y);
  });

  it('renders in top-down orientation with valid viewBox', () => {
    const topDown: DecisionTreeData = { ...routingData, orientation: 'top-down' };
    const props = createMockProps<DecisionTreeData>(topDown, 'ui:decisiontree');
    const { container } = render(<DecisionTree {...props} />);
    const svg = container.querySelector('svg[role="tree"]');
    const viewBox = svg?.getAttribute('viewBox') ?? '';
    const parts = viewBox.split(' ').map(Number);
    expect(parts).toHaveLength(4);
    const [, , w, h] = parts;
    expect(w).toBeGreaterThan(0);
    expect(h).toBeGreaterThan(0);
    // top-down: width driven by leaves (4 leaves), height by depth (3 levels)
    expect(w).toBeGreaterThan(h);
  });

  it('renders a trivial tree (root + single outcome)', () => {
    const props = createMockProps<DecisionTreeData>(trivialData, 'ui:decisiontree');
    const { container } = render(<DecisionTree {...props} />);
    const svg = container.querySelector('svg[role="tree"]');
    expect(svg).toBeInTheDocument();
    expect(screen.getAllByText('Proceed?').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ship it').length).toBeGreaterThanOrEqual(1);
  });

  it('left-right layout: root sits leftmost and children flow right', () => {
    const data: DecisionTreeData = { ...threeLevelData, orientation: 'left-right' };
    const props = createMockProps<DecisionTreeData>(data, 'ui:decisiontree');
    const { container } = render(<DecisionTree {...props} />);

    const ids = ['root', 'c1', 'c2', 'g1', 'g2', 'g3', 'g4'] as const;
    const positions = Object.fromEntries(
      ids.map((id) => [id, nodeCentre(container, id)] as const),
    ) as Record<(typeof ids)[number], { x: number; y: number }>;

    for (const id of ids) {
      expect(positions[id], `node ${id} should render`).not.toBeNull();
    }

    // Root x is strictly less than every other node's x.
    const rootX = positions.root.x;
    for (const id of ids) {
      if (id === 'root') continue;
      expect(positions[id].x, `node ${id} should be right of root`).toBeGreaterThan(rootX);
    }

    // Each leaf (g1..g4) sits to the right of its parent.
    expect(positions.g1.x).toBeGreaterThan(positions.c1.x);
    expect(positions.g2.x).toBeGreaterThan(positions.c1.x);
    expect(positions.g3.x).toBeGreaterThan(positions.c2.x);
    expect(positions.g4.x).toBeGreaterThan(positions.c2.x);

    // Both intermediate children sit to the right of root and to the left of any leaf.
    expect(positions.c1.x).toBeGreaterThan(rootX);
    expect(positions.c2.x).toBeGreaterThan(rootX);
    const minLeafX = Math.min(positions.g1.x, positions.g2.x, positions.g3.x, positions.g4.x);
    expect(positions.c1.x).toBeLessThan(minLeafX);
    expect(positions.c2.x).toBeLessThan(minLeafX);
  });

  it('top-down layout: root sits topmost and children flow down', () => {
    const data: DecisionTreeData = { ...threeLevelData, orientation: 'top-down' };
    const props = createMockProps<DecisionTreeData>(data, 'ui:decisiontree');
    const { container } = render(<DecisionTree {...props} />);

    const ids = ['root', 'c1', 'c2', 'g1', 'g2', 'g3', 'g4'] as const;
    const positions = Object.fromEntries(
      ids.map((id) => [id, nodeCentre(container, id)] as const),
    ) as Record<(typeof ids)[number], { x: number; y: number }>;

    for (const id of ids) {
      expect(positions[id], `node ${id} should render`).not.toBeNull();
    }

    // Root y is strictly less than every other node's y.
    const rootY = positions.root.y;
    for (const id of ids) {
      if (id === 'root') continue;
      expect(positions[id].y, `node ${id} should be below root`).toBeGreaterThan(rootY);
    }

    // Each leaf sits below its parent.
    expect(positions.g1.y).toBeGreaterThan(positions.c1.y);
    expect(positions.g2.y).toBeGreaterThan(positions.c1.y);
    expect(positions.g3.y).toBeGreaterThan(positions.c2.y);
    expect(positions.g4.y).toBeGreaterThan(positions.c2.y);

    const minLeafY = Math.min(positions.g1.y, positions.g2.y, positions.g3.y, positions.g4.y);
    expect(positions.c1.y).toBeLessThan(minLeafY);
    expect(positions.c2.y).toBeLessThan(minLeafY);
  });

  it('computes aria-level from tree depth', () => {
    const props = createMockProps<DecisionTreeData>(routingData, 'ui:decisiontree');
    const { container } = render(<DecisionTree {...props} />);
    const rootNode = container.querySelector('[data-testid="decisiontree-node-root"]');
    const freeNode = container.querySelector('[data-testid="decisiontree-node-free"]');
    const upgradeNode = container.querySelector('[data-testid="decisiontree-node-upgrade"]');
    expect(rootNode).toHaveAttribute('aria-level', '1');
    expect(freeNode).toHaveAttribute('aria-level', '2');
    expect(upgradeNode).toHaveAttribute('aria-level', '3');
  });
});
