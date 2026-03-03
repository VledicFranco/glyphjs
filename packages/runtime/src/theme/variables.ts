/**
 * Canonical theme variable maps.
 *
 * These are the single source of truth for all `--glyph-*` CSS custom
 * properties.  Both the built-in themes (`lightTheme` / `darkTheme`) and
 * the Storybook decorator import from here.
 *
 * `GlyphThemeVars` is exhaustive — TypeScript enforces that every key in
 * `GlyphThemeVarKey` is present in both maps. Add new variables to the
 * union type in `@glyphjs/types` first, then add values here.
 */
import type { GlyphThemeVars } from '@glyphjs/types';

export const LIGHT_THEME_VARS: GlyphThemeVars = {
  // ── Core colors ────────────────────────────────────────────
  '--glyph-bg': 'transparent',
  '--glyph-text': '#1a2035',
  '--glyph-text-muted': '#6b7a94',
  '--glyph-heading': '#0a0e1a',
  '--glyph-link': '#0a9d7c',
  '--glyph-link-hover': '#088a6c',
  '--glyph-border': '#d0d8e4',
  '--glyph-border-strong': '#a8b5c8',
  '--glyph-surface': '#e8ecf3',
  '--glyph-surface-raised': '#f4f6fa',

  // ── Accent ─────────────────────────────────────────────────
  '--glyph-accent': '#0a9d7c',
  '--glyph-accent-hover': '#088a6c',
  '--glyph-accent-subtle': '#e6f6f2',
  '--glyph-accent-muted': '#b0ddd0',
  '--glyph-text-on-accent': '#fff',

  // ── Code ───────────────────────────────────────────────────
  '--glyph-code-bg': '#e8ecf3',
  '--glyph-code-text': '#1a2035',

  // ── Typography ─────────────────────────────────────────────
  '--glyph-font-body': '"Inter", "Helvetica Neue", system-ui, sans-serif',
  '--glyph-font-heading': '"Inter", "Helvetica Neue", system-ui, sans-serif',
  '--glyph-font-mono': 'ui-monospace, "Cascadia Code", "Fira Code", monospace',

  // ── Spacing ────────────────────────────────────────────────
  '--glyph-spacing-xs': '0.25rem',
  '--glyph-spacing-sm': '0.5rem',
  '--glyph-spacing-md': '1rem',
  '--glyph-spacing-lg': '1.5rem',
  '--glyph-spacing-xl': '2rem',

  // ── Border radius ──────────────────────────────────────────
  '--glyph-radius-xs': '0.25rem',
  '--glyph-radius-sm': '0.375rem',
  '--glyph-radius-md': '0.5rem',
  '--glyph-radius-lg': '0.75rem',

  // ── Effects ────────────────────────────────────────────────
  '--glyph-shadow-sm': '0 1px 3px rgba(0,0,0,0.1)',
  '--glyph-shadow-md': '0 4px 12px rgba(0,0,0,0.15)',
  '--glyph-shadow-lg': '0 8px 30px rgba(0,0,0,0.2)',
  '--glyph-transition': '0.2s ease',
  '--glyph-focus-ring': '0 0 0 2px #0a9d7c',
  '--glyph-opacity-muted': '0.7',
  '--glyph-opacity-disabled': '0.4',

  // ── Semantic states ────────────────────────────────────────
  '--glyph-color-success': '#16a34a',
  '--glyph-color-warning': '#d97706',
  '--glyph-color-error': '#dc2626',
  '--glyph-color-info': '#38bdf8',

  // ── Shared palette ─────────────────────────────────────────
  '--glyph-palette-color-1': '#00d4aa',
  '--glyph-palette-color-2': '#b44dff',
  '--glyph-palette-color-3': '#22c55e',
  '--glyph-palette-color-4': '#e040fb',
  '--glyph-palette-color-5': '#00e5ff',
  '--glyph-palette-color-6': '#84cc16',
  '--glyph-palette-color-7': '#f472b6',
  '--glyph-palette-color-8': '#fb923c',
  '--glyph-palette-color-9': '#818cf8',
  '--glyph-palette-color-10': '#38bdf8',

  // ── Misc ───────────────────────────────────────────────────
  '--glyph-tooltip-bg': 'rgba(10, 14, 26, 0.9)',
  '--glyph-tooltip-text': '#f4f6fa',
  '--glyph-rating-star-fill': '#f59e0b',
};

