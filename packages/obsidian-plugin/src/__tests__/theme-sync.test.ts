import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LIGHT_THEME_VARS, DARK_THEME_VARS } from '@glyphjs/runtime';
import type { GlyphThemeVarKey } from '@glyphjs/types';

// ─── Mock getComputedStyle ────────────────────────────────────
//
// theme-sync reads CSS custom properties via getComputedStyle(document.body).
// In jsdom, setting properties via element.style.setProperty() makes them
// readable via getComputedStyle(), which is exactly what we need.

function setObsVar(name: string, value: string): void {
  document.body.style.setProperty(name, value);
}

function clearObsVars(): void {
  document.body.removeAttribute('style');
}

// Import after mocks are set up
const { buildObsidianTheme, debugThemeMapping } = await import('../theme-sync.js');

// ─── Helpers ─────────────────────────────────────────────────

const ALL_KEYS: GlyphThemeVarKey[] = Object.keys(LIGHT_THEME_VARS) as GlyphThemeVarKey[];

// ─── Tests ───────────────────────────────────────────────────

describe('buildObsidianTheme', () => {
  beforeEach(() => clearObsVars());
  afterEach(() => clearObsVars());

  // ── Completeness ──────────────────────────────────────────

  describe('completeness', () => {
    it('returns all 53 required Tier 1 keys in light mode', () => {
      const { variables } = buildObsidianTheme(false);
      for (const key of ALL_KEYS) {
        expect(variables).toHaveProperty(key);
        expect((variables as Record<string, string>)[key]).toBeTruthy();
      }
    });

    it('returns all 53 required Tier 1 keys in dark mode', () => {
      const { variables } = buildObsidianTheme(true);
      for (const key of ALL_KEYS) {
        expect(variables).toHaveProperty(key);
        expect((variables as Record<string, string>)[key]).toBeTruthy();
      }
    });

    it('sets name to "obsidian-dark" in dark mode', () => {
      expect(buildObsidianTheme(true).name).toBe('obsidian-dark');
    });

    it('sets name to "obsidian-light" in light mode', () => {
      expect(buildObsidianTheme(false).name).toBe('obsidian-light');
    });
  });

  // ── Fallback to GlyphJS base ──────────────────────────────

  describe('fallback to base', () => {
    it('uses DARK_THEME_VARS defaults when no Obsidian vars are set', () => {
      const { variables } = buildObsidianTheme(true);
      const vars = variables as Record<string, string>;
      // Structural vars always use base
      expect(vars['--glyph-spacing-md']).toBe(DARK_THEME_VARS['--glyph-spacing-md']);
      expect(vars['--glyph-radius-md']).toBe(DARK_THEME_VARS['--glyph-radius-md']);
      expect(vars['--glyph-transition']).toBe(DARK_THEME_VARS['--glyph-transition']);
    });

    it('uses LIGHT_THEME_VARS defaults when no Obsidian vars are set in light mode', () => {
      const { variables } = buildObsidianTheme(false);
      const vars = variables as Record<string, string>;
      expect(vars['--glyph-spacing-md']).toBe(LIGHT_THEME_VARS['--glyph-spacing-md']);
    });
  });

  // ── Core color mappings ───────────────────────────────────

  describe('core color mappings', () => {
    it('maps --background-primary to --glyph-bg', () => {
      setObsVar('--background-primary', '#1a1a1a');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-bg']).toBe('#1a1a1a');
    });

    it('maps --text-normal to --glyph-text', () => {
      setObsVar('--text-normal', '#e0e0e0');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-text']).toBe('#e0e0e0');
    });

    it('maps --text-muted to --glyph-text-muted', () => {
      setObsVar('--text-muted', '#888888');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-text-muted']).toBe('#888888');
    });

    it('maps --background-secondary to --glyph-surface', () => {
      setObsVar('--background-secondary', '#242424');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-surface']).toBe('#242424');
    });

    it('falls back to GlyphJS base when --background-primary is absent', () => {
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-bg']).toBe(
        DARK_THEME_VARS['--glyph-bg'],
      );
    });
  });

  // ── Accent priority ───────────────────────────────────────

  describe('accent: --interactive-accent > --color-accent > base', () => {
    it('prefers --interactive-accent when both are set', () => {
      setObsVar('--interactive-accent', '#ff6600');
      setObsVar('--color-accent', '#9900ff');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-accent']).toBe('#ff6600');
    });

    it('falls back to --color-accent when --interactive-accent is absent', () => {
      setObsVar('--color-accent', '#9900ff');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-accent']).toBe('#9900ff');
    });

    it('falls back to GlyphJS base when both are absent', () => {
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-accent']).toBe(
        DARK_THEME_VARS['--glyph-accent'],
      );
    });
  });

  // ── Palette slot 1 priority ───────────────────────────────

  describe('palette-color-1: --text-accent > --color-cyan > base', () => {
    it('prefers --text-accent when set', () => {
      setObsVar('--text-accent', '#df4a16');
      setObsVar('--color-cyan', '#00ffff');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-palette-color-1']).toBe('#df4a16');
    });

    it('falls back to --color-cyan when --text-accent is absent', () => {
      setObsVar('--color-cyan', '#53dfdd');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-palette-color-1']).toBe('#53dfdd');
    });

    it('falls back to GlyphJS base when both are absent', () => {
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-palette-color-1']).toBe(
        DARK_THEME_VARS['--glyph-palette-color-1'],
      );
    });
  });

  // ── Palette slot 2 priority ───────────────────────────────

  describe('palette-color-2: --accent-mild > --color-purple > base', () => {
    it('prefers --accent-mild when set', () => {
      setObsVar('--accent-mild', '#e6b64f');
      setObsVar('--color-purple', '#a882ff');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-palette-color-2']).toBe('#e6b64f');
    });

    it('falls back to --color-purple when --accent-mild is absent', () => {
      setObsVar('--color-purple', '#a882ff');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-palette-color-2']).toBe('#a882ff');
    });
  });

  // ── Palette slot 4 priority ───────────────────────────────

  describe('palette-color-4: --accent-strong > --color-pink > base', () => {
    it('prefers --accent-strong when set', () => {
      setObsVar('--accent-strong', '#ec0d0d');
      setObsVar('--color-pink', '#fa99cd');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-palette-color-4']).toBe('#ec0d0d');
    });

    it('falls back to --color-pink when --accent-strong is absent', () => {
      setObsVar('--color-pink', '#fa99cd');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-palette-color-4']).toBe('#fa99cd');
    });
  });

  // ── Semantic state fallback chains ────────────────────────

  describe('color-error: --text-error > --color-red > base', () => {
    it('prefers --text-error when set', () => {
      setObsVar('--text-error', '#ff3333');
      setObsVar('--color-red', '#fb464c');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-color-error']).toBe('#ff3333');
    });

    it('falls back to --color-red when --text-error is absent', () => {
      setObsVar('--color-red', '#fb464c');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-color-error']).toBe('#fb464c');
    });

    it('falls back to GlyphJS base when both absent', () => {
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-color-error']).toBe(
        DARK_THEME_VARS['--glyph-color-error'],
      );
    });
  });

  describe('color-warning: --color-orange > --color-yellow > --accent-mild > base', () => {
    it('prefers --color-orange when set', () => {
      setObsVar('--color-orange', '#e9973f');
      setObsVar('--color-yellow', '#e0de71');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-color-warning']).toBe('#e9973f');
    });

    it('falls back to --color-yellow when --color-orange is absent', () => {
      setObsVar('--color-yellow', '#e0de71');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-color-warning']).toBe('#e0de71');
    });

    it('falls back to --accent-mild when both orange and yellow are absent', () => {
      setObsVar('--accent-mild', '#e6b64f');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-color-warning']).toBe('#e6b64f');
    });
  });

  // ── Tooltip ───────────────────────────────────────────────

  describe('tooltip-bg: --tooltip-bg > --background-secondary-alt > base', () => {
    it('prefers --tooltip-bg when set', () => {
      setObsVar('--tooltip-bg', 'rgba(223,74,22,0.9)');
      setObsVar('--background-secondary-alt', '#2c2c2c');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-tooltip-bg']).toBe(
        'rgba(223,74,22,0.9)',
      );
    });

    it('falls back to --background-secondary-alt when --tooltip-bg absent', () => {
      setObsVar('--background-secondary-alt', '#2c2c2c');
      const { variables } = buildObsidianTheme(true);
      expect((variables as Record<string, string>)['--glyph-tooltip-bg']).toBe('#2c2c2c');
    });
  });
});

// ─── debugThemeMapping ────────────────────────────────────────

describe('debugThemeMapping', () => {
  beforeEach(() => clearObsVars());
  afterEach(() => {
    clearObsVars();
    vi.restoreAllMocks();
  });

  it('logs changed vars and suppresses unchanged ones', () => {
    setObsVar('--text-normal', '#aabbcc');

    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    debugThemeMapping(true);

    expect(groupSpy).toHaveBeenCalledWith('[GlyphJS] Theme mapping debug');
    expect(groupEndSpy).toHaveBeenCalled();

    // At least one log line should mention --glyph-text with the new value
    const calls = logSpy.mock.calls.map((c) => String(c[0]));
    const textEntry = calls.find((c) => c.includes('--glyph-text'));
    expect(textEntry).toContain('#aabbcc');
  });

  it('logs nothing for vars that match the base defaults', () => {
    // No Obsidian vars set — everything falls back to base, nothing should be logged
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    debugThemeMapping(true);

    // Only the "Mode:" line should appear — no variable change lines
    const varLines = logSpy.mock.calls.filter((c) => String(c[0]).includes('--glyph-'));
    expect(varLines).toHaveLength(0);
  });
});
