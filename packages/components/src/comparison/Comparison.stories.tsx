import type { Meta, StoryObj } from '@storybook/react';
import { Comparison } from './Comparison.js';
import React from 'react';
import { mockProps, mockBlock, mockContainer } from '../__storybook__/data.js';
import type { ComparisonData } from './Comparison.js';

const meta: Meta<typeof Comparison> = {
  component: Comparison,
  title: 'Components/Comparison',
};

export default meta;
type Story = StoryObj<typeof Comparison>;

// ─── Default ──────────────────────────────────────────────────

export const Default: Story = {
  args: mockProps<ComparisonData>(
    {
      title: 'Frontend Frameworks',
      options: [
        { name: 'React', description: 'Component-based library' },
        { name: 'Vue', description: 'Progressive framework' },
        { name: 'Svelte', description: 'Compiler-based framework' },
      ],
      features: [
        { name: 'Learning curve', values: ['moderate', 'easy', 'easy'] },
        { name: 'TypeScript support', values: ['full', 'full', 'full'] },
        { name: 'Bundle size', values: ['large', 'medium', 'small'] },
        { name: 'SSR built-in', values: ['no', 'yes', 'yes'] },
        { name: 'Ecosystem size', values: ['very large', 'large', 'growing'] },
      ],
    },
    { block: mockBlock({ id: 'comparison-default', type: 'ui:comparison' }) },
  ),
};

// ─── Two Options ──────────────────────────────────────────────

export const TwoOptions: Story = {
  args: mockProps<ComparisonData>(
    {
      title: 'SQL vs NoSQL',
      options: [
        { name: 'SQL', description: 'Relational databases' },
        { name: 'NoSQL', description: 'Document stores' },
      ],
      features: [
        { name: 'Schema', values: ['yes', 'no'] },
        { name: 'ACID', values: ['yes', 'partial'] },
        { name: 'Horizontal scaling', values: ['partial', 'yes'] },
        { name: 'Joins', values: ['yes', 'no'] },
      ],
    },
    { block: mockBlock({ id: 'comparison-two', type: 'ui:comparison' }) },
  ),
};

// ─── Max Options (6) ──────────────────────────────────────────

export const MaxOptions: Story = {
  args: mockProps<ComparisonData>(
    {
      title: 'Cloud Providers',
      options: [
        { name: 'AWS' },
        { name: 'Azure' },
        { name: 'GCP' },
        { name: 'DO' },
        { name: 'Vercel' },
        { name: 'Fly.io' },
      ],
      features: [
        { name: 'Serverless', values: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes'] },
        { name: 'Kubernetes', values: ['yes', 'yes', 'yes', 'yes', 'no', 'partial'] },
        { name: 'Edge CDN', values: ['yes', 'yes', 'yes', 'no', 'yes', 'yes'] },
      ],
    },
    { block: mockBlock({ id: 'comparison-max', type: 'ui:comparison' }) },
  ),
};

// ─── All Partial ──────────────────────────────────────────────

export const AllPartial: Story = {
  args: mockProps<ComparisonData>(
    {
      title: 'Feature Parity',
      options: [{ name: 'v1.0' }, { name: 'v2.0' }, { name: 'v3.0' }],
      features: [
        { name: 'Auth', values: ['partial', 'partial', 'partial'] },
        { name: 'SSO', values: ['partial', 'partial', 'partial'] },
        { name: 'RBAC', values: ['partial', 'partial', 'partial'] },
      ],
    },
    { block: mockBlock({ id: 'comparison-partial', type: 'ui:comparison' }) },
  ),
};

// ─── Custom Text Values ──────────────────────────────────────

export const CustomTextValues: Story = {
  args: mockProps<ComparisonData>(
    {
      title: 'Pricing Plans',
      options: [
        { name: 'Free', description: '$0/mo' },
        { name: 'Pro', description: '$29/mo' },
        { name: 'Enterprise', description: 'Custom' },
      ],
      features: [
        { name: 'Users', values: ['5', '50', 'Unlimited'] },
        { name: 'Storage', values: ['1 GB', '100 GB', '1 TB'] },
        { name: 'Support', values: ['Community', 'Email', '24/7 dedicated'] },
        { name: 'SSO', values: ['no', 'partial', 'yes'] },
        { name: 'SLA', values: ['none', '99.9%', '99.99%'] },
      ],
    },
    { block: mockBlock({ id: 'comparison-text', type: 'ui:comparison' }) },
  ),
};

// ─── Compact ────────────────────────────────────────────────

export const Compact: Story = {
  args: mockProps<ComparisonData>(
    {
      title: 'Frontend Frameworks',
      options: [
        { name: 'React', description: 'Component-based library' },
        { name: 'Vue', description: 'Progressive framework' },
        { name: 'Svelte', description: 'Compiler-based framework' },
      ],
      features: [
        { name: 'Learning curve', values: ['moderate', 'easy', 'easy'] },
        { name: 'TypeScript support', values: ['full', 'full', 'full'] },
        { name: 'Bundle size', values: ['large', 'medium', 'small'] },
        { name: 'SSR built-in', values: ['no', 'yes', 'yes'] },
        { name: 'Ecosystem size', values: ['very large', 'large', 'growing'] },
      ],
    },
    {
      block: mockBlock({ id: 'comparison-compact', type: 'ui:comparison' }),
      container: mockContainer({ tier: 'compact', width: 400 }),
    },
  ),
  decorators: [
    (Story) =>
      React.createElement('div', { style: { maxWidth: '400px' } }, React.createElement(Story)),
  ],
};
