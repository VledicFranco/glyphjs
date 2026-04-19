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
    // The two orientations should produce different viewBox dimensions
    expect(lrBox).not.toBe(tdBox);
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
