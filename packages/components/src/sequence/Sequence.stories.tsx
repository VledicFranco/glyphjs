import type { Meta, StoryObj } from '@storybook/react';
import { Sequence } from './Sequence.js';
import type { SequenceData } from './Sequence.js';
import { mockProps } from '../__storybook__/data.js';

const meta: Meta<typeof Sequence> = {
  title: 'Components/Sequence',
  component: Sequence,
};
export default meta;

type Story = StoryObj<typeof Sequence>;

export const Default: Story = {
  args: mockProps<SequenceData>({
    title: 'Authentication Flow',
    actors: [
      { id: 'client', label: 'Browser' },
      { id: 'api', label: 'Auth API' },
      { id: 'db', label: 'Database' },
    ],
    messages: [
      { from: 'client', to: 'api', label: 'POST /login', type: 'message' },
      { from: 'api', to: 'db', label: 'Query user', type: 'message' },
      { from: 'db', to: 'api', label: 'User record', type: 'reply' },
      { from: 'api', to: 'api', label: 'Verify password', type: 'self' },
      { from: 'api', to: 'client', label: 'JWT token', type: 'reply' },
    ],
  }),
};

export const TwoActors: Story = {
  args: mockProps<SequenceData>({
    title: 'Simple Request',
    actors: [
      { id: 'client', label: 'Client' },
      { id: 'server', label: 'Server' },
    ],
    messages: [
      { from: 'client', to: 'server', label: 'GET /data', type: 'message' },
      { from: 'server', to: 'client', label: '200 OK', type: 'reply' },
    ],
  }),
};

export const SelfMessage: Story = {
  args: mockProps<SequenceData>({
    title: 'Internal Processing',
    actors: [
      { id: 'user', label: 'User' },
      { id: 'system', label: 'System' },
    ],
    messages: [
      { from: 'user', to: 'system', label: 'Submit form', type: 'message' },
      { from: 'system', to: 'system', label: 'Validate input', type: 'self' },
      { from: 'system', to: 'system', label: 'Process data', type: 'self' },
      { from: 'system', to: 'user', label: 'Confirmation', type: 'reply' },
    ],
  }),
};

export const ManyMessages: Story = {
  args: mockProps<SequenceData>({
    title: 'Order Processing',
    actors: [
      { id: 'customer', label: 'Customer' },
      { id: 'cart', label: 'Cart Service' },
      { id: 'payment', label: 'Payment' },
      { id: 'inventory', label: 'Inventory' },
    ],
    messages: [
      { from: 'customer', to: 'cart', label: 'Add item', type: 'message' },
      { from: 'cart', to: 'inventory', label: 'Check stock', type: 'message' },
      { from: 'inventory', to: 'cart', label: 'In stock', type: 'reply' },
      { from: 'customer', to: 'cart', label: 'Checkout', type: 'message' },
      { from: 'cart', to: 'payment', label: 'Charge card', type: 'message' },
      { from: 'payment', to: 'cart', label: 'Payment OK', type: 'reply' },
      { from: 'cart', to: 'inventory', label: 'Reserve items', type: 'message' },
      { from: 'cart', to: 'customer', label: 'Order confirmed', type: 'reply' },
    ],
  }),
};

export const MixedTypes: Story = {
  args: mockProps<SequenceData>({
    title: 'WebSocket Handshake',
    actors: [
      { id: 'browser', label: 'Browser' },
      { id: 'server', label: 'Server' },
    ],
    messages: [
      { from: 'browser', to: 'server', label: 'HTTP Upgrade', type: 'message' },
      { from: 'server', to: 'server', label: 'Validate origin', type: 'self' },
      { from: 'server', to: 'browser', label: '101 Switching', type: 'reply' },
      { from: 'browser', to: 'server', label: 'WS: Hello', type: 'message' },
      { from: 'server', to: 'browser', label: 'WS: Welcome', type: 'message' },
    ],
  }),
};
