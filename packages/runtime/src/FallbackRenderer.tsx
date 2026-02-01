import type { ReactNode } from 'react';
import type { Block } from '@glyphjs/types';

// ─── Props ────────────────────────────────────────────────────

interface FallbackRendererProps {
  block: Block;
}

// ─── Component ────────────────────────────────────────────────

/**
 * Fallback renderer for unknown or unregistered block types.
 * Renders the block type name and a stringified preview of the raw data.
 * Styled subtly so it is visible during development but not intrusive.
 */
export function FallbackRenderer({ block }: FallbackRendererProps): ReactNode {
  let dataPreview: string;
  try {
    dataPreview = JSON.stringify(block.data, null, 2);
  } catch {
    dataPreview = '[Unable to serialize block data]';
  }

  return (
    <div
      style={{
        border: '1px dashed #a0aec0',
        borderRadius: '4px',
        padding: '8px 12px',
        margin: '4px 0',
        backgroundColor: '#f7fafc',
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#718096',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
        Unknown block type: {block.type}
      </div>
      <pre
        style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '200px',
          overflow: 'auto',
        }}
      >
        {dataPreview}
      </pre>
    </div>
  );
}
