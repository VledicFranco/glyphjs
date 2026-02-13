import { themeVarsToCSS, LIGHT_THEME_VARS, DARK_THEME_VARS } from '@glyphjs/runtime';
import type { ThemeName } from './ssr.js';

export interface HtmlTemplateOptions {
  /** The SSR-rendered HTML content to embed in the body. */
  body: string;
  /** Theme to apply. Defaults to 'light'. */
  theme?: ThemeName;
  /** Optional page title. */
  title?: string;
  /** Optional inline client-side JavaScript bundle. */
  clientBundle?: string;
}

/**
 * Build a complete HTML5 page that embeds SSR-rendered Glyph content
 * with theme CSS variables injected as inline styles on the root container.
 */
export function buildHtmlTemplate(options: HtmlTemplateOptions): string {
  const { body, theme = 'light', title = 'GlyphJS Render', clientBundle } = options;

  const vars = theme === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS;
  const cssVars = themeVarsToCSS(vars);

  const bgColor = vars['--glyph-bg'] ?? '#fff';
  const textColor = vars['--glyph-text'] ?? '#000';

  const scriptTag = clientBundle ? `<script type="module">${clientBundle}</script>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${bgColor}; color: ${textColor}; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="glyph-root" style="${escapeAttr(cssVars)}">
    ${body}
  </div>
  ${scriptTag}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
