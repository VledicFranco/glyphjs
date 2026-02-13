import type { GlyphTheme } from '@glyphjs/types';
import { DARK_THEME_VARS } from './variables.js';

/**
 * Built-in dark theme.
 *
 * Provides all `--glyph-*` CSS variables with values suitable for
 * dark backgrounds and light text. Palette inspired by the Oblivion
 * neon-on-dark design language — deep navy blacks, neon cyan-green
 * accents, generous radii.
 */
export const darkTheme: GlyphTheme = {
  name: 'dark',
  variables: DARK_THEME_VARS,
};
