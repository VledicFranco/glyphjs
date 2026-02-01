import type { GlyphTheme } from '@glyphjs/types';
import { lightTheme } from './light.js';
import { darkTheme } from './dark.js';

/**
 * Resolves a theme value — either a string shortcut (`'light'` / `'dark'`)
 * or a full `GlyphTheme` object — into a concrete `GlyphTheme`.
 *
 * When `undefined` is passed, defaults to the light theme.
 */
export function resolveTheme(
  theme: 'light' | 'dark' | GlyphTheme | undefined,
): GlyphTheme {
  if (!theme || theme === 'light') {
    return lightTheme;
  }
  if (theme === 'dark') {
    return darkTheme;
  }
  return theme;
}

/**
 * Merges component-specific theme defaults into a theme's variable map.
 *
 * Variables already present in `theme.variables` take precedence. Only
 * keys from `defaults` that are absent in the theme are added.
 *
 * Returns a new theme object — the original is not mutated.
 */
export function mergeThemeDefaults(
  theme: GlyphTheme,
  defaults: Record<string, string>,
): GlyphTheme {
  return {
    ...theme,
    variables: { ...defaults, ...theme.variables },
  };
}

/**
 * Creates a `resolveVar` function bound to a given theme.
 *
 * The returned function takes a CSS variable name (e.g. `'--glyph-bg'`) and
 * returns the value defined in the theme, or an empty string if the variable
 * is not present.
 */
export function createResolveVar(
  theme: GlyphTheme,
): (varName: string) => string {
  return (varName: string): string => theme.variables[varName] ?? '';
}

/**
 * Heuristic check for whether a theme is a "dark" theme.
 *
 * Inspects the `--glyph-bg` variable: if its perceived luminance is below
 * the midpoint it is considered dark. Falls back to checking whether the
 * theme name contains the substring "dark" (case-insensitive).
 */
export function isDarkTheme(theme: GlyphTheme): boolean {
  const bg = theme.variables['--glyph-bg'];
  if (bg) {
    const luminance = perceivedLuminance(bg);
    if (luminance !== null) {
      return luminance < 0.5;
    }
  }
  // Fallback: name-based heuristic
  return theme.name.toLowerCase().includes('dark');
}

// ─── Internal helpers ────────────────────────────────────────────

/**
 * Parse a hex colour string (#rgb or #rrggbb) and return its perceived
 * relative luminance in the 0–1 range. Returns `null` for unparseable values.
 */
function perceivedLuminance(hex: string): number | null {
  const trimmed = hex.trim();
  if (!trimmed.startsWith('#')) return null;

  let r: number;
  let g: number;
  let b: number;

  if (trimmed.length === 4) {
    // #rgb — expand each hex digit, e.g. #abc → #aabbcc
    const rChar = trimmed.charAt(1);
    const gChar = trimmed.charAt(2);
    const bChar = trimmed.charAt(3);
    r = parseInt(rChar + rChar, 16);
    g = parseInt(gChar + gChar, 16);
    b = parseInt(bChar + bChar, 16);
  } else if (trimmed.length === 7) {
    // #rrggbb
    r = parseInt(trimmed.slice(1, 3), 16);
    g = parseInt(trimmed.slice(3, 5), 16);
    b = parseInt(trimmed.slice(5, 7), 16);
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  // Relative luminance (ITU-R BT.709)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
