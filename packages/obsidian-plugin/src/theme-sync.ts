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
    '--glyph-accent': obs('--color-accent', '--glyph-accent'),
    '--glyph-accent-hover': obs('--color-accent-1', '--glyph-accent-hover'),
    '--glyph-accent-subtle': obs('--background-modifier-hover', '--glyph-accent-subtle'),
    '--glyph-accent-muted': d('--glyph-accent-muted'), // no Obsidian equivalent
    '--glyph-text-on-accent': d('--glyph-text-on-accent'), // keep white/dark contrast text

    // ── Code ───────────────────────────────────────────────────────
    '--glyph-code-bg': obs('--code-background', '--glyph-code-bg'),
    '--glyph-code-text': obs('--code-normal', '--glyph-code-text'),

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
    '--glyph-color-warning': obs('--color-orange', '--glyph-color-warning'),
    '--glyph-color-error': obs('--color-red', '--glyph-color-error'),
    '--glyph-color-info': obs('--color-blue', '--glyph-color-info'),

    // ── Shared palette ──────────────────────────────────────────────
    '--glyph-palette-color-1': obs('--color-cyan', '--glyph-palette-color-1'),
    '--glyph-palette-color-2': obs('--color-purple', '--glyph-palette-color-2'),
    '--glyph-palette-color-3': obs('--color-green', '--glyph-palette-color-3'),
    '--glyph-palette-color-4': obs('--color-pink', '--glyph-palette-color-4'),
    '--glyph-palette-color-5': obs('--color-cyan', '--glyph-palette-color-5'),
    '--glyph-palette-color-6': obs('--color-yellow', '--glyph-palette-color-6'),
    '--glyph-palette-color-7': obs('--color-orange', '--glyph-palette-color-7'),
    '--glyph-palette-color-8': obs('--color-red', '--glyph-palette-color-8'),
    '--glyph-palette-color-9': obs('--color-purple', '--glyph-palette-color-9'),
    '--glyph-palette-color-10': obs('--color-blue', '--glyph-palette-color-10'),

    // ── Misc ───────────────────────────────────────────────────────
    '--glyph-tooltip-bg': obs('--background-secondary-alt', '--glyph-tooltip-bg'),
    '--glyph-tooltip-text': obs('--text-normal', '--glyph-tooltip-text'),
    '--glyph-rating-star-fill': obs('--color-yellow', '--glyph-rating-star-fill'),
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
