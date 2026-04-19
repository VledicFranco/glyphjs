import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { gaugeSchema } from '@glyphjs/schemas';
import { Gauge } from '../Gauge.js';
import type { GaugeData } from '../Gauge.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Gauge', () => {
  const baseData: GaugeData = {
    label: 'Customer satisfaction',
    value: 78,
    min: 0,
    max: 100,
    unit: '%',
    zones: [
      { max: 40, label: 'Critical', sentiment: 'negative' },
      { max: 70, label: 'Warning', sentiment: 'neutral' },
      { max: 100, label: 'Healthy', sentiment: 'positive' },
    ],
    target: 80,
  };

  it('renders with minimal data', () => {
    const props = createMockProps<GaugeData>(
      { label: 'Progress', value: 42, max: 100 },
      'ui:gauge',
    );
    render(<Gauge {...props} />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('has role="meter" with aria-valuemin/max/now', () => {
    const props = createMockProps<GaugeData>(baseData, 'ui:gauge');
    render(<Gauge {...props} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(meter).toHaveAttribute('aria-valuenow', '78');
    expect(meter).toHaveAttribute('aria-label', 'Customer satisfaction');
  });

  it('includes unit, zone label, and target in aria-valuetext', () => {
    const props = createMockProps<GaugeData>(baseData, 'ui:gauge');
    render(<Gauge {...props} />);
    const meter = screen.getByRole('meter');
    const valueText = meter.getAttribute('aria-valuetext');
    expect(valueText).toContain('78');
    expect(valueText).toContain('%');
    expect(valueText).toContain('Healthy');
    expect(valueText).toContain('Target: 80');
  });

  it('renders the needle, pivot, and zones as SVG elements', () => {
    const props = createMockProps<GaugeData>(baseData, 'ui:gauge');
    render(<Gauge {...props} />);
    expect(screen.getByTestId('gauge-svg')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-needle')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-pivot')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-zone-0')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-zone-1')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-zone-2')).toBeInTheDocument();
  });

  it('renders a target marker when target is set', () => {
    const props = createMockProps<GaugeData>(baseData, 'ui:gauge');
    render(<Gauge {...props} />);
    expect(screen.getByTestId('gauge-target')).toBeInTheDocument();
  });

  it('omits target marker when target is absent', () => {
    const props = createMockProps<GaugeData>(
      { label: 'No Target', value: 10, max: 100 },
      'ui:gauge',
    );
    render(<Gauge {...props} />);
    expect(screen.queryByTestId('gauge-target')).not.toBeInTheDocument();
  });

  it('renders track arc instead of zones when zones are absent', () => {
    const props = createMockProps<GaugeData>({ label: 'Plain', value: 30, max: 100 }, 'ui:gauge');
    render(<Gauge {...props} />);
    expect(screen.getByTestId('gauge-track')).toBeInTheDocument();
    expect(screen.queryByTestId('gauge-zone-0')).not.toBeInTheDocument();
  });

  it('hides SVG from assistive technology', () => {
    const props = createMockProps<GaugeData>(baseData, 'ui:gauge');
    render(<Gauge {...props} />);
    const svg = screen.getByTestId('gauge-svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses different viewBox heights for semicircle vs full', () => {
    const semiProps = createMockProps<GaugeData>(
      { label: 'Semi', value: 50, max: 100, shape: 'semicircle' },
      'ui:gauge',
    );
    const { unmount } = render(<Gauge {...semiProps} />);
    const semiViewBox = screen.getByTestId('gauge-svg').getAttribute('viewBox');
    unmount();

    const fullProps = createMockProps<GaugeData>(
      { label: 'Full', value: 50, max: 100, shape: 'full' },
      'ui:gauge',
    );
    render(<Gauge {...fullProps} />);
    const fullViewBox = screen.getByTestId('gauge-svg').getAttribute('viewBox');

    expect(semiViewBox).not.toEqual(fullViewBox);
  });

  it('renders the current zone label below the value', () => {
    const props = createMockProps<GaugeData>(baseData, 'ui:gauge');
    render(<Gauge {...props} />);
    const zoneLabel = screen.getByTestId('gauge-zone-label');
    expect(zoneLabel).toHaveTextContent('Healthy');
  });

  it('does not render zone label when zones have no labels', () => {
    const props = createMockProps<GaugeData>(
      {
        label: 'Unlabeled',
        value: 50,
        max: 100,
        zones: [{ max: 50 }, { max: 100 }],
      },
      'ui:gauge',
    );
    render(<Gauge {...props} />);
    expect(screen.queryByTestId('gauge-zone-label')).not.toBeInTheDocument();
  });

  it('handles unit in aria-valuetext when no zones and no target', () => {
    const props = createMockProps<GaugeData>(
      { label: 'Simple', value: 60, max: 100, unit: 'points' },
      'ui:gauge',
    );
    render(<Gauge {...props} />);
    const meter = screen.getByRole('meter');
    expect(meter.getAttribute('aria-valuetext')).toContain('60 points');
  });

  // Schema-level validation tests
  describe('schema validation', () => {
    it('rejects value outside [min, max]', () => {
      const result = gaugeSchema.safeParse({
        label: 'Bad',
        value: 150,
        min: 0,
        max: 100,
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative value below min', () => {
      const result = gaugeSchema.safeParse({
        label: 'Bad',
        value: -5,
        min: 0,
        max: 100,
      });
      expect(result.success).toBe(false);
    });

    it('rejects min >= max', () => {
      const result = gaugeSchema.safeParse({
        label: 'Bad',
        value: 5,
        min: 100,
        max: 100,
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid minimum data', () => {
      const result = gaugeSchema.safeParse({
        label: 'OK',
        value: 50,
        max: 100,
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid full schema with zones and target', () => {
      const result = gaugeSchema.safeParse({
        label: 'CSAT',
        value: 78,
        min: 0,
        max: 100,
        unit: '%',
        zones: [
          { max: 40, sentiment: 'negative' },
          { max: 70, sentiment: 'neutral' },
          { max: 100, sentiment: 'positive' },
        ],
        target: 80,
      });
      expect(result.success).toBe(true);
    });

    it('rejects more than 6 zones', () => {
      const result = gaugeSchema.safeParse({
        label: 'Too many',
        value: 50,
        max: 100,
        zones: [
          { max: 10 },
          { max: 20 },
          { max: 30 },
          { max: 40 },
          { max: 50 },
          { max: 60 },
          { max: 70 },
        ],
      });
      expect(result.success).toBe(false);
    });
  });
});
