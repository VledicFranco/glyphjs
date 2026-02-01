import type { GlyphTheme } from '@glyphjs/types';

/**
 * Built-in dark theme.
 *
 * Provides all `--glyph-*` CSS variables with values suitable for
 * dark backgrounds and light text.
 */
export const darkTheme: GlyphTheme = {
  name: 'dark',
  variables: {
    // Colors
    '--glyph-bg': '#111827',
    '--glyph-text': '#f3f4f6',
    '--glyph-text-muted': '#9ca3af',
    '--glyph-heading': '#f9fafb',
    '--glyph-link': '#60a5fa',
    '--glyph-link-hover': '#93bbfd',
    '--glyph-border': '#374151',
    '--glyph-border-strong': '#4b5563',
    '--glyph-surface': '#1f2937',
    '--glyph-surface-raised': '#374151',

    // Code
    '--glyph-code-bg': '#1f2937',
    '--glyph-code-text': '#e5e7eb',

    // Blockquote
    '--glyph-blockquote-border': '#4b5563',
    '--glyph-blockquote-bg': '#1f2937',

    // Callouts
    '--glyph-callout-info-bg': '#1e293b',
    '--glyph-callout-info-border': '#3b82f6',
    '--glyph-callout-warning-bg': '#292524',
    '--glyph-callout-warning-border': '#f59e0b',
    '--glyph-callout-error-bg': '#2d1b1b',
    '--glyph-callout-error-border': '#ef4444',
    '--glyph-callout-tip-bg': '#1a2e1a',
    '--glyph-callout-tip-border': '#22c55e',

    // Spacing (same as light — spacing is mode-independent)
    '--glyph-spacing-xs': '0.25rem',
    '--glyph-spacing-sm': '0.5rem',
    '--glyph-spacing-md': '1rem',
    '--glyph-spacing-lg': '1.5rem',
    '--glyph-spacing-xl': '2rem',

    // Typography (same as light — font stacks are mode-independent)
    '--glyph-font-body': 'system-ui, -apple-system, sans-serif',
    '--glyph-font-heading': 'system-ui, -apple-system, sans-serif',
    '--glyph-font-mono': 'ui-monospace, "Cascadia Code", "Fira Code", monospace',

    // Border radius (same as light)
    '--glyph-radius-sm': '0.25rem',
    '--glyph-radius-md': '0.375rem',
    '--glyph-radius-lg': '0.5rem',
  },
};
