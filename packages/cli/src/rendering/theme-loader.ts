import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import { LIGHT_THEME_VARS, DARK_THEME_VARS } from '@glyphjs/runtime';
import type { ThemeName } from './ssr.js';

export interface ThemeFileData {
  base: ThemeName;
  overrides: Record<string, string>;
}

/**
 * Load and validate a YAML theme file.
 *
 * Expected format:
 * ```yaml
 * base: light          # optional, defaults to "light"
 * variables:
 *   --glyph-bg: "#ffffff"
 *   --glyph-accent: "#F56400"
 * ```
 */
export async function loadThemeFile(filePath: string): Promise<ThemeFileData> {
  const raw = await readFile(filePath, 'utf-8');
  const parsed: unknown = parseYaml(raw);

  if (parsed == null || typeof parsed !== 'object') {
    throw new Error(`Invalid theme file: expected a YAML object, got ${typeof parsed}`);
  }

  const doc = parsed as Record<string, unknown>;

  // Validate base
  const base = doc['base'] ?? 'light';
  if (base !== 'light' && base !== 'dark') {
    throw new Error(`Invalid theme base: "${String(base)}". Must be "light" or "dark".`);
  }

  // Validate variables
  const variables = doc['variables'] ?? {};
  if (typeof variables !== 'object' || variables == null || Array.isArray(variables)) {
    throw new Error('Invalid theme file: "variables" must be an object.');
  }

  const overrides: Record<string, string> = {};
  for (const [key, value] of Object.entries(variables as Record<string, unknown>)) {
    if (typeof value !== 'string') {
      throw new Error(
        `Invalid theme variable "${key}": value must be a string, got ${typeof value}.`,
      );
    }
    overrides[key] = value;
  }

  return { base: base as ThemeName, overrides };
}

/**
 * Resolve a full set of theme CSS variables by merging overrides on top of a base theme.
 */
export function resolveThemeVars(
  base: ThemeName,
  overrides: Record<string, string>,
): Record<string, string> {
  const baseVars = base === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS;
  return { ...baseVars, ...overrides };
}
