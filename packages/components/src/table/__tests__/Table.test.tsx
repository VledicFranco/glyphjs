import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Table } from '../Table.js';
import type { TableData } from '../Table.js';
import { createMockProps } from '../../__tests__/helpers.js';

const tableData: TableData = {
  columns: [
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'age', label: 'Age', sortable: true, type: 'number' },
    { key: 'city', label: 'City' },
  ],
  rows: [
    { name: 'Alice', age: 30, city: 'NYC' },
    { name: 'Bob', age: 25, city: 'LA' },
    { name: 'Charlie', age: 35, city: 'Chicago' },
  ],
};

describe('Table', () => {
  it('renders column headers', () => {
    const props = createMockProps<TableData>(tableData, 'ui:table');
    render(<Table {...props} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
  });

  it('renders all data rows', () => {
    const props = createMockProps<TableData>(tableData, 'ui:table');
    render(<Table {...props} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('NYC')).toBeInTheDocument();
  });

  it('renders a grid role', () => {
    const props = createMockProps<TableData>(tableData, 'ui:table');
    render(<Table {...props} />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('sorts rows when clicking a sortable header', async () => {
    const user = userEvent.setup();
    const props = createMockProps<TableData>(tableData, 'ui:table');
    render(<Table {...props} />);

    // Click the "Name" header to sort ascending
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);

    // After sorting ascending by name: Alice, Bob, Charlie
    const grid = screen.getByRole('grid');
    const rows = within(grid).getAllByRole('row');
    const dataRows = rows.filter((row) => {
      const cells = within(row).queryAllByRole('cell');
      return cells.length > 0;
    });

    const firstRowCells = within(dataRows[0]).getAllByRole('cell');
    expect(firstRowCells[0]).toHaveTextContent('Alice');

    // Click again for descending
    await user.click(nameHeader);
    const updatedDataRows = within(screen.getByRole('grid'))
      .getAllByRole('row')
      .filter((row) => within(row).queryAllByRole('cell').length > 0);

    const firstCellDesc = within(updatedDataRows[0]).getAllByRole('cell');
    expect(firstCellDesc[0]).toHaveTextContent('Charlie');
  });

  it('filters rows using the filter input', async () => {
    const user = userEvent.setup();
    const props = createMockProps<TableData>(tableData, 'ui:table');
    render(<Table {...props} />);

    const filterInput = screen.getByLabelText('Filter Name');
    await user.type(filterInput, 'ali');

    // Only Alice should remain
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('sets aria-sort on sortable column headers', () => {
    const props = createMockProps<TableData>(tableData, 'ui:table');
    const { container } = render(<Table {...props} />);

    // All th elements get role="columnheader" by default in HTML.
    // Sortable columns have aria-sort set; non-sortable ones do not.
    const headersWithSort = container.querySelectorAll('th[aria-sort]');
    expect(headersWithSort).toHaveLength(2);
    for (const header of headersWithSort) {
      expect(header).toHaveAttribute('aria-sort', 'none');
    }
  });
});
