import type { Meta, StoryObj } from '@storybook/react';
import { Relation } from './Relation.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { RelationData } from './Relation.js';

const meta: Meta<typeof Relation> = {
  component: Relation,
  title: 'Components/Relation',
};

export default meta;
type Story = StoryObj<typeof Relation>;

// ─── Simple ER ─────────────────────────────────────────────────

export const SimpleER: Story = {
  args: mockProps<RelationData>(
    {
      entities: [
        {
          id: 'users',
          label: 'Users',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'email', type: 'VARCHAR(255)' },
          ],
        },
        {
          id: 'orders',
          label: 'Orders',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'user_id', type: 'INT' },
            { name: 'total', type: 'DECIMAL(10,2)' },
          ],
        },
      ],
      relationships: [{ from: 'users', to: 'orders', label: 'places', cardinality: '1:N' }],
    },
    { block: mockBlock({ id: 'relation-simple', type: 'ui:relation' }) },
  ),
};

// ─── Complex ER ────────────────────────────────────────────────

export const ComplexER: Story = {
  args: mockProps<RelationData>(
    {
      entities: [
        {
          id: 'users',
          label: 'Users',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'email', type: 'VARCHAR(255)' },
          ],
        },
        {
          id: 'orders',
          label: 'Orders',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'user_id', type: 'INT' },
            { name: 'status', type: 'ENUM' },
            { name: 'created_at', type: 'TIMESTAMP' },
          ],
        },
        {
          id: 'products',
          label: 'Products',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'name', type: 'VARCHAR(200)' },
            { name: 'price', type: 'DECIMAL(10,2)' },
            { name: 'sku', type: 'VARCHAR(50)' },
          ],
        },
        {
          id: 'order_items',
          label: 'Order Items',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'order_id', type: 'INT' },
            { name: 'product_id', type: 'INT' },
            { name: 'quantity', type: 'INT' },
          ],
        },
      ],
      relationships: [
        { from: 'users', to: 'orders', label: 'places', cardinality: '1:N' },
        { from: 'orders', to: 'order_items', label: 'contains', cardinality: '1:N' },
        { from: 'products', to: 'order_items', label: 'included in', cardinality: '1:N' },
      ],
      layout: 'left-right',
    },
    { block: mockBlock({ id: 'relation-complex', type: 'ui:relation' }) },
  ),
};

// ─── Interaction Modes ──────────────────────────────────────────

export const ModifierKeyMode: Story = {
  name: 'Modifier Key Mode (Default)',
  args: mockProps<RelationData>(
    {
      interactionMode: 'modifier-key',
      entities: [
        {
          id: 'users',
          label: 'Users',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'email', type: 'VARCHAR(255)' },
          ],
        },
        {
          id: 'orders',
          label: 'Orders',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'user_id', type: 'INT' },
            { name: 'total', type: 'DECIMAL(10,2)' },
          ],
        },
      ],
      relationships: [{ from: 'users', to: 'orders', label: 'places', cardinality: '1:N' }],
    },
    { block: mockBlock({ id: 'relation-modifier-key', type: 'ui:relation' }) },
  ),
};

export const ClickToActivateMode: Story = {
  name: 'Click to Activate Mode',
  args: mockProps<RelationData>(
    {
      interactionMode: 'click-to-activate',
      entities: [
        {
          id: 'users',
          label: 'Users',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'email', type: 'VARCHAR(255)' },
          ],
        },
        {
          id: 'orders',
          label: 'Orders',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'user_id', type: 'INT' },
            { name: 'total', type: 'DECIMAL(10,2)' },
          ],
        },
      ],
      relationships: [{ from: 'users', to: 'orders', label: 'places', cardinality: '1:N' }],
    },
    { block: mockBlock({ id: 'relation-click-activate', type: 'ui:relation' }) },
  ),
};

export const AlwaysMode: Story = {
  name: 'Always Mode (Legacy)',
  args: mockProps<RelationData>(
    {
      interactionMode: 'always',
      entities: [
        {
          id: 'users',
          label: 'Users',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'email', type: 'VARCHAR(255)' },
          ],
        },
        {
          id: 'orders',
          label: 'Orders',
          attributes: [
            { name: 'id', type: 'INT', primaryKey: true },
            { name: 'user_id', type: 'INT' },
            { name: 'total', type: 'DECIMAL(10,2)' },
          ],
        },
      ],
      relationships: [{ from: 'users', to: 'orders', label: 'places', cardinality: '1:N' }],
    },
    { block: mockBlock({ id: 'relation-always', type: 'ui:relation' }) },
  ),
};
