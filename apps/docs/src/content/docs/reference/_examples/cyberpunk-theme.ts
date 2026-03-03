import type { GlyphTheme } from '@glyphjs/types';

/**
 * Cyberpunk 2077 inspired theme for GlyphJS.
 *
 * Deep chrome-black backgrounds, neon yellow accents, cyber-red edges,
 * electric blue highlights, and aggressive neon glow effects.
 *
 * Demonstrates the full set of 53 Tier 1 CSS variables.
 */
export const cyberpunk2077Theme: GlyphTheme = {
  name: 'cyberpunk-2077',
  variables: {
    // ── Core colors ────────────────────────────────────────────
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

    // ── Accent ─────────────────────────────────────────────────
    '--glyph-accent': '#fcee09',
    '--glyph-accent-hover': '#ffe566',
    '--glyph-accent-subtle': '#1a1a08',
    '--glyph-accent-muted': '#3d3a0e',
    '--glyph-text-on-accent': '#0d0d0d',

    // ── Code ───────────────────────────────────────────────────
    '--glyph-code-bg': '#1a1a2e',
    '--glyph-code-text': '#00f0ff',

    // ── Typography — cyberpunk-style fonts ─────────────────────
    '--glyph-font-body': '"Rajdhani", "Share Tech", system-ui, sans-serif',
    '--glyph-font-heading': '"Orbitron", "Audiowide", system-ui, sans-serif',
    '--glyph-font-mono': '"Fira Code", "JetBrains Mono", ui-monospace, monospace',

    // ── Spacing ────────────────────────────────────────────────
    '--glyph-spacing-xs': '0.25rem',
    '--glyph-spacing-sm': '0.5rem',
    '--glyph-spacing-md': '1rem',
    '--glyph-spacing-lg': '1.5rem',
    '--glyph-spacing-xl': '2rem',

    // ── Border radius — sharp, angular ─────────────────────────
    '--glyph-radius-xs': '1px',
    '--glyph-radius-sm': '2px',
    '--glyph-radius-md': '4px',
    '--glyph-radius-lg': '6px',

    // ── Effects — aggressive neon glow ─────────────────────────
    '--glyph-shadow-sm': '0 1px 4px rgba(252,238,9,0.15)',
    '--glyph-shadow-md': '0 4px 16px rgba(252,238,9,0.2)',
    '--glyph-shadow-lg': '0 0 20px rgba(252,238,9,0.4), 0 0 60px rgba(252,238,9,0.1)',
    '--glyph-transition': '0.15s ease-out',
    '--glyph-focus-ring': '0 0 0 2px #fcee09, 0 0 12px rgba(252,238,9,0.5)',
    '--glyph-opacity-muted': '0.65',
    '--glyph-opacity-disabled': '0.35',

    // ── Semantic states — cyber neons ──────────────────────────
    '--glyph-color-success': '#39ff14',
    '--glyph-color-warning': '#fcee09',
    '--glyph-color-error': '#ff003c',
    '--glyph-color-info': '#00f0ff',

    // ── Shared palette — neon spectrum ─────────────────────────
    '--glyph-palette-color-1': '#fcee09',
    '--glyph-palette-color-2': '#00f0ff',
    '--glyph-palette-color-3': '#39ff14',
    '--glyph-palette-color-4': '#ff003c',
    '--glyph-palette-color-5': '#ff6ec7',
    '--glyph-palette-color-6': '#7df9ff',
    '--glyph-palette-color-7': '#bf5fff',
    '--glyph-palette-color-8': '#fb923c',
    '--glyph-palette-color-9': '#c8fb50',
    '--glyph-palette-color-10': '#f5a0c5',

    // ── Misc ───────────────────────────────────────────────────
    '--glyph-tooltip-bg': 'rgba(13,13,13,0.95)',
    '--glyph-tooltip-text': '#fcee09',
    '--glyph-rating-star-fill': '#fcee09',
  },
};
