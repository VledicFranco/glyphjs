import type { Meta, StoryObj } from '@storybook/react';
import { Gauge } from './Gauge.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { GaugeData } from './Gauge.js';

const meta: Meta<typeof Gauge> = {
  component: Gauge,
  title: 'Components/Gauge',
};

export default meta;
type Story = StoryObj<typeof Gauge>;

// ─── Default ────────────────────────────────────────────────

export const Default: Story = {
  args: mockProps<GaugeData>(
    {
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
    },
    { block: mockBlock({ id: 'gauge-default', type: 'ui:gauge' }) },
  ),
};

// ─── Full Dial ──────────────────────────────────────────────

export const FullDial: Story = {
  args: mockProps<GaugeData>(
    {
      label: 'Engine RPM',
      value: 4200,
      min: 0,
      max: 8000,
      unit: 'rpm',
      shape: 'full',
      zones: [
        { max: 3000, label: 'Eco', sentiment: 'positive' },
        { max: 6000, label: 'Normal', sentiment: 'neutral' },
        { max: 8000, label: 'Redline', sentiment: 'negative' },
      ],
    },
    { block: mockBlock({ id: 'gauge-full', type: 'ui:gauge' }) },
  ),
};

// ─── With Target ────────────────────────────────────────────

export const WithTarget: Story = {
  args: mockProps<GaugeData>(
    {
      label: 'Quarterly revenue',
      value: 1.8,
      min: 0,
      max: 3,
      unit: 'M',
      target: 2.5,
      zones: [
        { max: 1, sentiment: 'negative', label: 'Miss' },
        { max: 2, sentiment: 'neutral', label: 'Partial' },
        { max: 3, sentiment: 'positive', label: 'Hit' },
      ],
    },
    { block: mockBlock({ id: 'gauge-target', type: 'ui:gauge' }) },
  ),
};

// ─── No Zones (plain meter) ─────────────────────────────────

export const NoZones: Story = {
  args: mockProps<GaugeData>(
    {
      label: 'Disk usage',
      value: 62,
      min: 0,
      max: 100,
      unit: '%',
    },
    { block: mockBlock({ id: 'gauge-no-zones', type: 'ui:gauge' }) },
  ),
};

// ─── Critical Zone ──────────────────────────────────────────

export const CriticalZone: Story = {
  args: mockProps<GaugeData>(
    {
      label: 'Server error rate',
      value: 12,
      min: 0,
      max: 100,
      unit: '%',
      zones: [
        { max: 5, label: 'Healthy', sentiment: 'positive' },
        { max: 10, label: 'Warning', sentiment: 'neutral' },
        { max: 100, label: 'Critical', sentiment: 'negative' },
      ],
      target: 1,
    },
    { block: mockBlock({ id: 'gauge-critical', type: 'ui:gauge' }) },
  ),
};

// ─── Confidence Score (0-1 scale) ───────────────────────────

export const ConfidenceScore: Story = {
  args: mockProps<GaugeData>(
    {
      label: 'Model confidence',
      value: 0.82,
      min: 0,
      max: 1,
      zones: [
        { max: 0.4, label: 'Low', sentiment: 'negative' },
        { max: 0.7, label: 'Moderate', sentiment: 'neutral' },
        { max: 1, label: 'High', sentiment: 'positive' },
      ],
    },
    { block: mockBlock({ id: 'gauge-confidence', type: 'ui:gauge' }) },
  ),
};
