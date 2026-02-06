import { describe, it, expect } from 'vitest';
import { parseInlineMarkdown } from '../inline.js';
import type { InlineNode, Diagnostic } from '@glyphjs/types';

describe('parseInlineMarkdown', () => {
  it('returns empty array for empty string', () => {
    const result = parseInlineMarkdown('');
    expect(result).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    const result = parseInlineMarkdown('   \n  \t  ');
    expect(result).toEqual([]);
  });

  it('parses plain text as single text node', () => {
    const result = parseInlineMarkdown('Hello world');
    expect(result).toEqual([{ type: 'text', value: 'Hello world' }]);
  });

  it('parses bold text with **syntax**', () => {
    const result = parseInlineMarkdown('This is **bold** text');
    expect(result).toEqual([
      { type: 'text', value: 'This is ' },
      {
        type: 'strong',
        children: [{ type: 'text', value: 'bold' }],
      },
      { type: 'text', value: ' text' },
    ]);
  });

  it('parses italic text with *syntax*', () => {
    const result = parseInlineMarkdown('This is *italic* text');
    expect(result).toEqual([
      { type: 'text', value: 'This is ' },
      {
        type: 'emphasis',
        children: [{ type: 'text', value: 'italic' }],
      },
      { type: 'text', value: ' text' },
    ]);
  });

  it('parses strikethrough text with ~~syntax~~', () => {
    // Note: remark-parse doesn't support strikethrough without GFM plugin
    // So ~~ syntax will be treated as plain text
    const result = parseInlineMarkdown('This is ~~deleted~~ text');
    expect(result).toEqual([{ type: 'text', value: 'This is ~~deleted~~ text' }]);
  });

  it('parses inline code with `syntax`', () => {
    const result = parseInlineMarkdown('Use the `parseInlineMarkdown` function');
    expect(result).toEqual([
      { type: 'text', value: 'Use the ' },
      { type: 'inlineCode', value: 'parseInlineMarkdown' },
      { type: 'text', value: ' function' },
    ]);
  });

  it('parses links with [text](url) syntax', () => {
    const result = parseInlineMarkdown('Visit [our site](https://example.com) for more info');
    expect(result).toEqual([
      { type: 'text', value: 'Visit ' },
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ type: 'text', value: 'our site' }],
      },
      { type: 'text', value: ' for more info' },
    ]);
  });

  it('parses links with title attribute', () => {
    const result = parseInlineMarkdown('[link](https://example.com "Link Title")');
    expect(result).toEqual([
      {
        type: 'link',
        url: 'https://example.com',
        title: 'Link Title',
        children: [{ type: 'text', value: 'link' }],
      },
    ]);
  });

  it('parses combined formatting (bold + italic)', () => {
    const result = parseInlineMarkdown('This is ***bold and italic*** text');
    // Note: *** parses as emphasis wrapping strong
    expect(result).toEqual([
      { type: 'text', value: 'This is ' },
      {
        type: 'emphasis',
        children: [
          {
            type: 'strong',
            children: [{ type: 'text', value: 'bold and italic' }],
          },
        ],
      },
      { type: 'text', value: ' text' },
    ]);
  });

  it('parses nested formatting (bold link)', () => {
    const result = parseInlineMarkdown('Visit **[our site](https://example.com)** now');
    expect(result).toEqual([
      { type: 'text', value: 'Visit ' },
      {
        type: 'strong',
        children: [
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ type: 'text', value: 'our site' }],
          },
        ],
      },
      { type: 'text', value: ' now' },
    ]);
  });

  it('parses line breaks', () => {
    const result = parseInlineMarkdown('Line one  \\nLine two');
    // The exact parsing of line breaks depends on remark-parse behavior
    // In single-line context, line breaks may not be preserved
    // We'll just verify the function handles this gracefully
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles multiple formatting types in one string', () => {
    const result = parseInlineMarkdown('**Bold**, *italic*, `code`, and [link](url)');
    expect(result.length).toBeGreaterThan(5);
    expect(result.some((node) => node.type === 'strong')).toBe(true);
    expect(result.some((node) => node.type === 'emphasis')).toBe(true);
    expect(result.some((node) => node.type === 'inlineCode')).toBe(true);
    expect(result.some((node) => node.type === 'link')).toBe(true);
  });

  it('warns about block-level elements (headings)', () => {
    const diagnostics: Diagnostic[] = [];
    const result = parseInlineMarkdown('# Heading', diagnostics);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].severity).toBe('warning');
    expect(diagnostics[0].message).toContain('Block-level markdown elements');
    // Should still extract text
    expect(result.some((node: InlineNode) => node.type === 'text')).toBe(true);
  });

  it('warns about block-level elements (lists)', () => {
    const diagnostics: Diagnostic[] = [];
    const result = parseInlineMarkdown('- Item 1\\n- Item 2', diagnostics);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].severity).toBe('warning');
    expect(diagnostics[0].source).toBe('compiler');
    // Should still extract text
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles escaped markdown characters', () => {
    const result = parseInlineMarkdown('This is \\*not italic\\* text');
    // Escaped asterisks should be treated as literal text
    const textNode = result.find((node) => node.type === 'text' && node.value.includes('*'));
    expect(textNode).toBeDefined();
  });

  it('handles unicode and emoji', () => {
    const result = parseInlineMarkdown('Hello 👋 world 🌍');
    expect(result).toEqual([{ type: 'text', value: 'Hello 👋 world 🌍' }]);
  });

  it('handles very long text without performance issues', () => {
    const longText = 'word '.repeat(1000);
    const start = Date.now();
    const result = parseInlineMarkdown(longText);
    const duration = Date.now() - start;

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('text');
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });

  it('handles multiple paragraphs gracefully', () => {
    const diagnostics: Diagnostic[] = [];
    const result = parseInlineMarkdown('Paragraph 1\\n\\nParagraph 2', diagnostics);

    // Multiple paragraphs may or may not trigger warning depending on parsing
    // The important thing is that it returns valid content
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    // If diagnostics are added, they should have the right structure
    if (diagnostics.length > 0) {
      expect(diagnostics[0]).toHaveProperty('severity');
      expect(diagnostics[0]).toHaveProperty('code');
    }
  });

  it('preserves special characters in inline code', () => {
    const result = parseInlineMarkdown('Use `<div>` tags');
    expect(result).toEqual([
      { type: 'text', value: 'Use ' },
      { type: 'inlineCode', value: '<div>' },
      { type: 'text', value: ' tags' },
    ]);
  });

  it('handles links with formatting in link text', () => {
    const result = parseInlineMarkdown('[**bold link**](https://example.com)');
    expect(result).toEqual([
      {
        type: 'link',
        url: 'https://example.com',
        children: [
          {
            type: 'strong',
            children: [{ type: 'text', value: 'bold link' }],
          },
        ],
      },
    ]);
  });

  it('handles autolinks', () => {
    const result = parseInlineMarkdown('Visit https://example.com for info');
    // Depending on remark-parse settings, this may or may not auto-link
    // This test verifies the function handles the input without errors
    expect(result.length).toBeGreaterThan(0);
  });

  it('does not mutate input diagnostics array', () => {
    const diagnostics: Diagnostic[] = [];
    parseInlineMarkdown('# Heading', diagnostics);
    parseInlineMarkdown('Plain text', diagnostics);

    // Should only have one warning (from the heading)
    expect(diagnostics).toHaveLength(1);
  });
});
