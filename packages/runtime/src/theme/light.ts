import type { GlyphTheme } from '@glyphjs/types';

/**
 * Built-in light theme.
 *
 * Provides all `--glyph-*` CSS variables with values suitable for
 * light backgrounds and dark text.
 */
export const lightTheme: GlyphTheme = {
  name: 'light',
  variables: {
    // Colors
    '--glyph-bg': '#ffffff',
    '--glyph-text': '#1a1a1a',
    '--glyph-text-muted': '#6b7280',
    '--glyph-heading': '#111827',
    '--glyph-link': '#2563eb',
    '--glyph-link-hover': '#1d4ed8',
    '--glyph-border': '#e5e7eb',
    '--glyph-border-strong': '#d1d5db',
    '--glyph-surface': '#f9fafb',
    '--glyph-surface-raised': '#ffffff',

    // Code
    '--glyph-code-bg': '#f3f4f6',
    '--glyph-code-text': '#1f2937',

    // Blockquote
    '--glyph-blockquote-border': '#d1d5db',
    '--glyph-blockquote-bg': '#f9fafb',

    // Callouts
    '--glyph-callout-info-bg': '#eff6ff',
    '--glyph-callout-info-border': '#3b82f6',
    '--glyph-callout-warning-bg': '#fffbeb',
    '--glyph-callout-warning-border': '#f59e0b',
    '--glyph-callout-error-bg': '#fef2f2',
    '--glyph-callout-error-border': '#ef4444',
    '--glyph-callout-tip-bg': '#f0fdf4',
    '--glyph-callout-tip-border': '#22c55e',

    // Spacing
    '--glyph-spacing-xs': '0.25rem',
    '--glyph-spacing-sm': '0.5rem',
    '--glyph-spacing-md': '1rem',
    '--glyph-spacing-lg': '1.5rem',
    '--glyph-spacing-xl': '2rem',

    // Typography
    '--glyph-font-body': 'system-ui, -apple-system, sans-serif',
    '--glyph-font-heading': 'system-ui, -apple-system, sans-serif',
    '--glyph-font-mono': 'ui-monospace, "Cascadia Code", "Fira Code", monospace',

    // Border radius
    '--glyph-radius-sm': '0.25rem',
    '--glyph-radius-md': '0.375rem',
    '--glyph-radius-lg': '0.5rem',
  },
};
