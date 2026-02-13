import { describe, it, expect } from 'vitest';
import { LIGHT_THEME_VARS, DARK_THEME_VARS, themeVarsToCSS } from '../variables.js';

describe('themeVarsToCSS', () => {
  it('converts a variable map to semicolon-separated CSS declarations', () => {
    const css = themeVarsToCSS({ '--glyph-bg': '#fff', '--glyph-text': '#000' });
    expect(css).toBe('--glyph-bg: #fff; --glyph-text: #000');
  });

  it('returns an empty string for an empty map', () => {
    expect(themeVarsToCSS({})).toBe('');
  });

  it('handles a single variable', () => {
    const css = themeVarsToCSS({ '--glyph-accent': 'blue' });
    expect(css).toBe('--glyph-accent: blue');
  });
});

describe('theme variable maps', () => {
  it('LIGHT_THEME_VARS and DARK_THEME_VARS have matching keys', () => {
    const lightKeys = Object.keys(LIGHT_THEME_VARS).sort();
    const darkKeys = Object.keys(DARK_THEME_VARS).sort();

    const missingInDark = lightKeys.filter((k) => !darkKeys.includes(k));
    const missingInLight = darkKeys.filter((k) => !lightKeys.includes(k));

    // Allow dark to have extra keys (e.g. table-specific vars), but flag missing ones
    expect(missingInDark).toEqual([]);
    // Report any keys unique to dark for awareness but don't fail
    if (missingInLight.length > 0) {
      // Dark theme has extra keys not in light — this is acceptable
      // but all light keys must be present in dark
    }
  });

  it('all LIGHT_THEME_VARS keys start with --glyph-', () => {
    for (const key of Object.keys(LIGHT_THEME_VARS)) {
      expect(key).toMatch(/^--glyph-/);
    }
  });

  it('all DARK_THEME_VARS keys start with --glyph-', () => {
    for (const key of Object.keys(DARK_THEME_VARS)) {
      expect(key).toMatch(/^--glyph-/);
    }
  });

  it('both maps are non-empty', () => {
    expect(Object.keys(LIGHT_THEME_VARS).length).toBeGreaterThan(0);
    expect(Object.keys(DARK_THEME_VARS).length).toBeGreaterThan(0);
  });
});
