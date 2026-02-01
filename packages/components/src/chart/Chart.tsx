import { useRef, useEffect, useState, useCallback } from 'react';
import type { ReactElement } from 'react';
import * as d3 from 'd3';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

/** Matches z.infer<typeof chartSchema> without importing zod. */
export interface ChartData {
  type: 'line' | 'bar' | 'area' | 'ohlc';
  series: { name: string; data: DataRecord[] }[];
  xAxis?: { key: string; label?: string };
  yAxis?: { key: string; label?: string };
  legend?: boolean;
}

type DataRecord = Record<string, number | string>;

// ─── Constants ─────────────────────────────────────────────────

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;
const MARGIN = { top: 20, right: 30, bottom: 50, left: 60 };

const COLOR_SCHEME = d3.schemeCategory10;

// ─── Helpers ───────────────────────────────────────────────────

function getNumericValue(d: DataRecord, key: string): number {
  const v = d[key];
  return typeof v === 'number' ? v : Number(v);
}

function getAllNumericValues(
  series: ChartData['series'],
  key: string,
): number[] {
  return series.flatMap((s: ChartData['series'][number]) =>
    s.data.map((d: DataRecord) => getNumericValue(d, key)),
  );
}

// ─── Component ─────────────────────────────────────────────────

/**
 * Renders a D3-powered chart supporting line, bar, area, and OHLC types.
 * Uses CSS variables for theming and includes accessibility features.
 */
