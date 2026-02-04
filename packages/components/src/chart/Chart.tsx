import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactElement } from 'react';
import * as d3 from 'd3';
import type { GlyphComponentProps } from '@glyphjs/types';
import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  MARGIN,
  COLOR_SCHEME,
  getNumericValue,
  getAllNumericValues,
  renderAxes,
  renderGridLines,
  renderLineSeries,
  renderAreaSeries,
  renderBarSeries,
  renderOHLCSeries,
  renderLegend,
} from './render.js';
import type { ChartData, DataRecord } from './render.js';
import { ChartAccessibleTable } from './ChartAccessibleTable.js';

export type { ChartData } from './render.js';

// ─── Component ─────────────────────────────────────────────────

/**
 * Renders a D3-powered chart supporting line, bar, area, and OHLC types.
 * Uses CSS variables for theming and includes accessibility features.
 */
export function Chart({
  data,
  container: containerCtx,
}: GlyphComponentProps<ChartData>): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  const { type, series, xAxis, yAxis, legend } = data;
  const xKey = xAxis?.key ?? 'x';
  const yKey = yAxis?.key ?? 'y';
  const height = DEFAULT_HEIGHT;
  const isCompact = containerCtx.tier === 'compact';
  const margin = isCompact
    ? {
        top: Math.round(MARGIN.top * 0.7),
        right: Math.round(MARGIN.right * 0.7),
        bottom: Math.round(MARGIN.bottom * 0.7),
        left: Math.round(MARGIN.left * 0.7),
      }
    : MARGIN;

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

  const showTooltip = useCallback((event: MouseEvent, text: string) => {
    const tip = tooltipRef.current;
    if (!tip) return;
    tip.textContent = text;
    tip.style.display = 'block';
    tip.style.left = `${String(event.offsetX + 12)}px`;
    tip.style.top = `${String(event.offsetY - 12)}px`;
  }, []);

  const hideTooltip = useCallback(() => {
    const tip = tooltipRef.current;
    if (!tip) return;
    tip.style.display = 'none';
  }, []);

  const scales = useMemo(() => {
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const firstRecord = series[0]?.data[0];
    const xIsNumeric = firstRecord != null && typeof firstRecord[xKey] === 'number';
    let xScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;
    let xScalePoint: (d: DataRecord) => number;

    if (type === 'bar' || !xIsNumeric) {
      const allLabels: string[] = series.flatMap((s: ChartData['series'][number]) =>
        s.data.map((d: DataRecord) => String(d[xKey] ?? '')),
      );
      const uniqueLabels = [...new Set<string>(allLabels)];
      const band = d3.scaleBand<string>().domain(uniqueLabels).range([0, innerWidth]).padding(0.2);
      xScale = band;
      xScalePoint = (d: DataRecord) => (band(String(d[xKey] ?? '')) ?? 0) + band.bandwidth() / 2;
    } else {
      const allX = getAllNumericValues(series, xKey);
      const linear = d3
        .scaleLinear()
        .domain(d3.extent(allX) as [number, number])
        .nice()
        .range([0, innerWidth]);
      xScale = linear;
      xScalePoint = (d: DataRecord) => linear(getNumericValue(d, xKey));
    }

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

    const yScale = d3.scaleLinear().domain([yMin, yMax]).nice().range([innerHeight, 0]);

    return { xScale, xScalePoint, yScale, innerWidth, innerHeight };
  }, [width, height, type, series, xKey, yKey, margin]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || series.length === 0) return;

    const sel = d3.select(svg);
    sel.selectAll('*').remove();

    const { xScale, xScalePoint, yScale, innerWidth, innerHeight } = scales;

    const g = sel
      .append('g')
      .attr('transform', `translate(${String(margin.left)},${String(margin.top)})`);

    renderAxes(g, xScale, yScale, xAxis, yAxis, innerWidth, innerHeight);
    renderGridLines(g, yScale, innerWidth);
    series.forEach((s: ChartData['series'][number], i: number) => {
      const color = COLOR_SCHEME[i % COLOR_SCHEME.length] ?? '#333';
      switch (type) {
        case 'line':
          renderLineSeries(
            g,
            s.data,
            xScalePoint,
            yScale,
            yKey,
            xKey,
            color,
            i,
            s.name,
            showTooltip,
            hideTooltip,
          );
          break;
        case 'area':
          renderAreaSeries(
            g,
            s.data,
            xScalePoint,
            yScale,
            yKey,
            xKey,
            innerHeight,
            color,
            i,
            s.name,
            showTooltip,
            hideTooltip,
          );
          break;
        case 'bar':
          renderBarSeries(
            g,
            s.data,
            xScale,
            yScale,
            yKey,
            xKey,
            color,
            i,
            series.length,
            innerHeight,
            s.name,
            showTooltip,
            hideTooltip,
          );
          break;
        case 'ohlc':
          renderOHLCSeries(
            g,
            s.data,
            xScale,
            xScalePoint,
            yScale,
            innerWidth,
            s.name,
            showTooltip,
            hideTooltip,
          );
          break;
      }
    });

    if (legend) {
      renderLegend(sel, series, margin.left, margin.top, isCompact ? '10px' : undefined);
    }
  }, [
    scales,
    type,
    series,
    xKey,
    yKey,
    xAxis,
    yAxis,
    legend,
    margin,
    isCompact,
    showTooltip,
    hideTooltip,
  ]);

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
          color: 'var(--glyph-tooltip-text, #d4dae3)',
          padding: '4px 8px',
          borderRadius: '3px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}
      />
      <ChartAccessibleTable
        type={type}
        series={series}
        xKey={xKey}
        yKey={yKey}
        xLabel={xAxis?.label}
        yLabel={yAxis?.label}
      />
    </div>
  );
}
