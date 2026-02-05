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

export const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

export function itemStyle(isDragging: boolean, isGrabbed: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem var(--glyph-spacing-md, 1rem)',
    borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
    background: isDragging ? 'var(--glyph-accent-subtle, #e6f6f2)' : 'transparent',
    cursor: isGrabbed ? 'grabbing' : 'grab',
    userSelect: 'none',
    transition: 'background 0.15s ease',
    outline: isGrabbed ? '2px solid var(--glyph-accent, #0a9d7c)' : 'none',
    outlineOffset: '-2px',
  };
}

export const rankBadgeStyle: CSSProperties = {
  minWidth: '1.75rem',
  height: '1.75rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  background: 'var(--glyph-surface, #e8ecf3)',
  fontWeight: 700,
  fontSize: '0.8125rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  flexShrink: 0,
};

export const itemContentStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

export const itemLabelStyle: CSSProperties = {
  fontWeight: 600,
  fontSize: '0.9375rem',
};

export const itemDescriptionStyle: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  marginTop: '0.125rem',
};

export const gripStyle: CSSProperties = {
  color: 'var(--glyph-text-muted, #6b7a94)',
  fontSize: '1rem',
  flexShrink: 0,
};
