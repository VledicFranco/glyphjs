// Built-in themes
export { lightTheme } from './light.js';
export { darkTheme } from './dark.js';

// Theme resolution utilities
export {
  resolveTheme,
  mergeThemeDefaults,
  createResolveVar,
  isDarkTheme,
} from './resolve.js';

// React context and hook
export { ThemeProvider, useGlyphTheme } from './context.js';
export type { ThemeProviderProps } from './context.js';
