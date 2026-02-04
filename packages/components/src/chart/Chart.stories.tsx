import type { Meta, StoryObj } from '@storybook/react';
import { Chart } from './Chart.js';
import React from 'react';
import { mockProps, mockBlock, mockContainer } from '../__storybook__/data.js';
import type { ChartData } from './Chart.js';

const meta: Meta<typeof Chart> = {
  component: Chart,
  title: 'Components/Chart',
};

export default meta;
type Story = StoryObj<typeof Chart>;

// ─── Line Chart ────────────────────────────────────────────────

export const LineChart: Story = {
  args: mockProps<ChartData>(
    {
      type: 'line',
      series: [
        {
          name: 'Revenue',
          data: [
            { x: 1, y: 100 },
            { x: 2, y: 150 },
            { x: 3, y: 130 },
            { x: 4, y: 200 },
            { x: 5, y: 180 },
          ],
        },
      ],
      xAxis: { key: 'x', label: 'Month' },
      yAxis: { key: 'y', label: 'Revenue ($K)' },
      legend: true,
    },
    { block: mockBlock({ id: 'chart-line', type: 'ui:chart' }) },
  ),
};

// ─── Bar Chart ─────────────────────────────────────────────────

export const BarChart: Story = {
  args: mockProps<ChartData>(
    {
      type: 'bar',
      series: [
        {
          name: 'Sales',
          data: [
            { x: 'Q1', y: 40 },
            { x: 'Q2', y: 55 },
            { x: 'Q3', y: 48 },
            { x: 'Q4', y: 72 },
          ],
        },
        {
          name: 'Returns',
          data: [
            { x: 'Q1', y: 5 },
            { x: 'Q2', y: 8 },
            { x: 'Q3', y: 3 },
            { x: 'Q4', y: 6 },
          ],
        },
      ],
      xAxis: { key: 'x', label: 'Quarter' },
      yAxis: { key: 'y', label: 'Units' },
      legend: true,
    },
    { block: mockBlock({ id: 'chart-bar', type: 'ui:chart' }) },
  ),
};

// ─── Area Chart ────────────────────────────────────────────────

export const AreaChart: Story = {
  args: mockProps<ChartData>(
    {
      type: 'area',
      series: [
        {
          name: 'Traffic',
          data: [
            { x: 1, y: 200 },
            { x: 2, y: 350 },
            { x: 3, y: 280 },
            { x: 4, y: 420 },
            { x: 5, y: 390 },
            { x: 6, y: 510 },
          ],
        },
      ],
      xAxis: { key: 'x', label: 'Week' },
      yAxis: { key: 'y', label: 'Visitors' },
      legend: false,
    },
    { block: mockBlock({ id: 'chart-area', type: 'ui:chart' }) },
  ),
};

// ─── OHLC Chart ────────────────────────────────────────────────

export const OHLCChart: Story = {
  args: mockProps<ChartData>(
    {
      type: 'ohlc',
      series: [
        {
          name: 'AAPL',
          data: [
            { x: 'Mon', open: 150, high: 155, low: 148, close: 153 },
            { x: 'Tue', open: 153, high: 158, low: 151, close: 156 },
            { x: 'Wed', open: 156, high: 157, low: 149, close: 150 },
            { x: 'Thu', open: 150, high: 154, low: 147, close: 152 },
            { x: 'Fri', open: 152, high: 160, low: 151, close: 159 },
          ],
        },
      ],
      xAxis: { key: 'x', label: 'Day' },
      yAxis: { key: 'close', label: 'Price ($)' },
      legend: true,
    },
    { block: mockBlock({ id: 'chart-ohlc', type: 'ui:chart' }) },
  ),
};

// ─── Compact ────────────────────────────────────────────────

export const Compact: Story = {
  args: mockProps<ChartData>(
    {
      type: 'line',
      series: [
        {
          name: 'Revenue',
          data: [
            { x: 1, y: 100 },
            { x: 2, y: 150 },
            { x: 3, y: 130 },
            { x: 4, y: 200 },
            { x: 5, y: 180 },
          ],
        },
      ],
      xAxis: { key: 'x', label: 'Month' },
      yAxis: { key: 'y', label: 'Revenue ($K)' },
      legend: true,
    },
    {
      block: mockBlock({ id: 'chart-compact', type: 'ui:chart' }),
      container: mockContainer({ tier: 'compact', width: 400 }),
    },
  ),
  decorators: [
    (Story) =>
      React.createElement('div', { style: { maxWidth: '400px' } }, React.createElement(Story)),
  ],
};
