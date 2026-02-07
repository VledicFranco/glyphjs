import type { InlineNode } from '@glyphjs/types';

/**
 * Measures the dimensions of text content for SVG layout calculations.
 * Creates a temporary DOM element to measure actual rendered size.
 *
 * For plain strings, uses canvas 2D measureText for performance.
 * For InlineNode[] (markdown), renders to DOM to account for formatting.
 */

interface TextStyle {
  fontSize: string;
  fontFamily: string;
  fontWeight?: string;
  maxWidth?: number;
}

interface TextDimensions {
  width: number;
  height: number;
}

// Cache for measurement results to improve performance
const measurementCache = new WeakMap<InlineNode[], TextDimensions>();

/**
 * Measures plain text using canvas 2D context (fastest method).
 */
export function measurePlainText(text: string, style: TextStyle): TextDimensions {
  // Create canvas context for text measurement
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    // Fallback: estimate based on character count
    const avgCharWidth = parseInt(style.fontSize) * 0.6;
    return {
      width: text.length * avgCharWidth,
      height: parseInt(style.fontSize) * 1.2,
    };
  }

  // Set font properties
  const fontWeight = style.fontWeight ?? 'normal';
  ctx.font = `${fontWeight} ${style.fontSize} ${style.fontFamily}`;

  const metrics = ctx.measureText(text);
  const width = metrics.width;

  // Height estimation (canvas measureText doesn't provide height)
  const height = parseInt(style.fontSize) * 1.2;

  return { width, height };
}

/**
 * Measures HTML content by rendering to a temporary DOM element.
 * Used for InlineNode[] which may contain formatting like bold, italic, etc.
 */
export function measureHtmlText(content: InlineNode[], style: TextStyle): TextDimensions {
  // Check cache first
  const cached = measurementCache.get(content);
  if (cached) {
    return cached;
  }

  // Create temporary container for measurement
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.fontSize = style.fontSize;
  container.style.fontFamily = style.fontFamily;
  container.style.fontWeight = style.fontWeight ?? 'normal';
  container.style.whiteSpace = 'pre-wrap';
  container.style.wordBreak = 'break-word';

  if (style.maxWidth) {
    container.style.maxWidth = `${style.maxWidth}px`;
  }

  // Render InlineNode[] to HTML
  container.innerHTML = inlineNodesToHtml(content);

  document.body.appendChild(container);

  const rect = container.getBoundingClientRect();
  const dimensions = {
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height),
  };

  document.body.removeChild(container);

  // Cache result
  measurementCache.set(content, dimensions);

  return dimensions;
}

/**
 * Converts InlineNode[] to HTML string for measurement.
 * This is a simplified version that doesn't need React.
 */
function inlineNodesToHtml(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return escapeHtml(node.value);
        case 'strong':
          return `<strong>${inlineNodesToHtml(node.children)}</strong>`;
        case 'emphasis':
          return `<em>${inlineNodesToHtml(node.children)}</em>`;
        case 'delete':
          return `<del>${inlineNodesToHtml(node.children)}</del>`;
        case 'inlineCode':
          return `<code>${escapeHtml(node.value)}</code>`;
        case 'link':
          return `<a href="${escapeHtml(node.url)}">${inlineNodesToHtml(node.children)}</a>`;
        case 'image':
          return `<img src="${escapeHtml(node.src)}" alt="${escapeHtml(node.alt ?? '')}" />`;
        case 'break':
          return '<br />';
        default:
          return '';
      }
    })
    .join('');
}

/**
 * Escapes HTML special characters to prevent injection.
 */
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Measures text content, automatically detecting type and using appropriate method.
 * This is the main function to use for measuring text in diagram layouts.
 */
export function measureText(content: string | InlineNode[], style: TextStyle): TextDimensions {
  if (typeof content === 'string') {
    return measurePlainText(content, style);
  }
  return measureHtmlText(content, style);
}
