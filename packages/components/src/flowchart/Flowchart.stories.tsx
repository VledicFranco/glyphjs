import type { Meta, StoryObj } from '@storybook/react';
import { Flowchart } from './Flowchart.js';
import type { FlowchartData } from './Flowchart.js';
import React from 'react';
import { mockProps, mockContainer } from '../__storybook__/data.js';

const meta: Meta<typeof Flowchart> = {
  title: 'Components/Flowchart',
  component: Flowchart,
};
export default meta;

type Story = StoryObj<typeof Flowchart>;

export const Default: Story = {
  args: mockProps<FlowchartData>({
    title: 'Order Processing',
    direction: 'top-down',
    nodes: [
      { id: 'start', type: 'start', label: 'Order Received' },
      { id: 'validate', type: 'process', label: 'Validate Payment' },
      { id: 'check', type: 'decision', label: 'Payment Valid?' },
      { id: 'fulfill', type: 'process', label: 'Fulfill Order' },
      { id: 'reject', type: 'end', label: 'Reject Order' },
      { id: 'done', type: 'end', label: 'Complete' },
    ],
    edges: [
      { from: 'start', to: 'validate' },
      { from: 'validate', to: 'check' },
      { from: 'check', to: 'fulfill', label: 'Yes' },
      { from: 'check', to: 'reject', label: 'No' },
      { from: 'fulfill', to: 'done' },
    ],
  }),
};

export const LeftRight: Story = {
  args: mockProps<FlowchartData>({
    title: 'CI/CD Pipeline',
    direction: 'left-right',
    nodes: [
      { id: 'commit', type: 'start', label: 'Commit' },
      { id: 'build', type: 'process', label: 'Build' },
      { id: 'test', type: 'process', label: 'Test' },
      { id: 'deploy', type: 'end', label: 'Deploy' },
    ],
    edges: [
      { from: 'commit', to: 'build' },
      { from: 'build', to: 'test' },
      { from: 'test', to: 'deploy' },
    ],
  }),
};

export const DecisionHeavy: Story = {
  args: mockProps<FlowchartData>({
    title: 'Error Handling',
    direction: 'top-down',
    nodes: [
      { id: 'start', type: 'start', label: 'Request' },
      { id: 'auth', type: 'decision', label: 'Authenticated?' },
      { id: 'valid', type: 'decision', label: 'Input Valid?' },
      { id: 'rate', type: 'decision', label: 'Rate Limited?' },
      { id: 'process', type: 'process', label: 'Process' },
      { id: 'err401', type: 'end', label: '401 Error' },
      { id: 'err400', type: 'end', label: '400 Error' },
      { id: 'err429', type: 'end', label: '429 Error' },
      { id: 'ok', type: 'end', label: '200 OK' },
    ],
    edges: [
      { from: 'start', to: 'auth' },
      { from: 'auth', to: 'err401', label: 'No' },
      { from: 'auth', to: 'valid', label: 'Yes' },
      { from: 'valid', to: 'err400', label: 'No' },
      { from: 'valid', to: 'rate', label: 'Yes' },
      { from: 'rate', to: 'err429', label: 'Yes' },
      { from: 'rate', to: 'process', label: 'No' },
      { from: 'process', to: 'ok' },
    ],
  }),
};

export const LinearProcess: Story = {
  args: mockProps<FlowchartData>({
    title: 'User Registration',
    direction: 'top-down',
    nodes: [
      { id: 'start', type: 'start', label: 'Sign Up' },
      { id: 'email', type: 'process', label: 'Enter Email' },
      { id: 'verify', type: 'process', label: 'Verify Email' },
      { id: 'profile', type: 'process', label: 'Create Profile' },
      { id: 'done', type: 'end', label: 'Welcome!' },
    ],
    edges: [
      { from: 'start', to: 'email' },
      { from: 'email', to: 'verify' },
      { from: 'verify', to: 'profile' },
      { from: 'profile', to: 'done' },
    ],
  }),
};

export const ComplexBranching: Story = {
  args: mockProps<FlowchartData>({
    title: 'Support Ticket Routing',
    direction: 'top-down',
    nodes: [
      { id: 'start', type: 'start', label: 'New Ticket' },
      { id: 'classify', type: 'process', label: 'Auto-Classify' },
      { id: 'priority', type: 'decision', label: 'Priority?' },
      { id: 'urgent', type: 'process', label: 'Escalate' },
      { id: 'normal', type: 'decision', label: 'Category?' },
      { id: 'billing', type: 'process', label: 'Billing Team' },
      { id: 'tech', type: 'process', label: 'Tech Support' },
      { id: 'general', type: 'process', label: 'General Queue' },
      { id: 'resolve', type: 'process', label: 'Resolve' },
      { id: 'done', type: 'end', label: 'Closed' },
    ],
    edges: [
      { from: 'start', to: 'classify' },
      { from: 'classify', to: 'priority' },
      { from: 'priority', to: 'urgent', label: 'High' },
      { from: 'priority', to: 'normal', label: 'Normal' },
      { from: 'normal', to: 'billing', label: 'Billing' },
      { from: 'normal', to: 'tech', label: 'Technical' },
      { from: 'normal', to: 'general', label: 'Other' },
      { from: 'urgent', to: 'resolve' },
      { from: 'billing', to: 'resolve' },
      { from: 'tech', to: 'resolve' },
      { from: 'general', to: 'resolve' },
      { from: 'resolve', to: 'done' },
    ],
  }),
};

// ─── Compact ────────────────────────────────────────────────

export const Compact: Story = {
  args: mockProps<FlowchartData>(
    {
      title: 'Order Processing',
      direction: 'top-down',
      nodes: [
        { id: 'start', type: 'start', label: 'Order Received' },
        { id: 'validate', type: 'process', label: 'Validate Payment' },
        { id: 'check', type: 'decision', label: 'Payment Valid?' },
        { id: 'fulfill', type: 'process', label: 'Fulfill Order' },
        { id: 'reject', type: 'end', label: 'Reject Order' },
        { id: 'done', type: 'end', label: 'Complete' },
      ],
      edges: [
        { from: 'start', to: 'validate' },
        { from: 'validate', to: 'check' },
        { from: 'check', to: 'fulfill', label: 'Yes' },
        { from: 'check', to: 'reject', label: 'No' },
        { from: 'fulfill', to: 'done' },
      ],
    },
    {
      container: mockContainer({ tier: 'compact', width: 400 }),
    },
  ),
  decorators: [
    (Story) =>
      React.createElement('div', { style: { maxWidth: '400px' } }, React.createElement(Story)),
  ],
};
