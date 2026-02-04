import type { GlyphTheme } from '@glyphjs/types';

/**
 * Built-in light theme.
 *
 * Provides all `--glyph-*` CSS variables with values suitable for
 * light backgrounds and dark text. Palette inspired by the Oblivion
 * neon-on-dark design language — cool off-whites, teal accents,
 * generous radii.
 */
export const lightTheme: GlyphTheme = {
  name: 'light',
  variables: {
    // Colors
    '--glyph-bg': '#f4f6fa',
    '--glyph-text': '#1a2035',
    '--glyph-text-muted': '#6b7a94',
    '--glyph-heading': '#0a0e1a',
    '--glyph-link': '#0a9d7c',
    '--glyph-link-hover': '#088a6c',
    '--glyph-border': '#d0d8e4',
    '--glyph-border-strong': '#a8b5c8',
    '--glyph-surface': '#e8ecf3',
    '--glyph-surface-raised': '#f4f6fa',

    // Accent
    '--glyph-accent': '#0a9d7c',
    '--glyph-accent-hover': '#088a6c',
    '--glyph-accent-subtle': '#e6f6f2',
    '--glyph-accent-muted': '#b0ddd0',

    // Code
    '--glyph-code-bg': '#e8ecf3',
    '--glyph-code-text': '#1a2035',

    // Blockquote
    '--glyph-blockquote-border': '#0a9d7c',
    '--glyph-blockquote-bg': '#e6f6f2',

    // Grid / Tooltip
    '--glyph-grid': '#d0d8e4',
    '--glyph-tooltip-bg': 'rgba(10, 14, 26, 0.9)',
    '--glyph-tooltip-text': '#f4f6fa',

    // Callouts
    '--glyph-callout-info-bg': '#e6f2fa',
    '--glyph-callout-info-border': '#38bdf8',
    '--glyph-callout-warning-bg': '#fef3e2',
    '--glyph-callout-warning-border': '#fb923c',
    '--glyph-callout-error-bg': '#fde8e8',
    '--glyph-callout-error-border': '#f87171',
    '--glyph-callout-tip-bg': '#e6f6f0',
    '--glyph-callout-tip-border': '#22c55e',

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
    '--glyph-radius-sm': '0.375rem',
    '--glyph-radius-md': '0.5rem',
    '--glyph-radius-lg': '0.75rem',

    // Effects
    '--glyph-shadow-sm': '0 1px 3px rgba(0,0,0,0.1)',
    '--glyph-shadow-md': '0 4px 12px rgba(0,0,0,0.15)',
    '--glyph-shadow-lg': '0 8px 30px rgba(0,0,0,0.2)',
    '--glyph-shadow-glow': 'none',
    '--glyph-text-shadow': 'none',
    '--glyph-backdrop': 'none',
    '--glyph-gradient-accent': 'linear-gradient(135deg, #0a9d7c, #22c55e)',
    '--glyph-transition': '0.2s ease',
    '--glyph-opacity-muted': '0.7',
    '--glyph-opacity-disabled': '0.4',
    '--glyph-focus-ring': '0 0 0 2px #0a9d7c',

    // SVG / Data Visualization
    '--glyph-node-fill-opacity': '0.85',
    '--glyph-node-radius': '3',
    '--glyph-node-stroke-width': '1.5',
    '--glyph-node-label-color': '#fff',
    '--glyph-edge-color': '#a8b5c8',
    '--glyph-icon-stroke': '#fff',
    '--glyph-icon-stroke-width': '1.5',
  },
};
