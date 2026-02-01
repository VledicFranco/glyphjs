import type { Preview } from '@storybook/react';
import React from 'react';

const LIGHT_THEME_VARS: Record<string, string> = {
  '--glyph-text': '#1a1a1a',
  '--glyph-text-muted': '#6b7280',
  '--glyph-bg': '#ffffff',
  '--glyph-font-body': 'system-ui, -apple-system, sans-serif',
  '--glyph-radius-md': '0.375rem',
  '--glyph-spacing-xs': '0.25rem',
  '--glyph-spacing-sm': '0.5rem',
  '--glyph-spacing-md': '1rem',
  '--glyph-callout-info-bg': '#eff6ff',
  '--glyph-callout-info-border': '#3b82f6',
  '--glyph-callout-warning-bg': '#fffbeb',
  '--glyph-callout-warning-border': '#f59e0b',
  '--glyph-callout-error-bg': '#fef2f2',
  '--glyph-callout-error-border': '#ef4444',
  '--glyph-callout-tip-bg': '#f0fdf4',
  '--glyph-callout-tip-border': '#22c55e',
  '--glyph-table-border': '#ddd',
  '--glyph-table-header-bg': '#f5f5f5',
  '--glyph-grid': '#e0e0e0',
  '--glyph-timeline-line': '#d1d5db',
};

const DARK_THEME_VARS: Record<string, string> = {
  '--glyph-text': '#e0e0e0',
  '--glyph-text-muted': '#9ca3af',
  '--glyph-bg': '#1a1a1a',
  '--glyph-font-body': 'system-ui, -apple-system, sans-serif',
  '--glyph-radius-md': '0.375rem',
  '--glyph-spacing-xs': '0.25rem',
  '--glyph-spacing-sm': '0.5rem',
  '--glyph-spacing-md': '1rem',
  '--glyph-callout-info-bg': '#1e3a5f',
  '--glyph-callout-info-border': '#60a5fa',
  '--glyph-callout-warning-bg': '#422006',
  '--glyph-callout-warning-border': '#fbbf24',
  '--glyph-callout-error-bg': '#450a0a',
  '--glyph-callout-error-border': '#f87171',
  '--glyph-callout-tip-bg': '#052e16',
  '--glyph-callout-tip-border': '#4ade80',
  '--glyph-table-border': '#444',
  '--glyph-table-header-bg': '#2a2a2a',
  '--glyph-grid': '#333',
  '--glyph-timeline-line': '#555',
};

function ThemeWrapper({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: 'light' | 'dark';
}) {
  const vars = theme === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS;
  const style: React.CSSProperties = {
    padding: '1rem',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
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
      return React.createElement(
        ThemeWrapper,
        { theme },
        React.createElement(Story),
      );
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
