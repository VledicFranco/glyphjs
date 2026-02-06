import { useState, useCallback, type ReactElement } from 'react';
import type { GlyphComponentProps, InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';
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
  label: string | InlineNode[];
  weight?: number;
}

export interface MatrixRow {
  id: string;
  label: string | InlineNode[];
}

export interface MatrixData {
  title?: string;
  scale?: number;
  showTotals?: boolean;
  columns: MatrixColumn[];
  rows: MatrixRow[];
  markdown?: boolean;
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
    const rowLabel = typeof row.label === 'string' ? row.label : 'Row';
    return { rowId: row.id, rowLabel, total: Math.round(total * 100) / 100 };
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
              rowLabel: typeof row.label === 'string' ? row.label : 'Row',
              columnId,
              columnLabel: typeof col.label === 'string' ? col.label : 'Column',
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
                <RichText content={col.label} />
                {(col.weight ?? 1) !== 1 && <div style={weightStyle}>×{String(col.weight)}</div>}
              </th>
            ))}
            {showTotals && <th style={totalHeaderStyle}>Total</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowTotal = totals.find((t) => t.rowId === row.id)?.total ?? 0;
            const rowLabelText = typeof row.label === 'string' ? row.label : 'Row';
            return (
              <tr key={row.id}>
                <th scope="row" style={rowHeaderStyle}>
                  <RichText content={row.label} />
                </th>
                {columns.map((col) => {
                  const cellValue = values[row.id]?.[col.id] ?? 0;
                  const colLabelText = typeof col.label === 'string' ? col.label : 'Column';
                  return (
                    <td key={col.id} style={cellStyle}>
                      <input
                        type="number"
                        min={0}
                        max={scale}
                        value={cellValue}
                        onChange={(e) => handleChange(row.id, col.id, Number(e.target.value))}
                        aria-label={`Score for ${rowLabelText} on ${colLabelText}`}
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
