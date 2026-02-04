import { createContext, useContext, useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { GlyphTheme, GlyphThemeContext } from '@glyphjs/types';
import { resolveTheme, createResolveVar, isDarkTheme } from './resolve.js';

// ─── Theme Context ─────────────────────────────────────────────

const ThemeContext = createContext<GlyphThemeContext | null>(null);

// ─── Theme Provider ────────────────────────────────────────────

export interface ThemeProviderProps {
  /** A theme shortcut string or a full GlyphTheme object. */
  theme?: 'light' | 'dark' | GlyphTheme;
  /** Optional CSS class name applied to the theme wrapper div. */
  className?: string;
  /** Optional inline styles merged with (and overriding) theme CSS variables. */
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Applies a Glyph theme to its children.
 *
 * Resolves the theme to a full `GlyphTheme` object, then renders a wrapper
 * `<div>` with all `--glyph-*` CSS variables applied as inline styles.
 * Descendants can read theme values via `useGlyphTheme()`.
 */
export function ThemeProvider({
  theme,
  className,
  style: consumerStyle,
  children,
}: ThemeProviderProps): ReactNode {
  const resolved = useMemo(() => resolveTheme(theme), [theme]);

  const themeContext = useMemo<GlyphThemeContext>(
    () => ({
      name: resolved.name,
      resolveVar: createResolveVar(resolved),
      isDark: isDarkTheme(resolved),
    }),
    [resolved],
  );

  // Build the inline style object from the theme variables.
  // Consumer style wins over theme variables for intentional overrides.
  const style = useMemo<Record<string, string>>(
    () => ({ ...resolved.variables, ...(consumerStyle as Record<string, string>) }),
    [resolved, consumerStyle],
  );

  return (
    <ThemeContext value={themeContext}>
      <div data-glyph-theme={resolved.name} className={className} style={style}>
        {children}
      </div>
    </ThemeContext>
  );
}

// ─── Hook ──────────────────────────────────────────────────────

/**
 * Returns the current `GlyphThemeContext`.
 *
 * Must be used inside a `<ThemeProvider>` or the `<RuntimeProvider>`
 * from `createGlyphRuntime()`.
 *
 * @throws if called outside a theme context.
 */
export function useGlyphTheme(): GlyphThemeContext {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error(
      'useGlyphTheme() must be used within a <ThemeProvider> or <RuntimeProvider>. ' +
        'Did you forget to wrap your component tree?',
    );
  }
  return ctx;
}

export { ThemeContext };
