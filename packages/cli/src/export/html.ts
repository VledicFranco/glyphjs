import type { GlyphIR } from '@glyphjs/types';
import { renderDocumentToHTML, type ThemeName } from '../rendering/ssr.js';
import { buildHtmlTemplate } from '../rendering/html-template.js';

export interface ExportHTMLOptions {
  theme?: ThemeName;
  title?: string;
  themeVars?: Record<string, string>;
}

/**
 * Export a compiled IR document to a self-contained HTML string.
 * SSR-only — no client-side JavaScript is included.
 */
export function exportHTML(ir: GlyphIR, options: ExportHTMLOptions = {}): string {
  const { theme = 'light', title, themeVars } = options;

  const body = renderDocumentToHTML(ir, theme, themeVars);

  const pageTitle = title ?? (ir.metadata?.title as string | undefined) ?? 'GlyphJS Export';

  return buildHtmlTemplate({ body, theme, title: pageTitle, themeVars });
}
