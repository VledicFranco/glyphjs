import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'string' | 'number' | 'date' | 'boolean';
}

export interface TableAggregation {
  column: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface TableData {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  aggregation?: TableAggregation[];
}

// ─── Helpers ───────────────────────────────────────────────────

type SortDirection = 'ascending' | 'descending' | 'none';

interface SortState {
  column: string;
  direction: SortDirection;
}

function nextDirection(current: SortDirection): SortDirection {
  if (current === 'none') return 'ascending';
  if (current === 'ascending') return 'descending';
  return 'none';
}

function computeAggregation(
  rows: Record<string, unknown>[],
  column: string,
  fn: 'sum' | 'avg' | 'count' | 'min' | 'max',
): string {
  if (fn === 'count') {
    return String(rows.length);
  }

  const values = rows
    .map((r) => r[column])
    .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));

  if (values.length === 0) return '';

  switch (fn) {
    case 'sum':
      return String(values.reduce((a, b) => a + b, 0));
    case 'avg':
      return String(values.reduce((a, b) => a + b, 0) / values.length);
    case 'min':
      return String(Math.min(...values));
    case 'max':
      return String(Math.max(...values));
  }
}

function sortIndicator(direction: SortDirection): string {
  if (direction === 'ascending') return ' \u25B2';
  if (direction === 'descending') return ' \u25BC';
  return '';
}

// ─── Component ─────────────────────────────────────────────────

/**
 * Renders an interactive data table with optional sorting, filtering,
 * and aggregation.  Styling is driven by `--glyph-table-*` CSS custom
 * properties so consumers can re-theme via the Glyph theme system.
 */
export function Table({ data }: GlyphComponentProps<TableData>): ReactElement {
  const { columns, rows, aggregation } = data;

  const [sort, setSort] = useState<SortState>({ column: '', direction: 'none' });
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return columns.every((col) => {
        if (!col.filterable) return true;
        const filterValue = filters[col.key];
        if (!filterValue) return true;
        const cellValue = String(row[col.key] ?? '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      });
    });
  }, [rows, columns, filters]);

  const sortedRows = useMemo(() => {
    if (sort.direction === 'none' || !sort.column) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aVal = a[sort.column];
      const bVal = b[sort.column];

      // Handle nullish values -- push them to the end
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }

      return sort.direction === 'ascending' ? cmp : -cmp;
    });
  }, [filteredRows, sort]);

  const handleSort = (columnKey: string) => {
    setSort((prev) => {
      if (prev.column === columnKey) {
        return { column: columnKey, direction: nextDirection(prev.direction) };
      }
      return { column: columnKey, direction: 'ascending' };
    });
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent, columnKey: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(columnKey);
    }
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnKey]: value }));
  };

  const hasFilters = columns.some((c) => c.filterable);
  const aggMap = useMemo(() => {
    if (!aggregation) return null;
    const map = new Map<string, { fn: 'sum' | 'avg' | 'count' | 'min' | 'max' }>();
    for (const agg of aggregation) {
      map.set(agg.column, { fn: agg.function });
    }
    return map;
  }, [aggregation]);

  return (
    <table
      role="grid"
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid var(--glyph-table-border, #ddd)',
        fontFamily: 'var(--glyph-table-font, inherit)',
        fontSize: 'var(--glyph-table-font-size, 0.9rem)',
      }}
    >
      <thead>
        <tr>
          {columns.map((col) => {
            const isSorted = sort.column === col.key;
            const direction = isSorted ? sort.direction : 'none';
            return (
              <th
                key={col.key}
                scope="col"
                aria-sort={col.sortable ? direction : undefined}
                tabIndex={col.sortable ? 0 : undefined}
                role={col.sortable ? 'columnheader' : undefined}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                onKeyDown={col.sortable ? (e) => handleHeaderKeyDown(e, col.key) : undefined}
                style={{
                  padding: 'var(--glyph-table-cell-padding, 8px 12px)',
                  textAlign: 'left',
                  borderBottom: '2px solid var(--glyph-table-border, #ddd)',
                  background: 'var(--glyph-table-header-bg, #f5f5f5)',
                  color: 'var(--glyph-table-header-color, inherit)',
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: col.sortable ? 'none' : undefined,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.label}
                {col.sortable ? sortIndicator(direction) : ''}
              </th>
            );
          })}
        </tr>
        {hasFilters && (
          <tr>
            {columns.map((col) => (
              <th key={`filter-${col.key}`} style={{ padding: '4px 8px' }}>
                {col.filterable ? (
                  <input
                    type="text"
                    aria-label={`Filter ${col.label}`}
                    placeholder={`Filter ${col.label}...`}
                    value={filters[col.key] ?? ''}
                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      border: '1px solid var(--glyph-table-border, #ddd)',
                      borderRadius: '3px',
                      fontSize: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                ) : null}
              </th>
            ))}
          </tr>
        )}
      </thead>
      <tbody>
        {sortedRows.map((row, rowIdx) => (
          <tr
            key={rowIdx}
            style={{
              background:
                rowIdx % 2 === 0
                  ? 'var(--glyph-table-row-bg, transparent)'
                  : 'var(--glyph-table-row-alt-bg, #fafafa)',
            }}
          >
            {columns.map((col) => (
              <td
                key={col.key}
                style={{
                  padding: 'var(--glyph-table-cell-padding, 8px 12px)',
                  borderBottom: '1px solid var(--glyph-table-border, #ddd)',
                  color: 'var(--glyph-table-cell-color, inherit)',
                }}
              >
                {String(row[col.key] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {aggMap && aggMap.size > 0 && (
        <tfoot>
          <tr>
            {columns.map((col) => {
              const agg = aggMap.get(col.key);
              return (
                <td
                  key={col.key}
                  style={{
                    padding: 'var(--glyph-table-cell-padding, 8px 12px)',
                    borderTop: '2px solid var(--glyph-table-border, #ddd)',
                    fontWeight: 'bold',
                    background: 'var(--glyph-table-footer-bg, #f5f5f5)',
                    color: 'var(--glyph-table-footer-color, inherit)',
                  }}
                >
                  {agg ? computeAggregation(sortedRows, col.key, agg.fn) : ''}
                </td>
              );
            })}
          </tr>
        </tfoot>
      )}
    </table>
  );
}
