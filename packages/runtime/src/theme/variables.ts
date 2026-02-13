/**
 * Canonical theme variable maps.
 *
 * These are the single source of truth for all `--glyph-*` CSS custom
 * properties.  Both the built-in themes (`lightTheme` / `darkTheme`) and
 * the Storybook decorator import from here.
 */

export const LIGHT_THEME_VARS: Record<string, string> = {
  // ── Core colors ────────────────────────────────────────────
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

  // ── Accent ─────────────────────────────────────────────────
  '--glyph-accent': '#0a9d7c',
  '--glyph-accent-hover': '#088a6c',
  '--glyph-accent-subtle': '#e6f6f2',
  '--glyph-accent-muted': '#b0ddd0',

  // ── Code ───────────────────────────────────────────────────
  '--glyph-code-bg': '#e8ecf3',
  '--glyph-code-text': '#1a2035',

  // ── Blockquote ─────────────────────────────────────────────
  '--glyph-blockquote-border': '#0a9d7c',
  '--glyph-blockquote-bg': '#e6f6f2',

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
  '--glyph-radius-sm': '0.375rem',
  '--glyph-radius-md': '0.5rem',
  '--glyph-radius-lg': '0.75rem',

  // ── Callouts ───────────────────────────────────────────────
  '--glyph-callout-info-bg': '#e6f2fa',
  '--glyph-callout-info-border': '#38bdf8',
  '--glyph-callout-warning-bg': '#fef3e2',
  '--glyph-callout-warning-border': '#fb923c',
  '--glyph-callout-error-bg': '#fde8e8',
  '--glyph-callout-error-border': '#f87171',
  '--glyph-callout-tip-bg': '#e6f6f0',
  '--glyph-callout-tip-border': '#22c55e',

  // ── Table ──────────────────────────────────────────────────
  '--glyph-table-border': '#d0d8e4',
  '--glyph-table-header-bg': '#e8ecf3',

  // ── Grid / Tooltip ─────────────────────────────────────────
  '--glyph-grid': '#d0d8e4',
  '--glyph-tooltip-bg': 'rgba(10, 14, 26, 0.9)',
  '--glyph-tooltip-text': '#f4f6fa',

  // ── Timeline ───────────────────────────────────────────────
  '--glyph-timeline-line': '#d0d8e4',

  // ── Effects ────────────────────────────────────────────────
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

  // ── SVG / Data Visualization ───────────────────────────────
  '--glyph-node-fill-opacity': '0.85',
  '--glyph-node-radius': '3',
  '--glyph-node-stroke-width': '1.5',
  '--glyph-node-label-color': '#fff',
  '--glyph-edge-color': '#a8b5c8',
  '--glyph-icon-stroke': '#fff',
  '--glyph-icon-stroke-width': '1.5',

  // ── KPI ────────────────────────────────────────────────────
  '--glyph-kpi-positive': '#16a34a',
  '--glyph-kpi-negative': '#dc2626',
  '--glyph-kpi-neutral': '#6b7a94',

  // ── Comparison ─────────────────────────────────────────────
  '--glyph-comparison-yes': '#16a34a',
  '--glyph-comparison-no': '#dc2626',
  '--glyph-comparison-partial': '#d97706',

  // ── CodeDiff ───────────────────────────────────────────────
  '--glyph-codediff-add-bg': 'rgba(22, 163, 106, 0.1)',
  '--glyph-codediff-add-color': '#166534',
  '--glyph-codediff-del-bg': 'rgba(220, 38, 38, 0.1)',
  '--glyph-codediff-del-color': '#991b1b',
  '--glyph-codediff-gutter-bg': '#e8ecf3',

  // ── Infographic ────────────────────────────────────────────
  '--glyph-infographic-track': '#e0e4ea',
  '--glyph-infographic-color-1': '#3b82f6',
  '--glyph-infographic-color-2': '#22c55e',
  '--glyph-infographic-color-3': '#f59e0b',
  '--glyph-infographic-color-4': '#ef4444',
  '--glyph-infographic-section-divider': '#d0d8e4',
  '--glyph-infographic-star': '#f59e0b',
  '--glyph-infographic-accent': '#3b82f6',
  '--glyph-infographic-value-color': '#1d4ed8',
  '--glyph-infographic-heading-color': '#1e293b',
  '--glyph-infographic-label-color': '#475569',
  '--glyph-infographic-desc-color': '#64748b',
  '--glyph-infographic-section-bg': 'rgba(255, 255, 255, 0.5)',

  // ── Poll ───────────────────────────────────────────────────
  '--glyph-poll-bar-bg': '#e8ecf3',
  '--glyph-poll-bar-fill': '#0a9d7c',

  // ── Rating ─────────────────────────────────────────────────
  '--glyph-rating-star-fill': '#f59e0b',
  '--glyph-rating-star-empty': '#d0d8e4',
  '--glyph-rating-hover': '#fbbf24',

  // ── Slider ─────────────────────────────────────────────────
  '--glyph-slider-track': '#d0d8e4',
  '--glyph-slider-fill': '#0a9d7c',
  '--glyph-slider-thumb': '#0a9d7c',

  // ── Kanban ─────────────────────────────────────────────────
  '--glyph-kanban-column-bg': '#e8ecf3',
  '--glyph-kanban-card-bg': '#f4f6fa',
  '--glyph-kanban-card-border': '#d0d8e4',
  '--glyph-kanban-drag-shadow': '0 4px 12px rgba(0,0,0,0.15)',
  '--glyph-kanban-priority-high': '#dc2626',
  '--glyph-kanban-priority-medium': '#f59e0b',
  '--glyph-kanban-priority-low': '#22c55e',

  // ── Annotate ───────────────────────────────────────────────
  '--glyph-annotate-highlight-opacity': '0.3',
  '--glyph-annotate-label-bg': '#f4f6fa',
  '--glyph-annotate-sidebar-bg': '#e8ecf3',

  // ── Form ───────────────────────────────────────────────────
  '--glyph-form-error': '#dc2626',

  // ── Interaction ────────────────────────────────────────────
  '--glyph-interaction-overlay-bg': 'rgba(244, 246, 250, 0.8)',
  '--glyph-interaction-overlay-text': '#1a2035',
  '--glyph-interaction-tooltip-bg': 'rgba(26, 32, 53, 0.9)',
  '--glyph-interaction-tooltip-text': '#f4f6fa',
  '--glyph-interaction-active-border': '#0a9d7c',
};

