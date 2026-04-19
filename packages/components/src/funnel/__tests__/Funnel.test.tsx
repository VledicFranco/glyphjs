import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Funnel } from '../Funnel.js';
import type { FunnelData } from '../Funnel.js';
import { createMockProps } from '../../__tests__/helpers.js';
import { funnelSchema } from '@glyphjs/schemas';

const acceptanceFunnel: FunnelData = {
  title: 'Action acceptance',
  stages: [
    { label: 'Recommended', value: 420 },
    { label: 'Reviewed', value: 310 },
    { label: 'Accepted', value: 180 },
    { label: 'Executed', value: 155 },
  ],
  showConversion: true,
  orientation: 'vertical',
  unit: 'actions',
};

describe('Funnel', () => {
  it('renders without crashing', () => {
    const props = createMockProps<FunnelData>(acceptanceFunnel, 'ui:funnel');
    render(<Funnel {...props} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('renders a title when provided', () => {
    const props = createMockProps<FunnelData>(acceptanceFunnel, 'ui:funnel');
    render(<Funnel {...props} />);
    expect(screen.getByText('Action acceptance')).toBeInTheDocument();
  });

  it('falls back to a generic aria-label when title is missing', () => {
    const data: FunnelData = {
      stages: [
        { label: 'A', value: 100 },
        { label: 'B', value: 50 },
      ],
    };
    const props = createMockProps<FunnelData>(data, 'ui:funnel');
    render(<Funnel {...props} />);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Funnel');
  });

  it('renders an <ol> (list) with one <li> per stage', () => {
    const props = createMockProps<FunnelData>(acceptanceFunnel, 'ui:funnel');
    const { container } = render(<Funnel {...props} />);
    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(acceptanceFunnel.stages.length);
  });

  it('each stage <li> has an aria-label with label, value, and conversion percentage', () => {
    const props = createMockProps<FunnelData>(acceptanceFunnel, 'ui:funnel');
    render(<Funnel {...props} />);

    // Stage 1 — first stage reports 100%
    const first = screen.getByLabelText(/Stage 1: Recommended, 420 actions, 100% of total/);
    expect(first).toBeInTheDocument();

    // Stage 2 — 310/420 = 74%
    const second = screen.getByLabelText(/Stage 2: Reviewed, 310 actions, 74% of previous/);
    expect(second).toBeInTheDocument();

    // Stage 3 — 180/310 = 58%
    const third = screen.getByLabelText(/Stage 3: Accepted, 180 actions, 58% of previous/);
    expect(third).toBeInTheDocument();

    // Stage 4 — 155/180 = 86%
    const fourth = screen.getByLabelText(/Stage 4: Executed, 155 actions, 86% of previous/);
    expect(fourth).toBeInTheDocument();
  });

  it('renders conversion annotations when showConversion is true (default)', () => {
    const props = createMockProps<FunnelData>(acceptanceFunnel, 'ui:funnel');
    const { container } = render(<Funnel {...props} />);

    // Conversion percentages appear as SVG text nodes (e.g., 74%, 58%, 86%)
    const texts = Array.from(container.querySelectorAll('text')).map((el) => el.textContent);
    expect(texts).toEqual(expect.arrayContaining(['74%', '58%', '86%']));
    // Drop counts use the unicode minus sign
    expect(texts.some((t) => t?.startsWith('\u2212'))).toBe(true);
  });

  it('omits conversion annotations when showConversion is false', () => {
    const data: FunnelData = { ...acceptanceFunnel, showConversion: false };
    const props = createMockProps<FunnelData>(data, 'ui:funnel');
    const { container } = render(<Funnel {...props} />);

    const texts = Array.from(container.querySelectorAll('text')).map((el) => el.textContent);
    expect(texts).not.toEqual(expect.arrayContaining(['74%']));
    // No minus-sign drop counts either
    expect(texts.some((t) => t?.startsWith('\u2212'))).toBe(false);
  });

  it('renders small conversion rates with one decimal precision', () => {
    const data: FunnelData = {
      stages: [
        { label: 'Seen', value: 10000 },
        { label: 'Clicked', value: 500 }, // 5.0%
      ],
    };
    const props = createMockProps<FunnelData>(data, 'ui:funnel');
    const { container } = render(<Funnel {...props} />);
    const texts = Array.from(container.querySelectorAll('text')).map((el) => el.textContent);
    expect(texts).toEqual(expect.arrayContaining(['5.0%']));
  });

  it('renders in horizontal orientation', () => {
    const data: FunnelData = { ...acceptanceFunnel, orientation: 'horizontal' };
    const props = createMockProps<FunnelData>(data, 'ui:funnel');
    const { container } = render(<Funnel {...props} />);
    expect(container.querySelector('svg')).not.toBeNull();
    // Still renders a list with one item per stage
    expect(container.querySelectorAll('li').length).toBe(4);
  });

  it('renders stage value text inside SVG', () => {
    const props = createMockProps<FunnelData>(acceptanceFunnel, 'ui:funnel');
    const { container } = render(<Funnel {...props} />);
    const texts = Array.from(container.querySelectorAll('text')).map((el) => el.textContent);
    // Value is rendered with unit suffix via toLocaleString
    expect(texts).toEqual(
      expect.arrayContaining(['420 actions', '310 actions', '180 actions', '155 actions']),
    );
  });

  it('clamps out-of-order stages defensively at render time', () => {
    // This data bypasses Zod (we inject it directly). The component should
    // clamp stage[1] to stage[0]'s value to avoid inverted trapezoids.
    const data: FunnelData = {
      stages: [
        { label: 'A', value: 100 },
        { label: 'B', value: 200 }, // Out of order; should be treated as 100
      ],
      showConversion: true,
    };
    const props = createMockProps<FunnelData>(data, 'ui:funnel');
    render(<Funnel {...props} />);
    // Stage 2's conversion would be 100/100 = 100% after clamping
    const second = screen.getByLabelText(/Stage 2: B, 100/);
    expect(second).toBeInTheDocument();
  });

  it('schema rejects monotonic-decrease violations', () => {
    const bad = {
      stages: [
        { label: 'A', value: 100 },
        { label: 'B', value: 150 },
      ],
    };
    const result = funnelSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('schema accepts an equal-value sequence (non-increasing, not strictly)', () => {
    const data = {
      stages: [
        { label: 'A', value: 100 },
        { label: 'B', value: 100 },
      ],
    };
    const result = funnelSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
