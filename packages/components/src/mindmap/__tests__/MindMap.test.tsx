import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MindMap } from '../MindMap.js';
import type { MindMapData } from '../MindMap.js';
import { createMockProps } from '../../__tests__/helpers.js';

const basicData: MindMapData = {
  root: 'JavaScript',
  children: [{ label: 'React' }, { label: 'Vue' }, { label: 'Angular' }],
  layout: 'radial',
};

const nestedData: MindMapData = {
  root: 'Programming',
  children: [
    {
      label: 'Frontend',
      children: [{ label: 'React' }, { label: 'Vue' }],
    },
    {
      label: 'Backend',
      children: [{ label: 'Node' }, { label: 'Python' }],
    },
  ],
  layout: 'radial',
};

const treeData: MindMapData = {
  root: 'Root',
  children: [{ label: 'Child A' }, { label: 'Child B' }],
  layout: 'tree',
};

describe('MindMap', () => {
  it('renders an SVG element', () => {
    const props = createMockProps<MindMapData>(basicData, 'ui:mindmap');
    const { container } = render(<MindMap {...props} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has role="img" on the SVG', () => {
    const props = createMockProps<MindMapData>(basicData, 'ui:mindmap');
    render(<MindMap {...props} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
  });

  it('includes root in aria-label', () => {
    const props = createMockProps<MindMapData>(basicData, 'ui:mindmap');
    render(<MindMap {...props} />);
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('aria-label')).toContain('JavaScript');
  });

  it('includes node count in aria-label', () => {
    const props = createMockProps<MindMapData>(basicData, 'ui:mindmap');
    render(<MindMap {...props} />);
    const svg = screen.getByRole('img');
    // root (1) + 3 children = 4
    expect(svg.getAttribute('aria-label')).toContain('4 nodes');
  });

  it('renders root label', () => {
    const props = createMockProps<MindMapData>(basicData, 'ui:mindmap');
    render(<MindMap {...props} />);
    // Root appears in SVG and accessible list
    expect(screen.getAllByText('JavaScript').length).toBeGreaterThanOrEqual(1);
  });

  it('renders children labels', () => {
    const props = createMockProps<MindMapData>(basicData, 'ui:mindmap');
    render(<MindMap {...props} />);
    // Children appear in SVG and accessible list
    expect(screen.getAllByText('React').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Vue').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Angular').length).toBeGreaterThanOrEqual(1);
  });

  it('renders accessible list', () => {
    const props = createMockProps<MindMapData>(nestedData, 'ui:mindmap');
    render(<MindMap {...props} />);
    const list = screen.getByRole('list', { name: 'Mind map structure' });
    expect(list).toBeInTheDocument();
  });

  it('tree layout works', () => {
    const props = createMockProps<MindMapData>(treeData, 'ui:mindmap');
    const { container } = render(<MindMap {...props} />);
    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeInTheDocument();
    expect(screen.getAllByText('Root').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Child A').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Child B').length).toBeGreaterThanOrEqual(1);
  });
});
