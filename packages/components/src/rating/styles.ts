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

export function itemStyle(isLast: boolean): CSSProperties {
  return {
    padding: 'var(--glyph-spacing-md, 1rem)',
    borderBottom: isLast ? 'none' : '1px solid var(--glyph-border, #d0d8e4)',
  };
}

export const itemLabelStyle: CSSProperties = {
  fontWeight: 600,
  fontSize: '0.9375rem',
  marginBottom: '0.25rem',
};

export const itemDescriptionStyle: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  marginBottom: '0.5rem',
};

export const starsContainerStyle: CSSProperties = {
  display: 'flex',
  gap: '0.25rem',
  alignItems: 'center',
};

export function starButtonStyle(filled: boolean, hovered: boolean): CSSProperties {
  return {
    background: 'none',
    border: 'none',
    padding: '0.125rem',
    cursor: 'pointer',
    fontSize: '1.25rem',
    lineHeight: 1,
    color:
      filled || hovered
        ? 'var(--glyph-rating-star-fill, #f59e0b)'
        : 'var(--glyph-rating-star-empty, var(--glyph-border, #d0d8e4))',
    transition: 'color 0.15s ease',
  };
}

export function numberButtonStyle(selected: boolean): CSSProperties {
  return {
    minWidth: '2rem',
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--glyph-radius-sm, 0.375rem)',
    border: '1px solid var(--glyph-border, #d0d8e4)',
    background: selected ? 'var(--glyph-accent, #0a9d7c)' : 'transparent',
    color: selected ? '#fff' : 'var(--glyph-text, #1a2035)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
    transition: 'background 0.15s ease, color 0.15s ease',
  };
}

export const scaleLabelsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.75rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  marginTop: '0.375rem',
};
