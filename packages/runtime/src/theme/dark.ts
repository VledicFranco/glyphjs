import type { GlyphTheme } from '@glyphjs/types';

/**
 * Built-in dark theme.
 *
 * Provides all `--glyph-*` CSS variables with values suitable for
 * dark backgrounds and light text. Palette inspired by the Oblivion
 * neon-on-dark design language — deep navy blacks, neon cyan-green
 * accents, generous radii.
 */
export const darkTheme: GlyphTheme = {
  name: 'dark',
  variables: {
    // Colors
    '--glyph-bg': '#0a0e1a',
    '--glyph-text': '#d4dae3',
    '--glyph-text-muted': '#6b7a94',
    '--glyph-heading': '#edf0f5',
    '--glyph-link': '#00d4aa',
    '--glyph-link-hover': '#33e0be',
    '--glyph-border': '#1a2035',
    '--glyph-border-strong': '#2a3550',
    '--glyph-surface': '#0f1526',
    '--glyph-surface-raised': '#162038',

    // Accent
    '--glyph-accent': '#00d4aa',
    '--glyph-accent-hover': '#33e0be',
    '--glyph-accent-subtle': '#0a1a1a',
    '--glyph-accent-muted': '#1a4a3a',

    // Code
    '--glyph-code-bg': '#0f1526',
    '--glyph-code-text': '#d4dae3',

    // Blockquote
    '--glyph-blockquote-border': '#00d4aa',
    '--glyph-blockquote-bg': '#0a1a1a',

    // Grid / Tooltip
    '--glyph-grid': '#1a2035',
    '--glyph-tooltip-bg': 'rgba(0, 0, 0, 0.9)',
    '--glyph-tooltip-text': '#d4dae3',

    // Callouts
    '--glyph-callout-info-bg': '#0a1526',
    '--glyph-callout-info-border': '#38bdf8',
    '--glyph-callout-warning-bg': '#1a1608',
    '--glyph-callout-warning-border': '#fb923c',
    '--glyph-callout-error-bg': '#1f0e0e',
    '--glyph-callout-error-border': '#f87171',
    '--glyph-callout-tip-bg': '#0a1a14',
    '--glyph-callout-tip-border': '#22c55e',

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

    // Border radius
    '--glyph-radius-sm': '0.375rem',
    '--glyph-radius-md': '0.5rem',
    '--glyph-radius-lg': '0.75rem',

    // Effects
    '--glyph-shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
    '--glyph-shadow-md': '0 4px 12px rgba(0,0,0,0.5)',
    '--glyph-shadow-lg': '0 8px 30px rgba(0,0,0,0.6)',
    '--glyph-shadow-glow': '0 0 15px rgba(0,212,170,0.3)',
    '--glyph-text-shadow': 'none',
    '--glyph-backdrop': 'none',
    '--glyph-gradient-accent': 'linear-gradient(135deg, #00d4aa, #00e5ff)',
    '--glyph-transition': '0.2s ease',
    '--glyph-opacity-muted': '0.7',
    '--glyph-opacity-disabled': '0.4',
    '--glyph-focus-ring': '0 0 0 2px #00d4aa',

    // SVG / Data Visualization
    '--glyph-node-fill-opacity': '0.85',
    '--glyph-node-radius': '3',
    '--glyph-node-stroke-width': '1.5',
    '--glyph-node-label-color': '#fff',
    '--glyph-edge-color': '#6b7a94',
    '--glyph-icon-stroke': '#fff',
    '--glyph-icon-stroke-width': '1.5',
  },
};
