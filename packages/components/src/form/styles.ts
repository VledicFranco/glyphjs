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
  paddingBottom: '0.25rem',
  color: 'var(--glyph-heading, #0a0e1a)',
};

export const descriptionStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  padding: '0 var(--glyph-spacing-md, 1rem)',
  paddingBottom: 'var(--glyph-spacing-sm, 0.5rem)',
};

export const formStyle: CSSProperties = {
  padding: 'var(--glyph-spacing-md, 1rem)',
};

export const fieldStyle: CSSProperties = {
  marginBottom: 'var(--glyph-spacing-md, 1rem)',
};

export const labelStyle: CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: '0.875rem',
  marginBottom: '0.375rem',
};

export const requiredStyle: CSSProperties = {
  color: '#dc2626',
  marginLeft: '0.25rem',
};

export const textInputStyle: CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--glyph-border, #d0d8e4)',
  borderRadius: 'var(--glyph-radius-sm, 0.375rem)',
  background: 'transparent',
  color: 'var(--glyph-text, #1a2035)',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export const selectInputStyle: CSSProperties = {
  ...textInputStyle,
  appearance: 'auto',
};

export const checkboxLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.875rem',
  cursor: 'pointer',
};

export const rangeValueStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--glyph-accent, #0a9d7c)',
  marginLeft: '0.5rem',
  fontVariantNumeric: 'tabular-nums',
};

export const submitButtonStyle: CSSProperties = {
  padding: '0.625rem 1.5rem',
  borderRadius: 'var(--glyph-radius-md, 0.5rem)',
  border: '1px solid var(--glyph-accent, #0a9d7c)',
  background: 'var(--glyph-accent, #0a9d7c)',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
  marginTop: 'var(--glyph-spacing-sm, 0.5rem)',
};

export function invalidStyle(isInvalid: boolean): CSSProperties {
  if (!isInvalid) return {};
  return {
    borderColor: '#dc2626',
  };
}
