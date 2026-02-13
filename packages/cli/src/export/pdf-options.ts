export interface PdfExportOptions {
  theme?: 'light' | 'dark';
  title?: string;
  width?: number;
  pageSize?: string;
  margin?: string;
  landscape?: boolean;
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
