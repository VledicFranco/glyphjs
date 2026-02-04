import type { GlyphTheme } from '@glyphjs/types';

/**
 * Cyberpunk 2077 inspired theme for GlyphJS.
 *
 * Deep chrome-black backgrounds, neon yellow accents, cyber-red edges,
 * electric blue highlights, aggressive glow effects, and scanline-ready
 * backdrop filters. Demonstrates every available CSS variable.
 */
export const cyberpunk2077Theme: GlyphTheme = {
  name: 'cyberpunk-2077',
  variables: {
    // Colors
    '--glyph-bg': '#0d0d0d',
    '--glyph-text': '#e0f7fa',
    '--glyph-text-muted': '#7b8fa3',
    '--glyph-heading': '#fcee09',
    '--glyph-link': '#00f0ff',
    '--glyph-link-hover': '#ff003c',
    '--glyph-border': 'rgba(252,238,9,0.3)',
    '--glyph-border-strong': 'rgba(252,238,9,0.5)',
    '--glyph-surface': '#1a1a2e',
    '--glyph-surface-raised': '#1f1020',

    // Accent
    '--glyph-accent': '#fcee09',
    '--glyph-accent-hover': '#ffe566',
    '--glyph-accent-subtle': '#1a1a08',
    '--glyph-accent-muted': '#3d3a0e',

    // Code
    '--glyph-code-bg': '#1a1a2e',
    '--glyph-code-text': '#00f0ff',

    // Blockquote
    '--glyph-blockquote-border': '#ff003c',
    '--glyph-blockquote-bg': '#1f1020',

    // Grid / Tooltip
    '--glyph-grid': 'rgba(252,238,9,0.15)',
    '--glyph-tooltip-bg': 'rgba(13,13,13,0.95)',
    '--glyph-tooltip-text': '#fcee09',

    // Callouts
    '--glyph-callout-info-bg': '#0d1a2e',
    '--glyph-callout-info-border': '#00f0ff',
    '--glyph-callout-warning-bg': '#1a1a08',
    '--glyph-callout-warning-border': '#fcee09',
    '--glyph-callout-error-bg': '#2d0d0d',
    '--glyph-callout-error-border': '#ff003c',
    '--glyph-callout-tip-bg': '#0d1a14',
    '--glyph-callout-tip-border': '#39ff14',

    // Spacing
    '--glyph-spacing-xs': '0.25rem',
    '--glyph-spacing-sm': '0.5rem',
    '--glyph-spacing-md': '1rem',
    '--glyph-spacing-lg': '1.5rem',
    '--glyph-spacing-xl': '2rem',

    // Typography
    '--glyph-font-body': '"Rajdhani", "Share Tech", system-ui, sans-serif',
    '--glyph-font-heading': '"Orbitron", "Audiowide", system-ui, sans-serif',
    '--glyph-font-mono': '"Fira Code", "JetBrains Mono", ui-monospace, monospace',

    // Border radius
    '--glyph-radius-sm': '2px',
    '--glyph-radius-md': '4px',
    '--glyph-radius-lg': '6px',

    // Effects
    '--glyph-shadow-sm': '0 1px 4px rgba(252,238,9,0.15)',
    '--glyph-shadow-md': '0 4px 16px rgba(252,238,9,0.2)',
    '--glyph-shadow-lg': '0 0 20px rgba(252,238,9,0.4), 0 0 60px rgba(252,238,9,0.1)',
    '--glyph-shadow-glow': '0 0 20px rgba(252,238,9,0.4), 0 0 60px rgba(252,238,9,0.1)',
    '--glyph-text-shadow': '0 0 8px rgba(252,238,9,0.6)',
    '--glyph-backdrop': 'blur(12px) saturate(180%)',
    '--glyph-gradient-accent': 'linear-gradient(135deg, #fcee09, #ff003c)',
    '--glyph-transition': '0.15s ease-out',
    '--glyph-opacity-muted': '0.65',
    '--glyph-opacity-disabled': '0.35',
    '--glyph-focus-ring': '0 0 0 2px #fcee09, 0 0 12px rgba(252,238,9,0.5)',

    // SVG / Data Visualization
    '--glyph-node-fill-opacity': '0.9',
    '--glyph-node-radius': '2',
    '--glyph-node-stroke-width': '2',
    '--glyph-node-label-color': '#fcee09',
    '--glyph-edge-color': '#ff003c',
    '--glyph-icon-stroke': '#00f0ff',
    '--glyph-icon-stroke-width': '2',
  },
};
