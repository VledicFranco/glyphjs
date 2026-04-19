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

  // ─── Arc geometry: regression tests for the angle-mirroring bug ─────────
  // The Gauge once wrapped every angle in `toSvgAngle = -θ`, which reflected the
  // arc below cy and clipped it out of the viewBox. These tests pin the visual
  // contract: zone arcs sweep OVER the top, the needle tip sits in the upper
  // half, and full-dial midpoint lands at 12 o'clock.

  /** Parse an `M sx sy A rx ry rot largeArc sweep ex ey` path string. */
  function parseArc(d: string): {
    sx: number;
    sy: number;
    rx: number;
    ry: number;
    largeArc: number;
    sweep: number;
    ex: number;
    ey: number;
  } {
    const re =
      /^M\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+A\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+\d+\s+(\d)\s+(\d)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/;
    const m = re.exec(d);
    if (!m) throw new Error(`Path did not match arc shape: ${d}`);
    return {
      sx: Number(m[1]),
      sy: Number(m[2]),
      rx: Number(m[3]),
      ry: Number(m[4]),
      largeArc: Number(m[5]),
      sweep: Number(m[6]),
      ex: Number(m[7]),
      ey: Number(m[8]),
    };
  }

  describe('arc geometry', () => {
    it('semicircle zone arc sweeps over the top (start at left, end at right, equal y at cy)', () => {
      const props = createMockProps<GaugeData>(
        {
          label: 'x',
          value: 50,
          min: 0,
          max: 100,
          zones: [{ max: 100, sentiment: 'positive' }],
        },
        'ui:gauge',
      );
      const { container } = render(<Gauge {...props} />);
      const zone = container.querySelector('[data-testid="gauge-zone-0"]');
      expect(zone).not.toBeNull();
      const d = zone!.getAttribute('d')!;
      expect(d).toMatch(/^M\s+\S+\s+\S+\s+A/);

      const arc = parseArc(d);
      // VIEWBOX_SIZE=200, CENTER_X=100, semicircle: cy = 124, radius = 84
      const cx = 100;
      const cy = 200 * 0.62;
      const r = 200 * 0.42;
      // Start at left (cx - r, cy), end at right (cx + r, cy)
      expect(arc.sx).toBeCloseTo(cx - r, 5);
      expect(arc.sy).toBeCloseTo(cy, 5);
      expect(arc.ex).toBeCloseTo(cx + r, 5);
      expect(arc.ey).toBeCloseTo(cy, 5);
      // Half-circle is exactly 180° → largeArc may be 0 by convention here.
      expect(arc.largeArc).toBe(0);
      // Sweep flag must produce the OVER-the-top arc. With our angle parameterization
      // (cx + r·cos θ, cy + r·sin θ) going from θ=π to θ=2π (the upper half in SVG
      // y-down coords), the screen direction is clockwise → sweep=1.
      expect(arc.sweep).toBe(1);
    });

    it('semicircle zone arcs do NOT sit below cy (regression for toSvgAngle bug)', () => {
      const props = createMockProps<GaugeData>(
        {
          label: 'x',
          value: 50,
          min: 0,
          max: 100,
          zones: [
            { max: 50, sentiment: 'negative' },
            { max: 100, sentiment: 'positive' },
          ],
        },
        'ui:gauge',
      );
      const { container } = render(<Gauge {...props} />);
      const cy = 200 * 0.62;
      // Zone 1 (max=50) goes from value 0 (left, on cy) to value 50 (top, well above cy).
      // Its endpoint y must be ABOVE cy (smaller numerically since SVG y grows down).
      const zone0 = container.querySelector('[data-testid="gauge-zone-0"]')!;
      const arc0 = parseArc(zone0.getAttribute('d')!);
      expect(arc0.sy).toBeCloseTo(cy, 5); // starts at left edge on cy
      expect(arc0.ey).toBeLessThan(cy); // ends at the top half
      // Zone 2 (max=100) starts at top, ends at right edge on cy.
      const zone1 = container.querySelector('[data-testid="gauge-zone-1"]')!;
      const arc1 = parseArc(zone1.getAttribute('d')!);
      expect(arc1.sy).toBeLessThan(cy); // starts above cy
      expect(arc1.ey).toBeCloseTo(cy, 5); // ends on cy (right edge)
    });

    it('semicircle needle tip for value=78 sits in the upper-right quadrant', () => {
      const props = createMockProps<GaugeData>(
        { label: 'x', value: 78, min: 0, max: 100 },
        'ui:gauge',
      );
      const { container } = render(<Gauge {...props} />);
      const needle = container.querySelector('[data-testid="gauge-needle"]')!;
      const cx = 100;
      const cy = 200 * 0.62;
      const x2 = Number(needle.getAttribute('x2'));
      const y2 = Number(needle.getAttribute('y2'));
      expect(x2).toBeGreaterThan(cx); // right of center
      expect(y2).toBeLessThan(cy); // above center (smaller y in SVG)
    });

    it('semicircle needle tip for value=min sits at the left edge on cy', () => {
      const props = createMockProps<GaugeData>(
        { label: 'x', value: 0, min: 0, max: 100 },
        'ui:gauge',
      );
      const { container } = render(<Gauge {...props} />);
      const needle = container.querySelector('[data-testid="gauge-needle"]')!;
      const cx = 100;
      const cy = 200 * 0.62;
      const r = 200 * 0.42;
      const tipLen = r * 0.9;
      const x2 = Number(needle.getAttribute('x2'));
      const y2 = Number(needle.getAttribute('y2'));
      expect(x2).toBeCloseTo(cx - tipLen, 5);
      expect(y2).toBeCloseTo(cy, 5);
    });

    it('semicircle needle tip for value=max sits at the right edge on cy', () => {
      const props = createMockProps<GaugeData>(
        { label: 'x', value: 100, min: 0, max: 100 },
        'ui:gauge',
      );
      const { container } = render(<Gauge {...props} />);
      const needle = container.querySelector('[data-testid="gauge-needle"]')!;
      const cx = 100;
      const cy = 200 * 0.62;
      const r = 200 * 0.42;
      const tipLen = r * 0.9;
      const x2 = Number(needle.getAttribute('x2'));
      const y2 = Number(needle.getAttribute('y2'));
      expect(x2).toBeCloseTo(cx + tipLen, 5);
      expect(y2).toBeCloseTo(cy, 5);
    });

    it('semicircle needle tip for value=midpoint sits straight up at the top', () => {
      const props = createMockProps<GaugeData>(
        { label: 'x', value: 50, min: 0, max: 100 },
        'ui:gauge',
      );
      const { container } = render(<Gauge {...props} />);
      const needle = container.querySelector('[data-testid="gauge-needle"]')!;
      const cx = 100;
      const cy = 200 * 0.62;
      const r = 200 * 0.42;
      const tipLen = r * 0.9;
      const x2 = Number(needle.getAttribute('x2'));
      const y2 = Number(needle.getAttribute('y2'));
      expect(x2).toBeCloseTo(cx, 5);
      expect(y2).toBeCloseTo(cy - tipLen, 5);
    });

    it("full dial uses 270° sweep with largeArc=1 and needle midpoint at 12 o'clock", () => {
      const props = createMockProps<GaugeData>(
        { label: 'x', value: 50, min: 0, max: 100, shape: 'full' },
        'ui:gauge',
      );
      const { container } = render(<Gauge {...props} />);
      const track = container.querySelector('[data-testid="gauge-track"]')!;
      const arc = parseArc(track.getAttribute('d')!);
      // Full dial → 270° → largeArc=1
      expect(arc.largeArc).toBe(1);
      expect(arc.sweep).toBe(1);

      // Needle at midpoint should point straight up (12 o'clock)
      const needle = container.querySelector('[data-testid="gauge-needle"]')!;
      const cx = 100;
      const cy = 200 / 2;
      const r = 200 * 0.38;
      const tipLen = r * 0.9;
      const x2 = Number(needle.getAttribute('x2'));
      const y2 = Number(needle.getAttribute('y2'));
      expect(x2).toBeCloseTo(cx, 5);
      expect(y2).toBeCloseTo(cy - tipLen, 5);
    });

    it('target marker for value > midpoint sits on the upper-right side of the arc', () => {
      const props = createMockProps<GaugeData>(
        { label: 'x', value: 50, min: 0, max: 100, target: 80 },
        'ui:gauge',
      );
      const { container } = render(<Gauge {...props} />);
      const target = container.querySelector('[data-testid="gauge-target"]')!;
      const cx = 100;
      const cy = 200 * 0.62;
      const x1 = Number(target.getAttribute('x1'));
      const y1 = Number(target.getAttribute('y1'));
      // Target at 80% should be in the upper-right (positive cos, negative sin in SVG).
      expect(x1).toBeGreaterThan(cx);
      expect(y1).toBeLessThan(cy);
    });
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
