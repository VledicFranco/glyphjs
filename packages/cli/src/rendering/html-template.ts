import { themeVarsToCSS, LIGHT_THEME_VARS, DARK_THEME_VARS } from '@glyphjs/runtime';
import type { GlyphIR } from '@glyphjs/types';
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
  /** Optional IR to embed as JSON for client hydration. */
  ir?: GlyphIR;
  /** Optional pre-resolved theme CSS variables. When provided, overrides the built-in theme lookup. */
  themeVars?: Record<string, string>;
}

/**
 * Build a complete HTML5 page that embeds SSR-rendered Glyph content
 * with theme CSS variables injected as inline styles on the root container.
 */
export function buildHtmlTemplate(options: HtmlTemplateOptions): string {
  const { body, theme = 'light', title = 'GlyphJS Render', clientBundle, ir, themeVars } = options;

  const vars = themeVars ?? (theme === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS);
  const cssVars = themeVarsToCSS(vars);

  const bgColor = vars['--glyph-bg'] ?? '#fff';
  const textColor = vars['--glyph-text'] ?? '#000';

  const irTag = ir
    ? `<script id="glyph-ir-data" type="application/json">${escapeScriptContent(JSON.stringify(ir))}</script>`
    : '';

  const themeVarsTag = themeVars
    ? `<script id="glyph-theme-vars" type="application/json">${escapeScriptContent(JSON.stringify(themeVars))}</script>`
    : '';

  const scriptTag = clientBundle ? `<script>${clientBundle}</script>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${bgColor};
      color: ${textColor};
      font-family: 'Inter', var(--glyph-font-body, system-ui, sans-serif);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Force blocks visible in static/print context (no IntersectionObserver) */
    [data-glyph-block-anim] { opacity: 1 !important; transform: none !important; }

    /* ── Prose styling ─────────────────────────────────── */
    #glyph-root {
      max-width: 52rem;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      line-height: 1.7;
    }

    #glyph-root h1 {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--glyph-heading, ${textColor});
      margin: 0 0 0.75em;
      line-height: 1.2;
    }
    #glyph-root h2 {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--glyph-heading, ${textColor});
      margin: 1.5em 0 0.5em;
      line-height: 1.3;
    }
    #glyph-root h3 {
      font-size: 1.375rem;
      font-weight: 600;
      color: var(--glyph-heading, ${textColor});
      margin: 1.25em 0 0.5em;
      line-height: 1.4;
    }
    #glyph-root h4 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--glyph-heading, ${textColor});
      margin: 1em 0 0.4em;
    }
    #glyph-root h5, #glyph-root h6 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--glyph-heading, ${textColor});
      margin: 1em 0 0.4em;
    }
    #glyph-root p {
      margin-bottom: 1em;
    }
    #glyph-root ul, #glyph-root ol {
      padding-left: 1.5em;
      margin-bottom: 1em;
    }
    #glyph-root li {
      margin-bottom: 0.25em;
    }
    #glyph-root blockquote {
      border-left: 3px solid var(--glyph-accent, #0a9d7c);
      background: var(--glyph-blockquote-bg, rgba(10, 157, 124, 0.06));
      padding: 0.75em 1em;
      margin: 0 0 1em;
      border-radius: 0 6px 6px 0;
    }
    #glyph-root code {
      font-family: var(--glyph-font-mono, 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace);
      background: var(--glyph-code-bg, rgba(0, 0, 0, 0.06));
      padding: 0.15em 0.35em;
      border-radius: 4px;
      font-size: 0.875em;
    }
    #glyph-root pre {
      background: var(--glyph-code-bg, rgba(0, 0, 0, 0.06));
      padding: 1em;
      overflow-x: auto;
      border-radius: 8px;
      margin-bottom: 1em;
    }
    #glyph-root pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-size: 0.85em;
    }
    #glyph-root a {
      color: var(--glyph-link, #0a9d7c);
      text-decoration: none;
    }
    #glyph-root a:hover {
      text-decoration: underline;
    }
    #glyph-root hr {
      border: none;
      border-top: 1px solid var(--glyph-border, rgba(0, 0, 0, 0.1));
      margin: 1.5em 0;
    }
    #glyph-root img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    #glyph-root table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1em;
    }
    #glyph-root th, #glyph-root td {
      padding: 0.5em 0.75em;
      text-align: left;
      border-bottom: 1px solid var(--glyph-border, rgba(0, 0, 0, 0.1));
    }
    #glyph-root th {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div id="glyph-root" data-glyph-theme="${theme}" style="${escapeAttr(cssVars)}">
    ${body}
  </div>
  ${irTag}
  ${themeVarsTag}
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

/** Escape `</script>` sequences inside inline script content. */
function escapeScriptContent(str: string): string {
  return str.replace(/<\/(script)/gi, '<\\/$1');
}
