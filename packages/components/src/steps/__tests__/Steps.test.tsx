import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { Steps } from '../Steps.js';
import type { StepsData } from '../Steps.js';
import { createMockProps } from '../../__tests__/helpers.js';
import type { Block } from '@glyphjs/types';

vi.mock('@glyphjs/runtime', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    BlockRenderer: ({ block }: { block: Block }) => (
      <div data-testid={`block-renderer-${block.id}`}>{block.type}</div>
    ),
  };
});

const stepsData: StepsData = {
  steps: [
    { title: 'Setup', status: 'completed', content: 'Install dependencies' },
    { title: 'Configure', status: 'active', content: 'Edit config files' },
    { title: 'Deploy', status: 'pending', content: 'Push to production' },
  ],
};

describe('Steps', () => {
  it('renders step titles', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    render(<Steps {...props} />);

    expect(screen.getByText('Setup')).toBeInTheDocument();
    expect(screen.getByText('Configure')).toBeInTheDocument();
    expect(screen.getByText('Deploy')).toBeInTheDocument();
  });

  it('renders step content', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    render(<Steps {...props} />);

    expect(screen.getByText('Install dependencies')).toBeInTheDocument();
    expect(screen.getByText('Edit config files')).toBeInTheDocument();
    expect(screen.getByText('Push to production')).toBeInTheDocument();
  });

  it('renders status indicators for completed steps', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    const { container } = render(<Steps {...props} />);

    // Completed step has a checkmark character
    const indicators = container.querySelectorAll('[aria-hidden="true"]');
    const checkmarks = Array.from(indicators).filter((el) => el.textContent === '\u2713');
    expect(checkmarks.length).toBeGreaterThanOrEqual(1);
  });

  it('sets aria-current="step" on the active step', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    render(<Steps {...props} />);

    const activeStep = screen.getByLabelText(/Configure — Active/);
    expect(activeStep).toHaveAttribute('aria-current', 'step');
  });

  it('does not set aria-current on pending or completed steps', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    render(<Steps {...props} />);

    const completedStep = screen.getByLabelText(/Setup — Completed/);
    expect(completedStep).not.toHaveAttribute('aria-current');

    const pendingStep = screen.getByLabelText(/Deploy — Pending/);
    expect(pendingStep).not.toHaveAttribute('aria-current');
  });

  it('renders an ordered list with role="list"', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    render(<Steps {...props} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('defaults to pending status when not specified', () => {
    const data: StepsData = {
      steps: [{ title: 'No Status', content: 'Should be pending' }],
    };
    const props = createMockProps<StepsData>(data, 'ui:steps');
    render(<Steps {...props} />);

    const step = screen.getByLabelText(/No Status — Pending/);
    expect(step).toBeInTheDocument();
  });

  // Nested block rendering tests
  it('renders BlockRenderer when step slot has children', () => {
    const childBlock: Block = {
      id: 'nested-1',
      type: 'ui:callout',
      data: { type: 'tip', content: 'tip text' },
      position: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    };
    const data: StepsData = {
      steps: [
        { title: 'Step 1', content: 'fallback' },
        { title: 'Step 2', content: 'shown' },
      ],
      _slotChildCounts: [1, 0],
    };
    const props = createMockProps<StepsData>(data, 'ui:steps');
    props.block.children = [childBlock];
    render(<Steps {...props} />);

    // Step 1 slot has 1 child → BlockRenderer
    expect(screen.getByTestId('block-renderer-nested-1')).toBeInTheDocument();
    // Step 2 slot has 0 children → RichText fallback
    expect(screen.getByText('shown')).toBeInTheDocument();
  });

  it('falls back to RichText for steps without children', () => {
    const data: StepsData = {
      steps: [{ title: 'Step', content: 'plain fallback' }],
      _slotChildCounts: [0],
    };
    const props = createMockProps<StepsData>(data, 'ui:steps');
    render(<Steps {...props} />);

    expect(screen.getByText('plain fallback')).toBeInTheDocument();
  });

  // Markdown rendering tests
  it('renders plain text in content when markdown=false', () => {
    const props = createMockProps<StepsData>(
      {
        steps: [{ title: 'Step', content: 'Plain text **not bold**' }],
        markdown: false,
      },
      'ui:steps',
    );
    render(<Steps {...props} />);
    expect(screen.getByText('Plain text **not bold**')).toBeInTheDocument();
  });

  it('renders formatted content when content is InlineNode[]', () => {
    const props = createMockProps<StepsData>(
      {
        steps: [
          {
            title: 'Step',
            content: [
              { type: 'text', value: 'This is ' },
              { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
              { type: 'text', value: ' and ' },
              { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] },
            ],
          },
        ],
        markdown: true,
      },
      'ui:steps',
    );
    render(<Steps {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');

    const italicEl = screen.getByText('italic');
    expect(italicEl.tagName).toBe('EM');
  });

  it('handles plain string in content even when markdown=true (backward compat)', () => {
    const props = createMockProps<StepsData>(
      {
        steps: [{ title: 'Step', content: 'Plain string' }],
        markdown: true,
      },
      'ui:steps',
    );
    render(<Steps {...props} />);
    expect(screen.getByText('Plain string')).toBeInTheDocument();
  });

  it('renders links in InlineNode[] content', () => {
    const props = createMockProps<StepsData>(
      {
        steps: [
          {
            title: 'Step',
            content: [
              { type: 'text', value: 'Visit ' },
              {
                type: 'link',
                url: 'https://example.com',
                children: [{ type: 'text', value: 'our site' }],
              },
            ],
          },
        ],
        markdown: true,
      },
      'ui:steps',
    );
    render(<Steps {...props} />);

    const link = screen.getByRole('link', { name: 'our site' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });
});
