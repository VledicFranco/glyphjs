import type { Preview } from '@storybook/react';
import React from 'react';
import { LIGHT_THEME_VARS, DARK_THEME_VARS } from '@glyphjs/runtime';

function ThemeWrapper({ children, theme }: { children: React.ReactNode; theme: 'light' | 'dark' }) {
  const vars = theme === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS;
  const style: React.CSSProperties = {
    padding: '1rem',
    backgroundColor: theme === 'dark' ? '#0a0e1a' : '#f4f6fa',
    color: theme === 'dark' ? '#d4dae3' : '#1a2035',
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
