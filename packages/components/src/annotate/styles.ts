import type { CSSProperties } from 'react';

export const containerStyle: CSSProperties = {
  fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
  color: 'var(--glyph-text, #1a2035)',
  border: '1px solid var(--glyph-border, #d0d8e4)',
  borderRadius: 'var(--glyph-radius-md, 0.5rem)',
  overflow: 'hidden',
};

export const headerStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: '1.125rem',
  padding: 'var(--glyph-spacing-md, 1rem)',
  borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
  color: 'var(--glyph-heading, #0a0e1a)',
};

export const bodyStyle: CSSProperties = {
  display: 'flex',
  minHeight: '200px',
};

export const textPaneStyle: CSSProperties = {
  flex: 1,
  padding: 'var(--glyph-spacing-md, 1rem)',
  fontFamily: 'var(--glyph-font-mono, ui-monospace, monospace)',
  fontSize: '0.8125rem',
  lineHeight: 1.8,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  position: 'relative',
  cursor: 'text',
};

export function highlightStyle(color: string): CSSProperties {
  return {
    backgroundColor: color,
    opacity: 0.3,
    borderRadius: '2px',
    cursor: 'pointer',
    position: 'relative',
  };
}

export const labelPickerStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 10,
  background: 'var(--glyph-surface-raised, #f4f6fa)',
  border: '1px solid var(--glyph-border, #d0d8e4)',
  borderRadius: 'var(--glyph-radius-sm, 0.375rem)',
  boxShadow: 'var(--glyph-shadow-md, 0 4px 12px rgba(0,0,0,0.15))',
  padding: '0.25rem 0',
  minWidth: '120px',
};

export function labelOptionStyle(): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0.75rem',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    color: 'var(--glyph-text, #1a2035)',
  };
}

export function colorDotStyle(color: string): CSSProperties {
  return {
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  };
}

export const sidebarStyle: CSSProperties = {
  width: '220px',
  borderLeft: '1px solid var(--glyph-border, #d0d8e4)',
  background: 'var(--glyph-annotate-sidebar-bg, var(--glyph-surface, #e8ecf3))',
  overflow: 'auto',
};

export const sidebarHeaderStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  padding: '0.75rem',
  borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
  color: 'var(--glyph-text-muted, #6b7a94)',
};

export function annotationItemStyle(color: string): CSSProperties {
  return {
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
    borderLeft: `3px solid ${color}`,
    fontSize: '0.75rem',
  };
}

export const annotationTextStyle: CSSProperties = {
  fontFamily: 'var(--glyph-font-mono, ui-monospace, monospace)',
  fontSize: '0.6875rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  marginTop: '0.25rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const annotationNoteStyle: CSSProperties = {
  fontSize: '0.6875rem',
  fontStyle: 'italic',
  color: 'var(--glyph-text-muted, #6b7a94)',
  marginTop: '0.125rem',
};
