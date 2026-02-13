import type { GlyphTheme } from '@glyphjs/types';
import { LIGHT_THEME_VARS } from './variables.js';

/**
 * Built-in light theme.
 *
 * Provides all `--glyph-*` CSS variables with values suitable for
 * light backgrounds and dark text. Palette inspired by the Oblivion
 * neon-on-dark design language — cool off-whites, teal accents,
 * generous radii.
 */
export const lightTheme: GlyphTheme = {
  name: 'light',
  variables: LIGHT_THEME_VARS,
};
