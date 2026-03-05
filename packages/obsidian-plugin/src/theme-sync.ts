import { LIGHT_THEME_VARS, DARK_THEME_VARS } from '@glyphjs/runtime';
import type { GlyphTheme, GlyphThemeVarKey, GlyphThemeVars } from '@glyphjs/types';

/**
 * Reads a single Obsidian CSS custom property from the document body.
 * Returns an empty string if the variable is not set.
 */
function obsVar(name: string): string {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

/**
 * Builds a GlyphTheme whose variables are derived from Obsidian's CSS
 * custom properties, so GlyphJS components blend with whatever theme
 * is active in the vault.
 *
 * Strategy:
 * - Every GlyphThemeVarKey must be explicitly present (enforced by TypeScript).
 * - `obs(obsName, key)` — use Obsidian's value, fall back to GlyphJS default.
 * - `d(key)` — explicitly keep the GlyphJS default; documents the intent.
 */
export function buildObsidianTheme(isDark: boolean): GlyphTheme {
  const base = isDark ? DARK_THEME_VARS : LIGHT_THEME_VARS;

  // Use Obsidian value if non-empty, fall back to GlyphJS default.
  function obs(obsName: string, key: GlyphThemeVarKey): string {
    return obsVar(obsName) || base[key];
  }

  // Explicitly keep the GlyphJS default — documents intentional non-mapping.
  function d(key: GlyphThemeVarKey): string {
    return base[key];
  }

  const variables: GlyphThemeVars = {
    // ── Core colors ────────────────────────────────────────────────
    '--glyph-bg': obs('--background-primary', '--glyph-bg'),
    '--glyph-text': obs('--text-normal', '--glyph-text'),
    '--glyph-text-muted': obs('--text-muted', '--glyph-text-muted'),
    '--glyph-heading': obs('--text-normal', '--glyph-heading'),
    '--glyph-link': obs('--text-accent', '--glyph-link'),
    '--glyph-link-hover': obs('--text-accent-hover', '--glyph-link-hover'),
    '--glyph-border': obs('--background-modifier-border', '--glyph-border'),
    '--glyph-border-strong': obs('--background-modifier-border-focus', '--glyph-border-strong'),
    '--glyph-surface': obs('--background-secondary', '--glyph-surface'),
    '--glyph-surface-raised': obs('--background-secondary-alt', '--glyph-surface-raised'),

    // ── Accent ─────────────────────────────────────────────────────
    // --interactive-accent is overridden by themes like Obuntu (orange);
    // --color-accent is the global user accent setting and may differ from the theme aesthetic.
    '--glyph-accent':
      obsVar('--interactive-accent') || obsVar('--color-accent') || base['--glyph-accent'],
    '--glyph-accent-hover': obs('--text-accent-hover', '--glyph-accent-hover'),
    '--glyph-accent-subtle': obs('--background-modifier-hover', '--glyph-accent-subtle'),
    '--glyph-accent-muted': d('--glyph-accent-muted'), // no Obsidian equivalent
    '--glyph-text-on-accent': obs('--text-on-accent', '--glyph-text-on-accent'),

    // ── Code ───────────────────────────────────────────────────────
    '--glyph-code-bg': obs('--code-background', '--glyph-code-bg'),
    '--glyph-code-text': obs('--code-normal', '--glyph-code-text'),
    // Obsidian doesn't expose per-token CSS vars; keep GlyphJS defaults
    '--glyph-code-token-keyword': d('--glyph-code-token-keyword'),
    '--glyph-code-token-string': d('--glyph-code-token-string'),
    '--glyph-code-token-comment': d('--glyph-code-token-comment'),
    '--glyph-code-token-number': d('--glyph-code-token-number'),
    '--glyph-code-token-function': d('--glyph-code-token-function'),
    '--glyph-code-token-type': d('--glyph-code-token-type'),
    '--glyph-code-token-builtin': d('--glyph-code-token-builtin'),
    '--glyph-code-token-attr': d('--glyph-code-token-attr'),
    '--glyph-code-token-literal': d('--glyph-code-token-literal'),
    '--glyph-code-token-operator': d('--glyph-code-token-operator'),
    '--glyph-code-token-variable': d('--glyph-code-token-variable'),
    '--glyph-code-token-regexp': d('--glyph-code-token-regexp'),
    '--glyph-code-token-meta': d('--glyph-code-token-meta'),

    // ── Typography ─────────────────────────────────────────────────
    '--glyph-font-body': obs('--font-text', '--glyph-font-body'),
    '--glyph-font-heading': obs('--font-text', '--glyph-font-heading'),
    '--glyph-font-mono': obs('--font-monospace', '--glyph-font-mono'),

    // ── Spacing — structural, keep GlyphJS defaults ─────────────────
    '--glyph-spacing-xs': d('--glyph-spacing-xs'),
    '--glyph-spacing-sm': d('--glyph-spacing-sm'),
    '--glyph-spacing-md': d('--glyph-spacing-md'),
    '--glyph-spacing-lg': d('--glyph-spacing-lg'),
    '--glyph-spacing-xl': d('--glyph-spacing-xl'),

    // ── Border radius — structural ──────────────────────────────────
    '--glyph-radius-xs': d('--glyph-radius-xs'),
    '--glyph-radius-sm': d('--glyph-radius-sm'),
    '--glyph-radius-md': d('--glyph-radius-md'),
    '--glyph-radius-lg': d('--glyph-radius-lg'),

    // ── Effects — structural ────────────────────────────────────────
    '--glyph-shadow-sm': d('--glyph-shadow-sm'),
    '--glyph-shadow-md': d('--glyph-shadow-md'),
    '--glyph-shadow-lg': d('--glyph-shadow-lg'),
    '--glyph-transition': d('--glyph-transition'),
    '--glyph-opacity-muted': d('--glyph-opacity-muted'),
    '--glyph-opacity-disabled': d('--glyph-opacity-disabled'),
    '--glyph-focus-ring': d('--glyph-focus-ring'), // full box-shadow string, no Obsidian equiv

    // ── Semantic states ─────────────────────────────────────────────
    '--glyph-color-success': obs('--color-green', '--glyph-color-success'),
    // --accent-mild is Obuntu's gold; standard themes use --color-orange or --color-yellow
    '--glyph-color-warning':
      obsVar('--color-orange') ||
      obsVar('--color-yellow') ||
      obsVar('--accent-mild') ||
      base['--glyph-color-warning'],
    // --text-error is defined by most themes; --color-red as secondary
    '--glyph-color-error':
      obsVar('--text-error') || obsVar('--color-red') || base['--glyph-color-error'],
    '--glyph-color-info': obs('--color-blue', '--glyph-color-info'),

    // ── Shared palette ──────────────────────────────────────────────
    // Obsidian's base CSS always defines --color-cyan/purple/etc., so those always resolve —
    // but they reflect the global system palette (cyan+purple), not the active theme's aesthetic.
    // For prominent slots (1–5) we prioritise Obuntu-specific vars first so charts/graphs adopt
    // the theme's warm orange/gold palette. Slots 6–10 use the global --color-* for variety.
    '--glyph-palette-color-1':
      obsVar('--text-accent') || obsVar('--color-cyan') || base['--glyph-palette-color-1'],
    '--glyph-palette-color-2':
      obsVar('--accent-mild') || obsVar('--color-purple') || base['--glyph-palette-color-2'],
    '--glyph-palette-color-3': obsVar('--color-green') || base['--glyph-palette-color-3'],
    '--glyph-palette-color-4':
      obsVar('--accent-strong') || obsVar('--color-pink') || base['--glyph-palette-color-4'],
    '--glyph-palette-color-5':
      obsVar('--text-accent-hover') || obsVar('--color-orange') || base['--glyph-palette-color-5'],
    '--glyph-palette-color-6': obsVar('--color-yellow') || base['--glyph-palette-color-6'],
    '--glyph-palette-color-7': obsVar('--color-red') || base['--glyph-palette-color-7'],
    '--glyph-palette-color-8': obsVar('--color-orange') || base['--glyph-palette-color-8'],
    '--glyph-palette-color-9': obsVar('--color-blue') || base['--glyph-palette-color-9'],
    '--glyph-palette-color-10':
      obsVar('--color-purple') || obsVar('--color-cyan') || base['--glyph-palette-color-10'],

    // ── Misc ───────────────────────────────────────────────────────
    // --tooltip-bg is defined by Obuntu (orange rgba) and some other themes; fall back to surface
    '--glyph-tooltip-bg':
      obsVar('--tooltip-bg') || obsVar('--background-secondary-alt') || base['--glyph-tooltip-bg'],
    '--glyph-tooltip-text': obs('--text-on-accent', '--glyph-tooltip-text'),
    '--glyph-rating-star-fill':
      obsVar('--color-yellow') || obsVar('--accent-mild') || base['--glyph-rating-star-fill'],
  };

  return {
    name: isDark ? 'obsidian-dark' : 'obsidian-light',
    variables,
  };
}

/**
 * Logs all changed GlyphJS variables (Obsidian value vs built-in default)
 * to the DevTools console. Useful for verifying theme coverage.
 */
export function debugThemeMapping(isDark: boolean): void {
  const theme = buildObsidianTheme(isDark);
  const base = isDark ? DARK_THEME_VARS : LIGHT_THEME_VARS;

  console.group('[GlyphJS] Theme mapping debug');
  console.log('Mode:', isDark ? 'dark' : 'light');

  for (const [key, value] of Object.entries(theme.variables)) {
    const defaultVal = base[key as GlyphThemeVarKey];
    if (value !== defaultVal) {
      console.log(`%c${key}: ${value}  (was: ${defaultVal})`, 'color: #0a9d7c');
    }
  }

  console.groupEnd();
}
