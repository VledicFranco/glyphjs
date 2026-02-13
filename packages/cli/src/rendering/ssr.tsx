import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createGlyphRuntime, LIGHT_THEME_VARS, DARK_THEME_VARS } from '@glyphjs/runtime';
import { allComponentDefinitions } from '@glyphjs/components';
import type { Block, GlyphIR, GlyphTheme, GlyphComponentDefinition } from '@glyphjs/types';

export type ThemeName = 'light' | 'dark';

/**
 * Render a single IR block to an HTML string.
 */
export function renderBlockToHTML(
  block: Block,
  theme: ThemeName = 'light',
  themeVars?: Record<string, string>,
): string {
  const singleBlockIR: GlyphIR = {
    version: '1.0.0',
    id: 'cli-render',
    metadata: {},
    blocks: [block],
    references: [],
    layout: { mode: 'document', spacing: 'normal' },
  };

  return renderDocumentToHTML(singleBlockIR, theme, themeVars);
}

/**
 * Render a full IR document to an HTML string.
 */
export function renderDocumentToHTML(
  ir: GlyphIR,
  theme: ThemeName = 'light',
  themeVars?: Record<string, string>,
): string {
  const themeObj: GlyphTheme = {
    name: theme,
    variables: themeVars ?? (theme === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS),
  };

  const runtime = createGlyphRuntime({
    components: [...allComponentDefinitions] as GlyphComponentDefinition[],
    theme: themeObj,
  });

  const { GlyphDocument } = runtime;

  // Use createElement instead of JSX to avoid type incompatibility between
  // @glyphjs/types ComponentType and React's JSX element types.
  return renderToString(
    createElement(GlyphDocument as React.ComponentType<{ ir: GlyphIR }>, { ir }),
  );
}