export const DARK_THEME_VARS: Record<string, string> = {
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

  // ── Code ───────────────────────────────────────────────────
  '--glyph-code-bg': '#0f1526',
  '--glyph-code-text': '#d4dae3',

  // ── Blockquote ─────────────────────────────────────────────
  '--glyph-blockquote-border': '#00d4aa',
  '--glyph-blockquote-bg': '#0a1a1a',

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
  '--glyph-radius-sm': '0.375rem',
  '--glyph-radius-md': '0.5rem',
  '--glyph-radius-lg': '0.75rem',

  // ── Callouts ───────────────────────────────────────────────
  '--glyph-callout-info-bg': '#0a1526',
  '--glyph-callout-info-border': '#38bdf8',
  '--glyph-callout-warning-bg': '#1a1608',
  '--glyph-callout-warning-border': '#fb923c',
  '--glyph-callout-error-bg': '#1f0e0e',
  '--glyph-callout-error-border': '#f87171',
  '--glyph-callout-tip-bg': '#0a1a14',
  '--glyph-callout-tip-border': '#22c55e',

  // ── Table ──────────────────────────────────────────────────
  '--glyph-table-border': '#1a2035',
  '--glyph-table-header-bg': '#0f1526',
  '--glyph-table-header-color': '#d4dae3',
  '--glyph-table-row-alt-bg': '#121a2c',
  '--glyph-table-cell-color': '#d4dae3',
  '--glyph-table-footer-bg': '#0f1526',
  '--glyph-table-footer-color': '#d4dae3',

  // ── Grid / Tooltip ─────────────────────────────────────────
  '--glyph-grid': '#1a2035',
  '--glyph-tooltip-bg': 'rgba(0, 0, 0, 0.9)',
  '--glyph-tooltip-text': '#d4dae3',

  // ── Timeline ───────────────────────────────────────────────
  '--glyph-timeline-line': '#2a3550',

  // ── Effects ────────────────────────────────────────────────
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

  // ── SVG / Data Visualization ───────────────────────────────
  '--glyph-node-fill-opacity': '0.85',
  '--glyph-node-radius': '3',
  '--glyph-node-stroke-width': '1.5',
  '--glyph-node-label-color': '#fff',
  '--glyph-edge-color': '#6b7a94',
  '--glyph-icon-stroke': '#fff',
  '--glyph-icon-stroke-width': '1.5',

  // ── KPI ────────────────────────────────────────────────────
  '--glyph-kpi-positive': '#22c55e',
  '--glyph-kpi-negative': '#f87171',
  '--glyph-kpi-neutral': '#6b7a94',

  // ── Comparison ─────────────────────────────────────────────
  '--glyph-comparison-yes': '#22c55e',
  '--glyph-comparison-no': '#f87171',
  '--glyph-comparison-partial': '#fbbf24',

  // ── CodeDiff ───────────────────────────────────────────────
  '--glyph-codediff-add-bg': 'rgba(34, 197, 94, 0.15)',
  '--glyph-codediff-add-color': '#86efac',
  '--glyph-codediff-del-bg': 'rgba(248, 113, 113, 0.15)',
  '--glyph-codediff-del-color': '#fca5a5',
  '--glyph-codediff-gutter-bg': '#0f1526',

  // ── Infographic ────────────────────────────────────────────
  '--glyph-infographic-track': '#2a3550',
  '--glyph-infographic-color-1': '#60a5fa',
  '--glyph-infographic-color-2': '#4ade80',
  '--glyph-infographic-color-3': '#fbbf24',
  '--glyph-infographic-color-4': '#f87171',
  '--glyph-infographic-section-divider': '#1a2035',
  '--glyph-infographic-star': '#fbbf24',
  '--glyph-infographic-accent': '#60a5fa',
  '--glyph-infographic-value-color': '#93c5fd',
  '--glyph-infographic-heading-color': '#e2e8f0',
  '--glyph-infographic-label-color': '#94a3b8',
  '--glyph-infographic-desc-color': '#64748b',
  '--glyph-infographic-section-bg': 'rgba(255, 255, 255, 0.03)',

  // ── Poll ───────────────────────────────────────────────────
  '--glyph-poll-bar-bg': '#1a2035',
  '--glyph-poll-bar-fill': '#00d4aa',

  // ── Rating ─────────────────────────────────────────────────
  '--glyph-rating-star-fill': '#fbbf24',
  '--glyph-rating-star-empty': '#2a3550',
  '--glyph-rating-hover': '#fcd34d',

  // ── Slider ─────────────────────────────────────────────────
  '--glyph-slider-track': '#1a2035',
  '--glyph-slider-fill': '#00d4aa',
  '--glyph-slider-thumb': '#00d4aa',

  // ── Kanban ─────────────────────────────────────────────────
  '--glyph-kanban-column-bg': '#0f1526',
  '--glyph-kanban-card-bg': '#162038',
  '--glyph-kanban-card-border': '#1a2035',
  '--glyph-kanban-drag-shadow': '0 4px 12px rgba(0,0,0,0.5)',
  '--glyph-kanban-priority-high': '#f87171',
  '--glyph-kanban-priority-medium': '#fbbf24',
  '--glyph-kanban-priority-low': '#4ade80',

  // ── Annotate ───────────────────────────────────────────────
  '--glyph-annotate-highlight-opacity': '0.3',
  '--glyph-annotate-label-bg': '#162038',
  '--glyph-annotate-sidebar-bg': '#0f1526',

  // ── Form ───────────────────────────────────────────────────
  '--glyph-form-error': '#f87171',

  // ── Interaction ────────────────────────────────────────────
  '--glyph-interaction-overlay-bg': 'rgba(10, 14, 26, 0.8)',
  '--glyph-interaction-overlay-text': '#d4dae3',
  '--glyph-interaction-tooltip-bg': 'rgba(0, 0, 0, 0.9)',
  '--glyph-interaction-tooltip-text': '#d4dae3',
  '--glyph-interaction-active-border': '#00d4aa',
};

/**
 * Convert a theme variable map to a CSS string suitable for injection
 * into a `<style>` tag or inline style attribute.
 *
 * @example
 * ```ts
 * const css = themeVarsToCSS(LIGHT_THEME_VARS);
 * // => "--glyph-bg: #f4f6fa; --glyph-text: #1a2035; ..."
 * ```
 */
export function themeVarsToCSS(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}