export const DARK_THEME_VARS: GlyphThemeVars = {
  // ── Core colors ────────────────────────────────────────────
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

  // ── Accent ─────────────────────────────────────────────────
  '--glyph-accent': '#00d4aa',
  '--glyph-accent-hover': '#33e0be',
  '--glyph-accent-subtle': '#0a1a1a',
  '--glyph-accent-muted': '#1a4a3a',
  '--glyph-text-on-accent': '#0a0e1a',

  // ── Code ───────────────────────────────────────────────────
  '--glyph-code-bg': '#0f1526',
  '--glyph-code-text': '#d4dae3',

  // ── Typography ─────────────────────────────────────────────
  '--glyph-font-body': '"Inter", "Helvetica Neue", system-ui, sans-serif',
  '--glyph-font-heading': '"Inter", "Helvetica Neue", system-ui, sans-serif',
  '--glyph-font-mono': 'ui-monospace, "Cascadia Code", "Fira Code", monospace',

  // ── Spacing ────────────────────────────────────────────────
  '--glyph-spacing-xs': '0.25rem',
  '--glyph-spacing-sm': '0.5rem',
  '--glyph-spacing-md': '1rem',
  '--glyph-spacing-lg': '1.5rem',
  '--glyph-spacing-xl': '2rem',

  // ── Border radius ──────────────────────────────────────────
  '--glyph-radius-xs': '0.25rem',
  '--glyph-radius-sm': '0.375rem',
  '--glyph-radius-md': '0.5rem',
  '--glyph-radius-lg': '0.75rem',

  // ── Effects ────────────────────────────────────────────────
  '--glyph-shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
  '--glyph-shadow-md': '0 4px 12px rgba(0,0,0,0.5)',
  '--glyph-shadow-lg': '0 8px 30px rgba(0,0,0,0.6)',
  '--glyph-transition': '0.2s ease',
  '--glyph-focus-ring': '0 0 0 2px #00d4aa',
  '--glyph-opacity-muted': '0.7',
  '--glyph-opacity-disabled': '0.4',

  // ── Semantic states ────────────────────────────────────────
  '--glyph-color-success': '#4ade80',
  '--glyph-color-warning': '#fbbf24',
  '--glyph-color-error': '#f87171',
  '--glyph-color-info': '#38bdf8',

  // ── Shared palette ─────────────────────────────────────────
  '--glyph-palette-color-1': '#00d4aa',
  '--glyph-palette-color-2': '#b44dff',
  '--glyph-palette-color-3': '#4ade80',
  '--glyph-palette-color-4': '#e040fb',
  '--glyph-palette-color-5': '#00e5ff',
  '--glyph-palette-color-6': '#bef264',
  '--glyph-palette-color-7': '#f472b6',
  '--glyph-palette-color-8': '#fb923c',
  '--glyph-palette-color-9': '#818cf8',
  '--glyph-palette-color-10': '#38bdf8',

  // ── Misc ───────────────────────────────────────────────────
  '--glyph-tooltip-bg': 'rgba(0, 0, 0, 0.9)',
  '--glyph-tooltip-text': '#d4dae3',
  '--glyph-rating-star-fill': '#fbbf24',
};

/**
 * Convert a theme variable map to a CSS string suitable for injection
 * into a `<style>` tag or inline style attribute.
 *
 * @example
 * ```ts
 * const css = themeVarsToCSS(LIGHT_THEME_VARS);
 * // => "--glyph-bg: transparent; --glyph-text: #1a2035; ..."
 * ```
 */
export function themeVarsToCSS(vars: GlyphThemeVars | Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}