export function Chart({ data }: GlyphComponentProps<ChartData>): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  const { type, series, xAxis, yAxis, legend } = data;
  const xKey = xAxis?.key ?? 'x';
  const yKey = yAxis?.key ?? 'y';
  const height = DEFAULT_HEIGHT;

  // ─── Responsive width via ResizeObserver ───────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width > 0) {
          setWidth(cr.width);
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ─── Tooltip helpers ───────────────────────────────────────

  const showTooltip = useCallback(
    (event: MouseEvent, text: string) => {
      const tip = tooltipRef.current;
      if (!tip) return;
      tip.textContent = text;
      tip.style.display = 'block';
      tip.style.left = `${String(event.offsetX + 12)}px`;
      tip.style.top = `${String(event.offsetY - 12)}px`;
    },
    [],
  );

  const hideTooltip = useCallback(() => {
    const tip = tooltipRef.current;
    if (!tip) return;
    tip.style.display = 'none';
  }, []);

  // ─── D3 rendering ─────────────────────────────────────────

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || series.length === 0) return;

    const sel = d3.select(svg);
    sel.selectAll('*').remove();

    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const g = sel
      .append('g')
      .attr('transform', `translate(${String(MARGIN.left)},${String(MARGIN.top)})`);

    // ─── Determine if x-axis is numeric or categorical ───

    const firstRecord = series[0]?.data[0];
    const xIsNumeric =
      firstRecord != null && typeof firstRecord[xKey] === 'number';

    // ─── X scale ─────────────────────────────────────────

    let xScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;
    let xScalePoint: (d: DataRecord) => number;

    if (type === 'bar' || !xIsNumeric) {
      // Categorical / band scale
      const allLabels: string[] = series.flatMap(
        (s: ChartData['series'][number]) =>
          s.data.map((d: DataRecord) => String(d[xKey] ?? '')),
      );
      const uniqueLabels = [...new Set<string>(allLabels)];
      const band = d3
        .scaleBand<string>()
        .domain(uniqueLabels)
        .range([0, innerWidth])
        .padding(0.2);
      xScale = band;
      xScalePoint = (d: DataRecord) =>
        (band(String(d[xKey] ?? '')) ?? 0) + band.bandwidth() / 2;
    } else {
      // Linear scale
      const allX = getAllNumericValues(series, xKey);
      const linear = d3
        .scaleLinear()
        .domain(d3.extent(allX) as [number, number])
        .nice()
        .range([0, innerWidth]);
      xScale = linear;
      xScalePoint = (d: DataRecord) => linear(getNumericValue(d, xKey));
    }

    // ─── Y scale ─────────────────────────────────────────

    let yMin: number;
    let yMax: number;

    if (type === 'ohlc') {
      const lows = getAllNumericValues(series, 'low');
      const highs = getAllNumericValues(series, 'high');
      yMin = d3.min(lows) ?? 0;
      yMax = d3.max(highs) ?? 0;
    } else {
      const allY = getAllNumericValues(series, yKey);
      yMin = d3.min(allY) ?? 0;
      yMax = d3.max(allY) ?? 0;
    }

    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .nice()
      .range([innerHeight, 0]);

    // ─── Axes ────────────────────────────────────────────

    const xAxisG = g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${String(innerHeight)})`);

    if ('bandwidth' in xScale) {
      xAxisG.call(
        d3.axisBottom(xScale as d3.ScaleBand<string>) as unknown as (
          sel: d3.Selection<SVGGElement, unknown, null, undefined>,
        ) => void,
      );
    } else {
      xAxisG.call(
        d3.axisBottom(xScale as d3.ScaleLinear<number, number>) as unknown as (
          sel: d3.Selection<SVGGElement, unknown, null, undefined>,
        ) => void,
      );
    }

    xAxisG
      .selectAll('text, line, path')
      .attr('fill', 'var(--glyph-text, #1a1a1a)')
      .attr('stroke', 'var(--glyph-grid, #ccc)');

    if (xAxis?.label) {
      g.append('text')
        .attr('class', 'x-label')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + MARGIN.bottom - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--glyph-text, #1a1a1a)')
        .attr('font-size', '12px')
        .text(xAxis.label);
    }

    const yAxisG = g.append('g').attr('class', 'y-axis');
    yAxisG.call(
      d3.axisLeft(yScale) as unknown as (
        sel: d3.Selection<SVGGElement, unknown, null, undefined>,
      ) => void,
    );

    yAxisG
      .selectAll('text, line, path')
      .attr('fill', 'var(--glyph-text, #1a1a1a)')
      .attr('stroke', 'var(--glyph-grid, #ccc)');

    if (yAxis?.label) {
      g.append('text')
        .attr('class', 'y-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -MARGIN.left + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--glyph-text, #1a1a1a)')
        .attr('font-size', '12px')
        .text(yAxis.label);
    }

    // ─── Grid lines ──────────────────────────────────────

    g.append('g')
      .attr('class', 'grid')
      .selectAll<SVGLineElement, number>('line')
      .data(yScale.ticks())
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d: number) => yScale(d))
      .attr('y2', (d: number) => yScale(d))
      .attr('stroke', 'var(--glyph-grid, #e0e0e0)')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-dasharray', '2,2');

    // ─── Render each series ──────────────────────────────

    series.forEach((s: ChartData['series'][number], i: number) => {
      const color = COLOR_SCHEME[i % COLOR_SCHEME.length] ?? '#333';

      switch (type) {
        case 'line': {
          const line = d3
            .line<DataRecord>()
            .x((d: DataRecord) => xScalePoint(d))
            .y((d: DataRecord) => yScale(getNumericValue(d, yKey)));

          g.append('path')
            .datum(s.data)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('d', line);

          // Data points with tooltip
          g.selectAll<SVGCircleElement, DataRecord>(`.dot-${String(i)}`)
            .data(s.data)
            .join('circle')
            .attr('class', `dot-${String(i)}`)
            .attr('cx', (d: DataRecord) => xScalePoint(d))
            .attr('cy', (d: DataRecord) => yScale(getNumericValue(d, yKey)))
            .attr('r', 3.5)
            .attr('fill', color)
            .attr('cursor', 'pointer')
            .on('mouseenter', function (this: SVGCircleElement, event: MouseEvent, d: DataRecord) {
              showTooltip(
                event,
                `${s.name}: ${String(d[xKey] ?? '')}, ${String(d[yKey] ?? '')}`,
              );
            })
            .on('mouseleave', () => hideTooltip());
          break;
        }

        case 'area': {
          const area = d3
            .area<DataRecord>()
            .x((d: DataRecord) => xScalePoint(d))
            .y0(innerHeight)
            .y1((d: DataRecord) => yScale(getNumericValue(d, yKey)));

          g.append('path')
            .datum(s.data)
            .attr('fill', color)
            .attr('fill-opacity', 0.3)
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('d', area);

          g.selectAll<SVGCircleElement, DataRecord>(`.dot-${String(i)}`)
            .data(s.data)
            .join('circle')
            .attr('class', `dot-${String(i)}`)
            .attr('cx', (d: DataRecord) => xScalePoint(d))
            .attr('cy', (d: DataRecord) => yScale(getNumericValue(d, yKey)))
            .attr('r', 3)
            .attr('fill', color)
            .attr('cursor', 'pointer')
            .on('mouseenter', function (this: SVGCircleElement, event: MouseEvent, d: DataRecord) {
              showTooltip(
                event,
                `${s.name}: ${String(d[xKey] ?? '')}, ${String(d[yKey] ?? '')}`,
              );
            })
            .on('mouseleave', () => hideTooltip());
          break;
        }

        case 'bar': {
          if (!('bandwidth' in xScale)) break;
          const band = xScale as d3.ScaleBand<string>;
          const seriesCount = series.length;
          const barWidth = band.bandwidth() / seriesCount;

          g.selectAll<SVGRectElement, DataRecord>(`.bar-${String(i)}`)
            .data(s.data)
            .join('rect')
            .attr('class', `bar-${String(i)}`)
            .attr(
              'x',
              (d: DataRecord) =>
                (band(String(d[xKey] ?? '')) ?? 0) + barWidth * i,
            )
            .attr('y', (d: DataRecord) => yScale(getNumericValue(d, yKey)))
            .attr('width', barWidth - 1)
            .attr(
              'height',
              (d: DataRecord) => innerHeight - yScale(getNumericValue(d, yKey)),
            )
            .attr('fill', color)
            .attr('cursor', 'pointer')
            .on('mouseenter', function (this: SVGRectElement, event: MouseEvent, d: DataRecord) {
              showTooltip(
                event,
                `${s.name}: ${String(d[xKey] ?? '')}, ${String(d[yKey] ?? '')}`,
              );
            })
            .on('mouseleave', () => hideTooltip());
          break;
        }

        case 'ohlc': {
          // Candlestick chart: expects open, high, low, close keys
          const candleWidth =
            'bandwidth' in xScale
              ? (xScale as d3.ScaleBand<string>).bandwidth() * 0.6
              : Math.max(4, innerWidth / (s.data.length * 2));

          s.data.forEach((d: DataRecord) => {
            const open = getNumericValue(d, 'open');
            const close = getNumericValue(d, 'close');
            const high = getNumericValue(d, 'high');
            const low = getNumericValue(d, 'low');
            const cx = xScalePoint(d);
            const isBullish = close >= open;
            const candleColor = isBullish
              ? 'var(--glyph-chart-bullish, #26a69a)'
              : 'var(--glyph-chart-bearish, #ef5350)';

            // High-low wick
            g.append('line')
              .attr('x1', cx)
              .attr('x2', cx)
              .attr('y1', yScale(high))
              .attr('y2', yScale(low))
              .attr('stroke', candleColor)
              .attr('stroke-width', 1);

            // Open-close body
            const bodyTop = yScale(Math.max(open, close));
            const bodyBottom = yScale(Math.min(open, close));
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);

            g.append('rect')
              .attr('x', cx - candleWidth / 2)
              .attr('y', bodyTop)
              .attr('width', candleWidth)
              .attr('height', bodyHeight)
              .attr('fill', candleColor)
              .attr('stroke', candleColor)
              .attr('cursor', 'pointer')
              .on('mouseenter', (event: MouseEvent) => {
                showTooltip(
                  event,
                  `${s.name}: O=${String(open)} H=${String(high)} L=${String(low)} C=${String(close)}`,
                );
              })
              .on('mouseleave', () => hideTooltip());
          });
          break;
        }
      }
    });

    // ─── Legend ───────────────────────────────────────────

    if (legend) {
      const legendG = sel
        .append('g')
        .attr(
          'transform',
          `translate(${String(MARGIN.left + 8)},${String(MARGIN.top)})`,
        );

      series.forEach((s: ChartData['series'][number], i: number) => {
        const color = COLOR_SCHEME[i % COLOR_SCHEME.length] ?? '#333';
        const row = legendG
          .append('g')
          .attr('transform', `translate(0,${String(i * 20)})`);

        row
          .append('rect')
          .attr('width', 14)
          .attr('height', 14)
          .attr('fill', color)
          .attr('rx', 2);

        row
          .append('text')
          .attr('x', 20)
          .attr('y', 11)
          .attr('fill', 'var(--glyph-text, #1a1a1a)')
          .attr('font-size', '12px')
          .text(s.name);
      });
    }
  }, [
    width,
    height,
    type,
    series,
    xKey,
    yKey,
    xAxis?.label,
    yAxis?.label,
    legend,
    showTooltip,
    hideTooltip,
  ]);

  // ─── Accessible hidden data table ──────────────────────────

  const accessibleTable = (
    <table
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      <caption>
        {type} chart data
      </caption>
      {series.map((s: ChartData['series'][number], si: number) => (
        <tbody key={si}>
          <tr>
            <th colSpan={2}>{s.name}</th>
          </tr>
          <tr>
            <th>{xAxis?.label ?? xKey}</th>
            <th>{yAxis?.label ?? yKey}</th>
          </tr>
          {s.data.map((d: DataRecord, di: number) => (
            <tr key={di}>
              <td>{String(d[xKey] ?? '')}</td>
              <td>
                {type === 'ohlc'
                  ? `O=${String(d['open'] ?? '')} H=${String(d['high'] ?? '')} L=${String(d['low'] ?? '')} C=${String(d['close'] ?? '')}`
                  : String(d[yKey] ?? '')}
              </td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );

  // ─── Render ────────────────────────────────────────────────

  const ariaLabel = `${type} chart with ${String(series.length)} series: ${series.map((s: ChartData['series'][number]) => s.name).join(', ')}`;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
      }}
    >
      <svg
        ref={svgRef}
        role="img"
        aria-label={ariaLabel}
        width={width}
        height={height}
        viewBox={`0 0 ${String(width)} ${String(height)}`}
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      />
      <div
        ref={tooltipRef}
        role="tooltip"
        aria-live="polite"
        style={{
          display: 'none',
          position: 'absolute',
          pointerEvents: 'none',
          backgroundColor: 'var(--glyph-tooltip-bg, rgba(0,0,0,0.8))',
          color: 'var(--glyph-tooltip-text, #fff)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}
      />
      {accessibleTable}
    </div>
  );
}
