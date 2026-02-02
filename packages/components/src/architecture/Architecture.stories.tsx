import type { Meta, StoryObj } from '@storybook/react';
import { Architecture } from './Architecture.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { ArchitectureData } from './Architecture.js';

const meta: Meta<typeof Architecture> = {
  component: Architecture,
  title: 'Components/Architecture',
};

export default meta;
type Story = StoryObj<typeof Architecture>;

// ─── Simple Flow ────────────────────────────────────────────

export const SimpleFlow: Story = {
  args: mockProps<ArchitectureData>(
    {
      children: [
        { id: 'web', label: 'Web App', icon: 'cloud' },
        { id: 'api', label: 'API Server', icon: 'server' },
        { id: 'db', label: 'Database', icon: 'database' },
      ],
      edges: [
        { from: 'web', to: 'api', label: 'REST' },
        { from: 'api', to: 'db', label: 'queries' },
      ],
    },
    { block: mockBlock({ id: 'arch-simple', type: 'ui:architecture' }) },
  ),
};

// ─── Cloud Infrastructure ───────────────────────────────────

export const CloudInfra: Story = {
  args: mockProps<ArchitectureData>(
    {
      title: 'Production VPC',
      children: [
        {
          id: 'vpc',
          label: 'VPC',
          type: 'zone',
          children: [
            {
              id: 'pub',
              label: 'Public Subnet',
              type: 'zone',
              children: [
                { id: 'alb', label: 'Load Balancer', icon: 'loadbalancer' },
                { id: 'bastion', label: 'Bastion', icon: 'server' },
              ],
            },
            {
              id: 'priv',
              label: 'Private Subnet',
              type: 'zone',
              children: [
                { id: 'api', label: 'API', icon: 'server' },
                { id: 'worker', label: 'Worker', icon: 'function' },
              ],
            },
            {
              id: 'data',
              label: 'Data Subnet',
              type: 'zone',
              children: [
                { id: 'db', label: 'PostgreSQL', icon: 'database' },
                { id: 'cache', label: 'Redis', icon: 'cache' },
              ],
            },
          ],
        },
        { id: 'users', label: 'Users', icon: 'user' },
      ],
      edges: [
        { from: 'users', to: 'alb', label: 'HTTPS' },
        { from: 'alb', to: 'api' },
        { from: 'api', to: 'db', label: 'queries' },
        { from: 'api', to: 'cache', label: 'reads' },
        { from: 'worker', to: 'db' },
      ],
      layout: 'top-down',
    },
    { block: mockBlock({ id: 'arch-cloud', type: 'ui:architecture' }) },
  ),
};

// ─── Microservices ──────────────────────────────────────────

export const Microservices: Story = {
  args: mockProps<ArchitectureData>(
    {
      title: 'Microservices',
      children: [
        {
          id: 'frontend',
          label: 'Frontend',
          type: 'zone',
          children: [
            { id: 'web', label: 'Web App', icon: 'cloud' },
            { id: 'mobile', label: 'Mobile App', icon: 'container' },
          ],
        },
        {
          id: 'backend',
          label: 'Backend Services',
          type: 'zone',
          children: [
            { id: 'gateway', label: 'API Gateway', icon: 'gateway' },
            { id: 'auth', label: 'Auth Service', icon: 'server' },
            { id: 'orders', label: 'Order Service', icon: 'server' },
            { id: 'notify', label: 'Notification', icon: 'function' },
          ],
        },
        {
          id: 'data',
          label: 'Data Layer',
          type: 'zone',
          children: [
            { id: 'db', label: 'PostgreSQL', icon: 'database' },
            { id: 'queue', label: 'Message Queue', icon: 'queue' },
          ],
        },
      ],
      edges: [
        { from: 'web', to: 'gateway' },
        { from: 'mobile', to: 'gateway' },
        { from: 'gateway', to: 'auth' },
        { from: 'gateway', to: 'orders' },
        { from: 'orders', to: 'db' },
        { from: 'orders', to: 'queue', type: 'async' },
        { from: 'queue', to: 'notify', type: 'async' },
      ],
    },
    { block: mockBlock({ id: 'arch-micro', type: 'ui:architecture' }) },
  ),
};

// ─── Data Pipeline (left-right) ─────────────────────────────

export const DataPipeline: Story = {
  args: mockProps<ArchitectureData>(
    {
      title: 'Data Pipeline',
      children: [
        { id: 'ingest', label: 'Ingest', icon: 'gateway' },
        { id: 'transform', label: 'Transform', icon: 'function' },
        { id: 'store', label: 'Data Lake', icon: 'storage' },
        { id: 'serve', label: 'Query Engine', icon: 'server' },
      ],
      edges: [
        { from: 'ingest', to: 'transform', type: 'data' },
        { from: 'transform', to: 'store', type: 'data' },
        { from: 'store', to: 'serve', type: 'data' },
      ],
      layout: 'left-right',
    },
    { block: mockBlock({ id: 'arch-pipeline', type: 'ui:architecture' }) },
  ),
};

// ─── Nested Zones (3 levels deep) ───────────────────────────

export const NestedZones: Story = {
  args: mockProps<ArchitectureData>(
    {
      title: 'Nested Architecture',
      children: [
        {
          id: 'l1',
          label: 'Level 1',
          type: 'zone',
          children: [
            {
              id: 'l2',
              label: 'Level 2',
              type: 'zone',
              children: [
                {
                  id: 'l3',
                  label: 'Level 3',
                  type: 'zone',
                  children: [{ id: 'core', label: 'Core', icon: 'server' }],
                },
              ],
            },
          ],
        },
        { id: 'external', label: 'External', icon: 'cloud' },
      ],
      edges: [{ from: 'external', to: 'core' }],
    },
    { block: mockBlock({ id: 'arch-nested', type: 'ui:architecture' }) },
  ),
};
