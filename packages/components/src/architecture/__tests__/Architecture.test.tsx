import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Architecture } from '../Architecture.js';
import type { ArchitectureData } from '../Architecture.js';
import { createMockProps } from '../../__tests__/helpers.js';

// Mock ELK and D3 to avoid jsdom limitations
vi.mock('../layout.js', () => ({
  computeArchitectureLayout: () =>
    Promise.resolve({
      nodes: [],
      zones: [],
      edges: [],
      width: 400,
      height: 300,
    }),
}));

vi.mock('../render.js', () => ({
  renderArchitecture: () => {},
}));

const minimalData: ArchitectureData = {
  children: [
    { id: 'a', label: 'Service A', icon: 'server' },
    { id: 'b', label: 'Service B', icon: 'database' },
  ],
  edges: [{ from: 'a', to: 'b' }],
};

const nestedData: ArchitectureData = {
  title: 'Cloud Platform',
  children: [
    {
      id: 'vpc',
      label: 'VPC',
      type: 'zone',
      children: [
        {
          id: 'subnet',
          label: 'Subnet',
          type: 'zone',
          children: [
            {
              id: 'inner',
              label: 'Inner Zone',
              type: 'zone',
              children: [{ id: 'svc', label: 'Service', icon: 'server' }],
            },
          ],
        },
      ],
    },
  ],
  edges: [],
};

const emptyEdgesData: ArchitectureData = {
  children: [{ id: 'x', label: 'Node X' }],
  edges: [],
};

describe('Architecture', () => {
  it('renders an SVG element with role="img"', async () => {
    const props = createMockProps<ArchitectureData>(minimalData, 'ui:architecture');
    const { container } = render(<Architecture {...props} />);

    // Wait for async layout
    await vi.waitFor(() => {
      const svg = container.querySelector('svg[role="img"]');
      expect(svg).toBeInTheDocument();
    });
  });

  it('has a descriptive aria-label', async () => {
    const props = createMockProps<ArchitectureData>(minimalData, 'ui:architecture');
    render(<Architecture {...props} />);

    await vi.waitFor(() => {
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute(
        'aria-label',
        'Architecture diagram with 2 nodes and 1 connections',
      );
    });
  });

  it('includes title in aria-label when provided', async () => {
    const props = createMockProps<ArchitectureData>(nestedData, 'ui:architecture');
    render(<Architecture {...props} />);

    await vi.waitFor(() => {
      const svg = screen.getByRole('img');
      expect(svg.getAttribute('aria-label')).toContain('Cloud Platform');
    });
  });

  it('renders a hidden accessible data table', async () => {
    const props = createMockProps<ArchitectureData>(minimalData, 'ui:architecture');
    render(<Architecture {...props} />);

    const table = screen.getByRole('table', { name: 'Architecture data' });
    expect(table).toBeInTheDocument();

    const caption = table.querySelector('caption');
    expect(caption).toHaveTextContent('Architecture nodes and connections');
  });

  it('renders node labels in the accessible table', () => {
    const props = createMockProps<ArchitectureData>(minimalData, 'ui:architecture');
    render(<Architecture {...props} />);

    expect(screen.getByText('Service A')).toBeInTheDocument();
    expect(screen.getByText('Service B')).toBeInTheDocument();
  });

  it('handles nested zones in the SR table', () => {
    const props = createMockProps<ArchitectureData>(nestedData, 'ui:architecture');
    render(<Architecture {...props} />);

    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('handles empty edges', () => {
    const props = createMockProps<ArchitectureData>(emptyEdgesData, 'ui:architecture');
    const { container } = render(<Architecture {...props} />);

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('Node X')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    const props = createMockProps<ArchitectureData>(minimalData, 'ui:architecture');
    const { container } = render(<Architecture {...props} />);

    expect(container.textContent).toContain('Computing layout...');
  });
});
