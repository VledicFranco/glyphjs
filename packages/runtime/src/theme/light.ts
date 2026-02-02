import type { GlyphTheme } from '@glyphjs/types';

/**
 * Built-in light theme.
 *
 * Provides all `--glyph-*` CSS variables with values suitable for
 * light backgrounds and dark text. Palette inspired by the Oblivion
 * (2013) interface design — cool whites, desaturated cyan accents,
 * geometric precision.
 */
export const lightTheme: GlyphTheme = {
  name: 'light',
  variables: {
    // Colors
    '--glyph-bg': '#f8f9fb',
    '--glyph-text': '#1b1f27',
    '--glyph-text-muted': '#7a8599',
    '--glyph-heading': '#0f1319',
    '--glyph-link': '#3a9bc8',
    '--glyph-link-hover': '#2d7fa6',
    '--glyph-border': '#dce1e8',
    '--glyph-border-strong': '#b8c0cc',
    '--glyph-surface': '#eef1f5',
    '--glyph-surface-raised': '#f8f9fb',

    // Code
    '--glyph-code-bg': '#e8ecf1',
    '--glyph-code-text': '#1b1f27',

    // Blockquote
    '--glyph-blockquote-border': '#3a9bc8',
    '--glyph-blockquote-bg': '#eef1f5',

    // Callouts
    '--glyph-callout-info-bg': '#e8f4fa',
    '--glyph-callout-info-border': '#3a9bc8',
    '--glyph-callout-warning-bg': '#faf4e8',
    '--glyph-callout-warning-border': '#c89a3a',
    '--glyph-callout-error-bg': '#faeaea',
    '--glyph-callout-error-border': '#c84a4a',
    '--glyph-callout-tip-bg': '#e8f5ee',
    '--glyph-callout-tip-border': '#3aab6e',

    // Spacing
    '--glyph-spacing-xs': '0.25rem',
    '--glyph-spacing-sm': '0.5rem',
    '--glyph-spacing-md': '1rem',
    '--glyph-spacing-lg': '1.5rem',
    '--glyph-spacing-xl': '2rem',

    // Typography
    '--glyph-font-body': '"Inter", "Helvetica Neue", system-ui, sans-serif',
    '--glyph-font-heading': '"Inter", "Helvetica Neue", system-ui, sans-serif',
    '--glyph-font-mono': 'ui-monospace, "Cascadia Code", "Fira Code", monospace',

    // Border radius
    '--glyph-radius-sm': '0.125rem',
    '--glyph-radius-md': '0.1875rem',
    '--glyph-radius-lg': '0.25rem',
  },
};
