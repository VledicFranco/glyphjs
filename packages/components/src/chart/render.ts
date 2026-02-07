import * as d3 from 'd3';
import type { InlineNode } from '@glyphjs/types';
import { inlineToText } from '../utils/inlineToText.js';

// ─── Types ─────────────────────────────────────────────────────

/** Matches z.infer<typeof chartSchema> without importing zod. */
export interface ChartData {
  type: 'line' | 'bar' | 'area' | 'ohlc';
  series: { name: string | InlineNode[]; data: DataRecord[] }[];
  xAxis?: { key: string; label?: string | InlineNode[] };
  yAxis?: { key: string; label?: string | InlineNode[] };
  legend?: boolean;
  markdown?: boolean;
}

export type DataRecord = Record<string, number | string>;

// ─── Constants ─────────────────────────────────────────────────

export const DEFAULT_WIDTH = 600;
export const DEFAULT_HEIGHT = 400;
export const MARGIN = { top: 20, right: 30, bottom: 50, left: 60 };

export const COLOR_SCHEME = [
  '#00d4aa', // cyan-green
  '#b44dff', // purple
  '#22c55e', // green
  '#e040fb', // magenta
  '#00e5ff', // teal
  '#84cc16', // lime
  '#f472b6', // rose
  '#fb923c', // orange
  '#818cf8', // indigo
  '#38bdf8', // sky
];

// ─── Helpers ───────────────────────────────────────────────────

export function getNumericValue(d: DataRecord, key: string): number {
  const v = d[key];
  return typeof v === 'number' ? v : Number(v);
}

export function getAllNumericValues(series: ChartData['series'], key: string): number[] {
  return series.flatMap((s: ChartData['series'][number]) =>
    s.data.map((d: DataRecord) => getNumericValue(d, key)),
  );
}

// ─── Tooltip callback type ────────────────────────────────────

export type ShowTooltipFn = (event: MouseEvent, text: string) => void;
export type HideTooltipFn = () => void;

// ─── Render helpers ───────────────────────────────────────────

type GSelection = d3.Selection<SVGGElement, unknown, null, undefined>;
type SVGSelection = d3.Selection<SVGSVGElement, unknown, null, undefined>;

export function renderAxes(
  g: GSelection,
  xScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>,
  yScale: d3.ScaleLinear<number, number>,
  xAxisConfig: ChartData['xAxis'],
  yAxisConfig: ChartData['yAxis'],
  innerWidth: number,
  innerHeight: number,
): void {
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
    .attr('fill', 'var(--glyph-text, #1a2035)')
    .attr('stroke', 'var(--glyph-grid, #1a2035)');

  if (xAxisConfig?.label) {
    g.append('text')
      .attr('class', 'x-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + MARGIN.bottom - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--glyph-text, #1a2035)')
      .attr('font-size', '12px')
      .text(inlineToText(xAxisConfig.label));
  }

  const yAxisG = g.append('g').attr('class', 'y-axis');
  yAxisG.call(
    d3.axisLeft(yScale) as unknown as (
      sel: d3.Selection<SVGGElement, unknown, null, undefined>,
    ) => void,
  );

  yAxisG
    .selectAll('text, line, path')
    .attr('fill', 'var(--glyph-text, #1a2035)')
    .attr('stroke', 'var(--glyph-grid, #1a2035)');

  if (yAxisConfig?.label) {
    g.append('text')
      .attr('class', 'y-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -MARGIN.left + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--glyph-text, #1a2035)')
      .attr('font-size', '12px')
      .text(inlineToText(yAxisConfig.label));
  }
}

export function renderGridLines(
  g: GSelection,
  yScale: d3.ScaleLinear<number, number>,
  innerWidth: number,
): void {
  g.append('g')
    .attr('class', 'grid')
    .selectAll<SVGLineElement, number>('line')
    .data(yScale.ticks())
    .join('line')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', (d: number) => yScale(d))
    .attr('y2', (d: number) => yScale(d))
    .attr('stroke', 'var(--glyph-grid, #1a2035)')
    .attr('stroke-opacity', 0.5)
    .attr('stroke-dasharray', '2,2');
}

export function renderLineSeries(
  g: GSelection,
  seriesData: DataRecord[],
  xScalePoint: (d: DataRecord) => number,
  yScale: d3.ScaleLinear<number, number>,
  yKey: string,
  xKey: string,
  color: string,
  index: number,
  seriesName: string,
  showTooltip: ShowTooltipFn,
  hideTooltip: HideTooltipFn,
): void {
  const line = d3
    .line<DataRecord>()
    .x((d: DataRecord) => xScalePoint(d))
    .y((d: DataRecord) => yScale(getNumericValue(d, yKey)));

  g.append('path')
    .datum(seriesData)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('d', line);

  // Data points with tooltip
  g.selectAll<SVGCircleElement, DataRecord>(`.dot-${String(index)}`)
    .data(seriesData)
    .join('circle')
    .attr('class', `dot-${String(index)}`)
    .attr('cx', (d: DataRecord) => xScalePoint(d))
    .attr('cy', (d: DataRecord) => yScale(getNumericValue(d, yKey)))
    .attr('r', 3.5)
    .attr('fill', color)
    .attr('cursor', 'pointer')
    .on('mouseenter', function (this: SVGCircleElement, event: MouseEvent, d: DataRecord) {
      showTooltip(event, `${seriesName}: ${String(d[xKey] ?? '')}, ${String(d[yKey] ?? '')}`);
    })
    .on('mouseleave', () => hideTooltip());
}

