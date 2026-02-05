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

export function parameterStyle(isLast: boolean): CSSProperties {
  return {
    padding: 'var(--glyph-spacing-md, 1rem)',
    borderBottom: isLast ? 'none' : '1px solid var(--glyph-border, #d0d8e4)',
  };
}

export const parameterHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
};

export const parameterLabelStyle: CSSProperties = {
  fontWeight: 600,
  fontSize: '0.9375rem',
};

export const parameterValueStyle: CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 600,
  color: 'var(--glyph-accent, #0a9d7c)',
  fontVariantNumeric: 'tabular-nums',
};

export const rangeInputStyle: CSSProperties = {
  width: '100%',
  margin: 0,
  accentColor: 'var(--glyph-slider-fill, var(--glyph-accent, #0a9d7c))',
};

export const rangeLabelsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.75rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  marginTop: '0.25rem',
};
