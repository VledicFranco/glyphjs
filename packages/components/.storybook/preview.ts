import type { Preview } from '@storybook/react';
import React from 'react';

const LIGHT_THEME_VARS: Record<string, string> = {
  '--glyph-bg': '#f8f9fb',
  '--glyph-text': '#1b1f27',
  '--glyph-text-muted': '#7a8599',
  '--glyph-heading': '#0f1319',
  '--glyph-link': '#b8922e',
  '--glyph-link-hover': '#96760e',
  '--glyph-border': '#dce1e8',
  '--glyph-border-strong': '#b8c0cc',
  '--glyph-surface': '#eef1f5',
  '--glyph-surface-raised': '#f8f9fb',
  '--glyph-accent': '#d4a843',
  '--glyph-accent-hover': '#b8922e',
  '--glyph-accent-subtle': '#faf4e8',
  '--glyph-accent-muted': '#e8d5a8',
  '--glyph-font-body': '"Inter", "Helvetica Neue", system-ui, sans-serif',
  '--glyph-font-heading': '"Inter", "Helvetica Neue", system-ui, sans-serif',
  '--glyph-font-mono': 'ui-monospace, "Cascadia Code", "Fira Code", monospace',
  '--glyph-radius-sm': '0.125rem',
  '--glyph-radius-md': '0.1875rem',
  '--glyph-radius-lg': '0.25rem',
  '--glyph-spacing-xs': '0.25rem',
  '--glyph-spacing-sm': '0.5rem',
  '--glyph-spacing-md': '1rem',
  '--glyph-callout-info-bg': '#e8f4fa',
  '--glyph-callout-info-border': '#3a9bc8',
  '--glyph-callout-warning-bg': '#faf4e8',
  '--glyph-callout-warning-border': '#c89a3a',
  '--glyph-callout-error-bg': '#faeaea',
  '--glyph-callout-error-border': '#c84a4a',
  '--glyph-callout-tip-bg': '#e8f5ee',
  '--glyph-callout-tip-border': '#3aab6e',
  '--glyph-table-border': '#dce1e8',
  '--glyph-table-header-bg': '#eef1f5',
  '--glyph-grid': '#dce1e8',
  '--glyph-tooltip-bg': 'rgba(15, 19, 25, 0.9)',
  '--glyph-tooltip-text': '#f8f9fb',
  '--glyph-timeline-line': '#dce1e8',
};

const DARK_THEME_VARS: Record<string, string> = {
  '--glyph-bg': '#0a0e14',
  '--glyph-text': '#d4dae3',
  '--glyph-text-muted': '#7a8599',
  '--glyph-heading': '#e8ecf1',
  '--glyph-link': '#d4a843',
  '--glyph-link-hover': '#e4be6a',
  '--glyph-border': '#1e2633',
  '--glyph-border-strong': '#2d3847',
  '--glyph-surface': '#111820',
  '--glyph-surface-raised': '#1a2230',
  '--glyph-accent': '#d4a843',
  '--glyph-accent-hover': '#e4be6a',
  '--glyph-accent-subtle': '#1f1a0e',
  '--glyph-accent-muted': '#5c4a24',
  '--glyph-font-body': '"Inter", "Helvetica Neue", system-ui, sans-serif',
  '--glyph-font-heading': '"Inter", "Helvetica Neue", system-ui, sans-serif',
  '--glyph-font-mono': 'ui-monospace, "Cascadia Code", "Fira Code", monospace',
  '--glyph-radius-sm': '0.125rem',
  '--glyph-radius-md': '0.1875rem',
  '--glyph-radius-lg': '0.25rem',
  '--glyph-spacing-xs': '0.25rem',
  '--glyph-spacing-sm': '0.5rem',
  '--glyph-spacing-md': '1rem',
  '--glyph-callout-info-bg': '#0e1a26',
  '--glyph-callout-info-border': '#3a9bc8',
  '--glyph-callout-warning-bg': '#1a1608',
  '--glyph-callout-warning-border': '#c89a3a',
  '--glyph-callout-error-bg': '#1f0e0e',
  '--glyph-callout-error-border': '#c84a4a',
  '--glyph-callout-tip-bg': '#0e1f12',
  '--glyph-callout-tip-border': '#3aab6e',
  '--glyph-table-border': '#1e2633',
  '--glyph-table-header-bg': '#111820',
  '--glyph-table-header-color': '#d4dae3',
  '--glyph-table-row-alt-bg': '#141c28',
  '--glyph-table-cell-color': '#d4dae3',
  '--glyph-table-footer-bg': '#111820',
  '--glyph-table-footer-color': '#d4dae3',
  '--glyph-grid': '#1e2633',
  '--glyph-tooltip-bg': 'rgba(0, 0, 0, 0.9)',
  '--glyph-tooltip-text': '#d4dae3',
  '--glyph-timeline-line': '#2d3847',
};

function ThemeWrapper({ children, theme }: { children: React.ReactNode; theme: 'light' | 'dark' }) {
  const vars = theme === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS;
  const style: React.CSSProperties = {
    padding: '1rem',
    backgroundColor: theme === 'dark' ? '#0a0e14' : '#f8f9fb',
    color: theme === 'dark' ? '#d4dae3' : '#1b1f27',
    minHeight: '100vh',
  };

  // Merge CSS custom properties into the style object
  for (const [key, value] of Object.entries(vars)) {
    (style as Record<string, string>)[key] = value;
  }

  return React.createElement('div', { style }, children);
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals['theme'] as 'light' | 'dark') || 'light';
      return React.createElement(ThemeWrapper, { theme }, React.createElement(Story));
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
