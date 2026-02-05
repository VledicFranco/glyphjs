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

export const questionStyle: CSSProperties = {
  fontWeight: 600,
  fontSize: '0.9375rem',
  padding: 'var(--glyph-spacing-md, 1rem)',
  paddingBottom: '0.5rem',
};

export const optionsStyle: CSSProperties = {
  padding: '0 var(--glyph-spacing-md, 1rem)',
  paddingBottom: 'var(--glyph-spacing-md, 1rem)',
};

export function optionLabelStyle(selected: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.375rem',
    borderRadius: 'var(--glyph-radius-md, 0.5rem)',
    cursor: 'pointer',
    background: selected ? 'var(--glyph-surface, #e8ecf3)' : 'transparent',
    border: '1px solid',
    borderColor: selected ? 'var(--glyph-border, #d0d8e4)' : 'transparent',
    fontSize: '0.875rem',
    lineHeight: 1.6,
  };
}

export const voteButtonStyle: CSSProperties = {
  margin: '0 var(--glyph-spacing-md, 1rem) var(--glyph-spacing-md, 1rem)',
  padding: '0.5rem 1.25rem',
  borderRadius: 'var(--glyph-radius-md, 0.5rem)',
  border: '1px solid var(--glyph-border, #d0d8e4)',
  background: 'var(--glyph-surface, #e8ecf3)',
  color: 'var(--glyph-text, #1a2035)',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
};

export const resultsStyle: CSSProperties = {
  padding: 'var(--glyph-spacing-md, 1rem)',
  borderTop: '1px solid var(--glyph-border, #d0d8e4)',
};

export const resultRowStyle: CSSProperties = {
  marginBottom: '0.5rem',
};

export const resultLabelStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.8125rem',
  marginBottom: '0.25rem',
};

export const barTrackStyle: CSSProperties = {
  height: '0.5rem',
  borderRadius: '0.25rem',
  background: 'var(--glyph-poll-bar-bg, var(--glyph-surface, #e8ecf3))',
  overflow: 'hidden',
};

export function barFillStyle(percentage: number): CSSProperties {
  return {
    height: '100%',
    width: `${String(percentage)}%`,
    borderRadius: '0.25rem',
    background: 'var(--glyph-poll-bar-fill, var(--glyph-accent, #0a9d7c))',
    transition: 'width 0.3s ease',
  };
}
