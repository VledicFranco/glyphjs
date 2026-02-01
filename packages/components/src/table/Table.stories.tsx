import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table.js';
import { mockProps, mockBlock } from '../__mocks__/data.js';
import type { TableData } from './Table.js';

const meta: Meta<typeof Table> = {
  component: Table,
  title: 'Components/Table',
};

export default meta;
type Story = StoryObj<typeof Table>;

// ─── Basic ─────────────────────────────────────────────────────

export const Basic: Story = {
  args: mockProps<TableData>(
    {
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'email', label: 'Email' },
      ],
      rows: [
        { name: 'Alice', role: 'Engineer', email: 'alice@example.com' },
        { name: 'Bob', role: 'Designer', email: 'bob@example.com' },
        { name: 'Carol', role: 'PM', email: 'carol@example.com' },
      ],
    },
    { block: mockBlock({ id: 'table-basic', type: 'ui:table' }) },
  ),
};

// ─── Sortable ──────────────────────────────────────────────────

export const Sortable: Story = {
  args: mockProps<TableData>(
    {
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'age', label: 'Age', sortable: true, type: 'number' },
        { key: 'city', label: 'City', sortable: true },
      ],
      rows: [
        { name: 'Alice', age: 30, city: 'New York' },
        { name: 'Bob', age: 25, city: 'San Francisco' },
        { name: 'Carol', age: 35, city: 'London' },
        { name: 'Dave', age: 28, city: 'Berlin' },
      ],
    },
    { block: mockBlock({ id: 'table-sortable', type: 'ui:table' }) },
  ),
};

// ─── Filterable ────────────────────────────────────────────────

export const Filterable: Story = {
  args: mockProps<TableData>(
    {
      columns: [
        { key: 'product', label: 'Product', filterable: true },
        { key: 'category', label: 'Category', filterable: true },
        { key: 'price', label: 'Price', type: 'number' },
      ],
      rows: [
        { product: 'Widget A', category: 'Electronics', price: 29.99 },
        { product: 'Widget B', category: 'Electronics', price: 49.99 },
        { product: 'Gadget C', category: 'Tools', price: 15.99 },
        { product: 'Gadget D', category: 'Tools', price: 22.50 },
        { product: 'Doohickey', category: 'Misc', price: 9.99 },
      ],
    },
    { block: mockBlock({ id: 'table-filterable', type: 'ui:table' }) },
  ),
};

// ─── With Aggregation ──────────────────────────────────────────

export const WithAggregation: Story = {
  args: mockProps<TableData>(
    {
      columns: [
        { key: 'quarter', label: 'Quarter' },
        { key: 'revenue', label: 'Revenue', sortable: true, type: 'number' },
        { key: 'expenses', label: 'Expenses', sortable: true, type: 'number' },
      ],
      rows: [
        { quarter: 'Q1', revenue: 120000, expenses: 80000 },
        { quarter: 'Q2', revenue: 150000, expenses: 95000 },
        { quarter: 'Q3', revenue: 130000, expenses: 85000 },
        { quarter: 'Q4', revenue: 180000, expenses: 110000 },
      ],
      aggregation: [
        { column: 'revenue', function: 'sum' },
        { column: 'expenses', function: 'avg' },
      ],
    },
    { block: mockBlock({ id: 'table-agg', type: 'ui:table' }) },
  ),
};
