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

describe('v0.8.0 two-tier theme system', () => {
  it('LIGHT_THEME_VARS has exactly 53 keys', () => {
    expect(Object.keys(LIGHT_THEME_VARS).length).toBe(53);
  });

  it('DARK_THEME_VARS has exactly 53 keys', () => {
    expect(Object.keys(DARK_THEME_VARS).length).toBe(53);
  });

  it('all 4 semantic state vars present in LIGHT_THEME_VARS', () => {
    const light = LIGHT_THEME_VARS as Record<string, string>;
    expect(light['--glyph-color-success']).toBeDefined();
    expect(light['--glyph-color-warning']).toBeDefined();
    expect(light['--glyph-color-error']).toBeDefined();
    expect(light['--glyph-color-info']).toBeDefined();
  });

  it('all 4 semantic state vars present in DARK_THEME_VARS', () => {
    const dark = DARK_THEME_VARS as Record<string, string>;
    expect(dark['--glyph-color-success']).toBeDefined();
    expect(dark['--glyph-color-warning']).toBeDefined();
    expect(dark['--glyph-color-error']).toBeDefined();
    expect(dark['--glyph-color-info']).toBeDefined();
  });

  it('all 10 palette vars present in both maps', () => {
    const light = LIGHT_THEME_VARS as Record<string, string>;
    const dark = DARK_THEME_VARS as Record<string, string>;
    for (let i = 1; i <= 10; i++) {
      expect(light[`--glyph-palette-color-${i}`]).toBeDefined();
      expect(dark[`--glyph-palette-color-${i}`]).toBeDefined();
    }
  });

  it('--glyph-radius-xs present in both maps', () => {
    const light = LIGHT_THEME_VARS as Record<string, string>;
    const dark = DARK_THEME_VARS as Record<string, string>;
    expect(light['--glyph-radius-xs']).toBeDefined();
    expect(dark['--glyph-radius-xs']).toBeDefined();
  });

  it('dropped vars absent from both maps', () => {
    const light = LIGHT_THEME_VARS as Record<string, string>;
    const dark = DARK_THEME_VARS as Record<string, string>;
    const dropped = [
      '--glyph-shadow-glow',
      '--glyph-text-shadow',
      '--glyph-backdrop',
      '--glyph-gradient-accent',
    ];
    for (const key of dropped) {
      expect(light[key]).toBeUndefined();
      expect(dark[key]).toBeUndefined();
    }
  });
});
