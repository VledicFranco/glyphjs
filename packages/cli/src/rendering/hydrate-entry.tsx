import { createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createGlyphRuntime, LIGHT_THEME_VARS, DARK_THEME_VARS } from '@glyphjs/runtime';
import { allComponentDefinitions } from '@glyphjs/components';
import type { GlyphIR, GlyphTheme, GlyphComponentDefinition } from '@glyphjs/types';

/**
 * Client-side hydration entry point for CLI exports.
 *
 * This IIFE bundle is embedded in exported HTML pages so that components
 * relying on useEffect (Chart / Architecture with D3 / ELK.js) render
 * correctly when captured by Playwright.
 */
const rootEl = document.getElementById('glyph-root');
const irScript = document.getElementById('glyph-ir-data');

if (rootEl && irScript) {
  const ir: GlyphIR = JSON.parse(irScript.textContent ?? '{}');
  const themeName = rootEl.getAttribute('data-glyph-theme') === 'dark' ? 'dark' : 'light';

  // Use custom theme vars from embedded JSON if present, otherwise fall back to built-in theme
  const customVarsScript = document.getElementById('glyph-theme-vars');
  const customVars: Record<string, string> | null = customVarsScript
    ? (JSON.parse(customVarsScript.textContent ?? '{}') as Record<string, string>)
    : null;

  const themeObj: GlyphTheme = {
    name: themeName,
    variables: customVars ?? (themeName === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS),
  };

  const runtime = createGlyphRuntime({
    components: [...allComponentDefinitions] as GlyphComponentDefinition[],
    theme: themeObj,
  });

  const { GlyphDocument } = runtime;

  hydrateRoot(rootEl, createElement(GlyphDocument as React.ComponentType<{ ir: GlyphIR }>, { ir }));
}
