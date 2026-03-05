export interface PdfExportOptions {
  theme?: 'light' | 'dark';
  title?: string;
  width?: number;
  /** Viewport height in pixels for the PDF layout phase. Defaults to 1024. */
  viewportHeight?: number;
  /** CSS max-width on the content column. Pass 'none' to fill full viewport width. Defaults to '64rem'. */
  maxWidth?: string;
  pageSize?: string;
  margin?: string;
  landscape?: boolean;
  themeVars?: Record<string, string>;
  /**
   * Render as a single continuous page with no page breaks.
   * The PDF height is measured from the rendered content rather than a fixed paper size.
   * Useful for GlyphJS documents where components must not be split across pages.
   */
  continuous?: boolean;
  /**
   * Inner padding of the document content area, as a CSS shorthand string.
   * Applied to the root container. Defaults to '2rem 1.5rem'.
   */
  padding?: string;
}

export interface ParsedMargin {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

/**
 * Parse a CSS-shorthand margin string into individual sides.
 *
 * - 1 value  → all four sides
 * - 2 values → vertical, horizontal
 * - 3 values → top, horizontal, bottom
 * - 4 values → top, right, bottom, left
 */
export function parseMargin(margin = '1in'): ParsedMargin {
  const parts = margin.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    throw new Error('Margin string must not be empty');
  }

  const [a, b, c, d] = parts as [string, ...string[]];

  switch (parts.length) {
    case 1:
      return { top: a, right: a, bottom: a, left: a };
    case 2:
      return { top: a, right: b as string, bottom: a, left: b as string };
    case 3:
      return { top: a, right: b as string, bottom: c as string, left: b as string };
    case 4:
      return { top: a, right: b as string, bottom: c as string, left: d as string };
    default:
      throw new Error(`Invalid margin: expected 1–4 values, got ${parts.length}`);
  }
}
