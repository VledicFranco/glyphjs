import { describe, it, expect } from 'vitest';
import { measureText, measurePlainText, measureHtmlText } from '../measureText.js';
import type { InlineNode } from '@glyphjs/types';

// Check if full DOM APIs are available (not just jsdom stubs)
const hasFullDOM = () => {
  if (typeof document === 'undefined') return false;
  try {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const hasRect = div.getBoundingClientRect().width > 0 || div.getBoundingClientRect().height > 0;
    document.body.removeChild(div);
    return hasRect;
  } catch {
    return false;
  }
};

describe('measureText', () => {
  const defaultStyle = {
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
  };

  describe('measurePlainText', () => {
    it('measures simple text string', () => {
      const result = measurePlainText('Hello World', defaultStyle);

      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    it('longer text has greater width', () => {
      const short = measurePlainText('Hi', defaultStyle);
      const long = measurePlainText('Hello World', defaultStyle);

      expect(long.width).toBeGreaterThan(short.width);
    });

    it('respects font size', () => {
      const small = measurePlainText('Test', { ...defaultStyle, fontSize: '12px' });
      const large = measurePlainText('Test', { ...defaultStyle, fontSize: '20px' });

      expect(large.height).toBeGreaterThan(small.height);
    });
  });

  describe.skipIf(!hasFullDOM())('measureHtmlText', () => {
    it('measures InlineNode[] with plain text', () => {
      const content: InlineNode[] = [{ type: 'text', value: 'Hello World' }];
      const result = measureHtmlText(content, defaultStyle);

      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    it('measures text with formatting', () => {
      const content: InlineNode[] = [
        { type: 'text', value: 'Hello ' },
        {
          type: 'strong',
          children: [{ type: 'text', value: 'World' }],
        },
      ];
      const result = measureHtmlText(content, defaultStyle);

      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    it('handles links', () => {
      const content: InlineNode[] = [
        {
          type: 'link',
          url: 'https://example.com',
          children: [{ type: 'text', value: 'Click here' }],
        },
      ];
      const result = measureHtmlText(content, defaultStyle);

      expect(result.width).toBeGreaterThan(0);
    });

    it('handles inline code', () => {
      const content: InlineNode[] = [
        { type: 'text', value: 'Run ' },
        { type: 'inlineCode', value: 'npm install' },
      ];
      const result = measureHtmlText(content, defaultStyle);

      expect(result.width).toBeGreaterThan(0);
    });

    it('respects maxWidth constraint', () => {
      const longText: InlineNode[] = [
        {
          type: 'text',
          value: 'This is a very long text that should wrap when maxWidth is applied',
        },
      ];

      const noLimit = measureHtmlText(longText, defaultStyle);
      const withLimit = measureHtmlText(longText, { ...defaultStyle, maxWidth: 100 });

      expect(withLimit.width).toBeLessThanOrEqual(100);
      expect(withLimit.height).toBeGreaterThan(noLimit.height); // Should wrap to multiple lines
    });

    it('caches measurement results', () => {
      const content: InlineNode[] = [{ type: 'text', value: 'Cached' }];

      const first = measureHtmlText(content, defaultStyle);
      const second = measureHtmlText(content, defaultStyle);

      // Should return exact same dimensions (cached)
      expect(second).toEqual(first);
    });
  });

  describe('measureText (unified API)', () => {
    it('handles string input', () => {
      const result = measureText('Hello', defaultStyle);

      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    it.skipIf(!hasFullDOM())('handles InlineNode[] input', () => {
      const content: InlineNode[] = [
        { type: 'text', value: 'Hello ' },
        {
          type: 'emphasis',
          children: [{ type: 'text', value: 'World' }],
        },
      ];
      const result = measureText(content, defaultStyle);

      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });
  });
});