export function renderAreaSeries(
  g: GSelection,
  seriesData: DataRecord[],
  xScalePoint: (d: DataRecord) => number,
  yScale: d3.ScaleLinear<number, number>,
  yKey: string,
  xKey: string,
  innerHeight: number,
  color: string,
  index: number,
  seriesName: string,
  showTooltip: ShowTooltipFn,
  hideTooltip: HideTooltipFn,
): void {
  const area = d3
    .area<DataRecord>()
    .x((d: DataRecord) => xScalePoint(d))
    .y0(innerHeight)
    .y1((d: DataRecord) => yScale(getNumericValue(d, yKey)));

  g.append('path')
    .datum(seriesData)
    .attr('fill', color)
    .attr('fill-opacity', 0.3)
    .attr('stroke', color)
    .attr('stroke-width', 1.5)
    .attr('d', area);

  g.selectAll<SVGCircleElement, DataRecord>(`.dot-${String(index)}`)
    .data(seriesData)
    .join('circle')
    .attr('class', `dot-${String(index)}`)
    .attr('cx', (d: DataRecord) => xScalePoint(d))
    .attr('cy', (d: DataRecord) => yScale(getNumericValue(d, yKey)))
    .attr('r', 3)
    .attr('fill', color)
    .attr('cursor', 'pointer')
    .on('mouseenter', function (this: SVGCircleElement, event: MouseEvent, d: DataRecord) {
      showTooltip(event, `${seriesName}: ${String(d[xKey] ?? '')}, ${String(d[yKey] ?? '')}`);
    })
    .on('mouseleave', () => hideTooltip());
}

export function renderBarSeries(
  g: GSelection,
  seriesData: DataRecord[],
  xScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>,
  yScale: d3.ScaleLinear<number, number>,
  yKey: string,
  xKey: string,
  color: string,
  index: number,
  seriesCount: number,
  innerHeight: number,
  seriesName: string,
  showTooltip: ShowTooltipFn,
  hideTooltip: HideTooltipFn,
): void {
  if (!('bandwidth' in xScale)) return;
  const band = xScale as d3.ScaleBand<string>;
  const barWidth = band.bandwidth() / seriesCount;

  g.selectAll<SVGRectElement, DataRecord>(`.bar-${String(index)}`)
    .data(seriesData)
    .join('rect')
    .attr('class', `bar-${String(index)}`)
    .attr('x', (d: DataRecord) => (band(String(d[xKey] ?? '')) ?? 0) + barWidth * index)
    .attr('y', (d: DataRecord) => yScale(getNumericValue(d, yKey)))
    .attr('width', barWidth - 1)
    .attr('height', (d: DataRecord) => innerHeight - yScale(getNumericValue(d, yKey)))
    .attr('fill', color)
    .attr('cursor', 'pointer')
    .on('mouseenter', function (this: SVGRectElement, event: MouseEvent, d: DataRecord) {
      showTooltip(event, `${seriesName}: ${String(d[xKey] ?? '')}, ${String(d[yKey] ?? '')}`);
    })
    .on('mouseleave', () => hideTooltip());
}

export function renderOHLCSeries(
  g: GSelection,
  seriesData: DataRecord[],
  xScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>,
  xScalePoint: (d: DataRecord) => number,
  yScale: d3.ScaleLinear<number, number>,
  innerWidth: number,
  seriesName: string,
  showTooltip: ShowTooltipFn,
  hideTooltip: HideTooltipFn,
): void {
  // Candlestick chart: expects open, high, low, close keys
  const candleWidth =
    'bandwidth' in xScale
      ? (xScale as d3.ScaleBand<string>).bandwidth() * 0.6
      : Math.max(4, innerWidth / (seriesData.length * 2));

  seriesData.forEach((d: DataRecord) => {
    const open = getNumericValue(d, 'open');
    const close = getNumericValue(d, 'close');
    const high = getNumericValue(d, 'high');
    const low = getNumericValue(d, 'low');
    const cx = xScalePoint(d);
    const isBullish = close >= open;
    const candleColor = isBullish
      ? 'var(--glyph-chart-bullish, #22c55e)'
      : 'var(--glyph-chart-bearish, #f87171)';

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
          `${seriesName}: O=${String(open)} H=${String(high)} L=${String(low)} C=${String(close)}`,
        );
      })
      .on('mouseleave', () => hideTooltip());
  });
}

export function renderLegend(
  sel: SVGSelection,
  series: ChartData['series'],
  marginLeft: number,
  marginTop: number,
  fontSize = '12px',
): void {
  const legendG = sel
    .append('g')
    .attr('transform', `translate(${String(marginLeft + 8)},${String(marginTop)})`);

  series.forEach((s: ChartData['series'][number], i: number) => {
    const color = COLOR_SCHEME[i % COLOR_SCHEME.length] ?? 'var(--glyph-text, #1a2035)';
    const row = legendG.append('g').attr('transform', `translate(0,${String(i * 20)})`);

    row.append('rect').attr('width', 14).attr('height', 14).attr('fill', color).attr('rx', 2);

    row
      .append('text')
      .attr('x', 20)
      .attr('y', 11)
      .attr('fill', 'var(--glyph-text, #1a2035)')
      .attr('font-size', fontSize)
      .text(inlineToText(s.name));
  });
}
