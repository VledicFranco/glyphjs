import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Slider } from '../Slider.js';
import type { SliderData } from '../Slider.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Slider', () => {
  const defaultParams = [
    { id: 'perf', label: 'Performance', min: 0, max: 100, step: 5, value: 50, unit: '%' },
    { id: 'cost', label: 'Budget', min: 0, max: 10000, step: 100, unit: '$' },
  ];

  it('renders parameter labels', () => {
    const props = createMockProps<SliderData>({ parameters: defaultParams }, 'ui:slider');
    render(<Slider {...props} />);
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Budget')).toBeInTheDocument();
  });

  it('renders range inputs', () => {
    const props = createMockProps<SliderData>({ parameters: defaultParams }, 'ui:slider');
    render(<Slider {...props} />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
  });

  it('displays current value with unit', () => {
    const props = createMockProps<SliderData>(
      { parameters: [{ id: 'x', label: 'X', min: 0, max: 100, value: 42, unit: '%' }] },
      'ui:slider',
    );
    render(<Slider {...props} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('fires onInteraction with allValues on change', () => {
    const onInteraction = vi.fn();
    const props = createMockProps<SliderData>({ parameters: defaultParams }, 'ui:slider');
    render(<Slider {...props} onInteraction={onInteraction} />);

    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '75' } });

    expect(onInteraction).toHaveBeenCalledOnce();
    const event = onInteraction.mock.calls[0][0];
    expect(event.kind).toBe('slider-change');
    expect(event.payload.parameterId).toBe('perf');
    expect(event.payload.value).toBe(75);
    expect(event.payload.allValues).toHaveLength(2);
  });

  it('ARIA attributes on range inputs', () => {
    const props = createMockProps<SliderData>(
      { parameters: [{ id: 'x', label: 'X', min: 10, max: 90, value: 50 }] },
      'ui:slider',
    );
    render(<Slider {...props} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '10');
    expect(slider).toHaveAttribute('aria-valuemax', '90');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders title when provided', () => {
    const props = createMockProps<SliderData>(
      { title: 'Preferences', parameters: defaultParams },
      'ui:slider',
    );
    render(<Slider {...props} />);
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Preferences');
  });

  it('shows min/max labels', () => {
    const props = createMockProps<SliderData>(
      { parameters: [{ id: 'x', label: 'X', min: 0, max: 100, unit: '%' }] },
      'ui:slider',
    );
    render(<Slider {...props} />);
    expect(screen.getAllByText('0%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('works without onInteraction', () => {
    const props = createMockProps<SliderData>({ parameters: defaultParams }, 'ui:slider');
    render(<Slider {...props} />);
    const sliders = screen.getAllByRole('slider');
    expect(() => fireEvent.change(sliders[0], { target: { value: '30' } })).not.toThrow();
  });
});
