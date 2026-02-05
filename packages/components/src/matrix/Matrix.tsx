import { useState, useCallback, type ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import {
  containerStyle,
  headerStyle,
  tableStyle,
  thStyle,
  rowHeaderStyle,
  cellStyle,
  inputStyle,
  weightStyle,
  totalCellStyle,
  totalHeaderStyle,
} from './styles.js';

// ─── Types ─────────────────────────────────────────────────────

export interface MatrixColumn {
  id: string;
  label: string;
  weight?: number;
}

export interface MatrixRow {
  id: string;
  label: string;
}

export interface MatrixData {
  title?: string;
  scale?: number;
  showTotals?: boolean;
  columns: MatrixColumn[];
  rows: MatrixRow[];
}

// ─── Helpers ───────────────────────────────────────────────────

function computeWeightedTotals(
  rows: MatrixRow[],
  columns: MatrixColumn[],
  values: Record<string, Record<string, number>>,
): { rowId: string; rowLabel: string; total: number }[] {
  return rows.map((row) => {
    let total = 0;
    for (const col of columns) {
      const score = values[row.id]?.[col.id] ?? 0;
      const weight = col.weight ?? 1;
      total += score * weight;
    }
    return { rowId: row.id, rowLabel: row.label, total: Math.round(total * 100) / 100 };
  });
}

// ─── Component ─────────────────────────────────────────────────

export function Matrix({
  data,
  block,
  onInteraction,
}: GlyphComponentProps<MatrixData>): ReactElement {
  const { title, scale = 5, showTotals = true, columns, rows } = data;
  const baseId = `glyph-matrix-${block.id}`;

  const [values, setValues] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    for (const row of rows) {
      const rowMap: Record<string, number> = {};
      for (const col of columns) {
        rowMap[col.id] = 0;
      }
      init[row.id] = rowMap;
    }
    return init;
  });

  const handleChange = useCallback(
    (rowId: string, columnId: string, value: number): void => {
      const clamped = Math.max(0, Math.min(scale, value));
      setValues((prevValues) => {
        const newValues = Object.fromEntries(
          Object.entries(prevValues).map(([k, v]) => [k, { ...v }]),
        );
        if (!newValues[rowId]) newValues[rowId] = {};
        newValues[rowId] = { ...newValues[rowId], [columnId]: clamped };

        const row = rows.find((r) => r.id === rowId);
        const col = columns.find((c) => c.id === columnId);

        if (onInteraction && row && col) {
          const payloadValues = Object.fromEntries(
            Object.entries(newValues).map(([k, v]) => [k, { ...v }]),
          );
          onInteraction({
            kind: 'matrix-change',
            timestamp: new Date().toISOString(),
            blockId: block.id,
            blockType: block.type,
            payload: {
              rowId,
              rowLabel: row.label,
              columnId,
              columnLabel: col.label,
              value: clamped,
              allValues: payloadValues,
              weightedTotals: computeWeightedTotals(rows, columns, newValues),
            },
          });
        }

        return newValues;
      });
    },
    [scale, rows, columns, block.id, block.type, onInteraction],
  );

  const totals = computeWeightedTotals(rows, columns, values);

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Decision Matrix'} style={containerStyle}>
      {title && <div style={headerStyle}>{title}</div>}

      <table role="grid" style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle} />
            {columns.map((col) => (
              <th key={col.id} style={thStyle}>
                {col.label}
                {(col.weight ?? 1) !== 1 && <div style={weightStyle}>×{String(col.weight)}</div>}
              </th>
            ))}
            {showTotals && <th style={totalHeaderStyle}>Total</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowTotal = totals.find((t) => t.rowId === row.id)?.total ?? 0;
            return (
              <tr key={row.id}>
                <th scope="row" style={rowHeaderStyle}>
                  {row.label}
                </th>
                {columns.map((col) => {
                  const cellValue = values[row.id]?.[col.id] ?? 0;
                  return (
                    <td key={col.id} style={cellStyle}>
                      <input
                        type="number"
                        min={0}
                        max={scale}
                        value={cellValue}
                        onChange={(e) => handleChange(row.id, col.id, Number(e.target.value))}
                        aria-label={`Score for ${row.label} on ${col.label}`}
                        style={inputStyle}
                      />
                    </td>
                  );
                })}
                {showTotals && <td style={totalCellStyle}>{String(rowTotal)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
