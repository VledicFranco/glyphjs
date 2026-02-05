import type { CSSProperties } from 'react';

export const containerStyle: CSSProperties = {
  fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
  color: 'var(--glyph-text, #1a2035)',
  border: '1px solid var(--glyph-border, #d0d8e4)',
  borderRadius: 'var(--glyph-radius-md, 0.5rem)',
  overflow: 'auto',
};

export const headerStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: '1.125rem',
  padding: 'var(--glyph-spacing-md, 1rem)',
  borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
  color: 'var(--glyph-heading, #0a0e1a)',
};

export const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.875rem',
};

export const thStyle: CSSProperties = {
  padding: '0.625rem 0.75rem',
  textAlign: 'center',
  fontWeight: 600,
  borderBottom: '2px solid var(--glyph-border, #d0d8e4)',
  background: 'var(--glyph-table-header-bg, var(--glyph-surface, #e8ecf3))',
  whiteSpace: 'nowrap',
};

export const rowHeaderStyle: CSSProperties = {
  padding: '0.625rem 0.75rem',
  textAlign: 'left',
  fontWeight: 600,
  borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
  borderRight: '1px solid var(--glyph-border, #d0d8e4)',
  whiteSpace: 'nowrap',
};

export const cellStyle: CSSProperties = {
  padding: '0.375rem 0.5rem',
  textAlign: 'center',
  borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
};

export const inputStyle: CSSProperties = {
  width: '3.5rem',
  padding: '0.25rem 0.375rem',
  textAlign: 'center',
  border: '1px solid var(--glyph-border, #d0d8e4)',
  borderRadius: 'var(--glyph-radius-sm, 0.375rem)',
  background: 'transparent',
  color: 'var(--glyph-text, #1a2035)',
  fontSize: '0.875rem',
  fontVariantNumeric: 'tabular-nums',
};

export const weightStyle: CSSProperties = {
  fontSize: '0.6875rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  fontWeight: 400,
};

export const totalCellStyle: CSSProperties = {
  padding: '0.625rem 0.75rem',
  textAlign: 'center',
  fontWeight: 700,
  borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
  background: 'var(--glyph-surface, #e8ecf3)',
  fontVariantNumeric: 'tabular-nums',
};

export const totalHeaderStyle: CSSProperties = {
  ...thStyle,
  borderLeft: '2px solid var(--glyph-border, #d0d8e4)',
};
