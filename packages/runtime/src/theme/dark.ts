import type { GlyphTheme } from '@glyphjs/types';

/**
 * Built-in dark theme.
 *
 * Provides all `--glyph-*` CSS variables with values suitable for
 * dark backgrounds and light text. Palette inspired by the Oblivion
 * (2013) interface design — deep cool blacks, desaturated cyan accents,
 * geometric precision.
 */
export const darkTheme: GlyphTheme = {
  name: 'dark',
  variables: {
    // Colors
    '--glyph-bg': '#0a0e14',
    '--glyph-text': '#d4dae3',
    '--glyph-text-muted': '#7a8599',
    '--glyph-heading': '#e8ecf1',
    '--glyph-link': '#5bb8db',
    '--glyph-link-hover': '#8fd4ef',
    '--glyph-border': '#1e2633',
    '--glyph-border-strong': '#2d3847',
    '--glyph-surface': '#111820',
    '--glyph-surface-raised': '#1a2230',

    // Code
    '--glyph-code-bg': '#111820',
    '--glyph-code-text': '#d4dae3',

    // Blockquote
    '--glyph-blockquote-border': '#3a9bc8',
    '--glyph-blockquote-bg': '#111820',

    // Callouts
    '--glyph-callout-info-bg': '#0e1a26',
    '--glyph-callout-info-border': '#3a9bc8',
    '--glyph-callout-warning-bg': '#1a1608',
    '--glyph-callout-warning-border': '#c89a3a',
    '--glyph-callout-error-bg': '#1f0e0e',
    '--glyph-callout-error-border': '#c84a4a',
    '--glyph-callout-tip-bg': '#0e1f12',
    '--glyph-callout-tip-border': '#3aab6e',

    // Spacing (same as light — spacing is mode-independent)
    '--glyph-spacing-xs': '0.25rem',
    '--glyph-spacing-sm': '0.5rem',
    '--glyph-spacing-md': '1rem',
    '--glyph-spacing-lg': '1.5rem',
    '--glyph-spacing-xl': '2rem',

    // Typography (same as light — font stacks are mode-independent)
    '--glyph-font-body': '"Inter", "Helvetica Neue", system-ui, sans-serif',
    '--glyph-font-heading': '"Inter", "Helvetica Neue", system-ui, sans-serif',
    '--glyph-font-mono': 'ui-monospace, "Cascadia Code", "Fira Code", monospace',

    // Border radius (same as light)
    '--glyph-radius-sm': '0.125rem',
    '--glyph-radius-md': '0.1875rem',
    '--glyph-radius-lg': '0.25rem',
  },
};
