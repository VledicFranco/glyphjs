import type { ReactElement } from 'react';
import type { ChartData, DataRecord } from './render.js';

interface ChartAccessibleTableProps {
  type: ChartData['type'];
  series: ChartData['series'];
  xKey: string;
  yKey: string;
  xLabel?: string;
  yLabel?: string;
}

export function ChartAccessibleTable({
  type,
  series,
  xKey,
  yKey,
  xLabel,
  yLabel,
}: ChartAccessibleTableProps): ReactElement {
  return (
    <table
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      <caption>{type} chart data</caption>
      {series.map((s: ChartData['series'][number], si: number) => (
        <tbody key={si}>
          <tr>
            <th colSpan={2}>{s.name}</th>
          </tr>
          <tr>
            <th>{xLabel ?? xKey}</th>
            <th>{yLabel ?? yKey}</th>
          </tr>
          {s.data.map((d: DataRecord, di: number) => (
            <tr key={di}>
              <td>{String(d[xKey] ?? '')}</td>
              <td>
                {type === 'ohlc'
                  ? `O=${String(d['open'] ?? '')} H=${String(d['high'] ?? '')} L=${String(d['low'] ?? '')} C=${String(d['close'] ?? '')}`
                  : String(d[yKey] ?? '')}
              </td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}
