// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createGlyphRuntime } from '../create-runtime.js';
import { createTestIR } from './helpers.js';
import type { Block, SourcePosition } from '@glyphjs/types';

// ─── Shared helpers ────────────────────────────────────────────

const pos: SourcePosition = {
  start: { line: 1, column: 1, offset: 0 },
  end: { line: 1, column: 1, offset: 0 },
};

function renderBlock(block: Block) {
  const runtime = createGlyphRuntime({});
  const ir = createTestIR([block]);
  return render(<runtime.GlyphDocument ir={ir} />);
}

// ─── GlyphRawHtml ──────────────────────────────────────────────

describe('GlyphRawHtml', () => {
  it('renders HTML content', () => {
    const block: Block = {
      id: 'html-1',
      type: 'html',
      data: { value: '<p>Hello <strong>world</strong></p>' },
      position: pos,
    };

    renderBlock(block);

    expect(screen.getByText('world')).toBeInTheDocument();
    expect(screen.getByText('world').tagName).toBe('STRONG');
  });

  it('strips script tags', () => {
    const block: Block = {
      id: 'html-script',
      type: 'html',
      data: { value: '<p>safe</p><script>alert("xss")</script>' },
      position: pos,
    };

    const { container } = renderBlock(block);

    expect(screen.getByText('safe')).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('alert');
  });

  it('strips iframe tags', () => {
    const block: Block = {
      id: 'html-iframe',
      type: 'html',
      data: { value: '<p>content</p><iframe src="https://evil.com"></iframe>' },
      position: pos,
    };

    const { container } = renderBlock(block);

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('strips onclick handlers', () => {
    const block: Block = {
      id: 'html-onclick',
      type: 'html',
      data: { value: '<button onclick="alert(1)">Click me</button>' },
      position: pos,
    };

    const { container } = renderBlock(block);

    expect(screen.getByText('Click me')).toBeInTheDocument();
    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    expect(button!.getAttribute('onclick')).toBeNull();
  });

  it('strips other on* event handlers (onerror, onload, onmouseover)', () => {
    const block: Block = {
      id: 'html-onerror',
      type: 'html',
      data: {
        value: '<img src="x" onerror="alert(1)"><div onmouseover="alert(2)">hover</div>',
      },
      position: pos,
    };

    const { container } = renderBlock(block);

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('onerror')).toBeNull();
    const div = screen.getByText('hover');
    expect(div.getAttribute('onmouseover')).toBeNull();
  });

  it('strips javascript: URLs in href attributes', () => {
    const block: Block = {
      id: 'html-jsurl',
      type: 'html',
      data: { value: '<a href="javascript:alert(1)">link</a>' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const anchor = container.querySelector('a');
    expect(anchor).not.toBeNull();
    // After sanitization the href should be empty or absent (never javascript:)
    const href = anchor!.getAttribute('href');
    expect(href === null || href === '' || !href.includes('javascript:')).toBe(true);
  });

  it('strips javascript: URLs in src attributes', () => {
    const block: Block = {
      id: 'html-jssrc',
      type: 'html',
      data: { value: '<img src="javascript:alert(1)">' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    // After sanitization the src should be empty or absent (never javascript:)
    const src = img!.getAttribute('src');
    expect(src === null || src === '' || !src.includes('javascript:')).toBe(true);
  });

  it('strips nested/obfuscated script tags like <scr<script>ipt>', () => {
    // When a naive regex strips inner <script>, the remaining
    // outer fragments "scr" + "ipt" should NOT form a working script.
    const block: Block = {
      id: 'html-nested-script',
      type: 'html',
      data: { value: '<scr<script>ipt>alert("xss")</scr</script>ipt>' },
      position: pos,
    };

    const { container } = renderBlock(block);

    // The inner <script>...</script> should be stripped
    expect(container.querySelector('script')).toBeNull();
    // The sanitized output should not contain any intact script tags
    expect(container.innerHTML).not.toContain('<script');
  });

  it('strips self-closing script tags', () => {
    const block: Block = {
      id: 'html-self-closing-script',
      type: 'html',
      data: { value: '<p>text</p><script src="evil.js" />' },
      position: pos,
    };

    const { container } = renderBlock(block);

    expect(screen.getByText('text')).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('evil.js');
  });

  it('strips self-closing iframe tags', () => {
    const block: Block = {
      id: 'html-self-closing-iframe',
      type: 'html',
      data: { value: '<p>text</p><iframe src="evil.com" />' },
      position: pos,
    };

    const { container } = renderBlock(block);

    expect(container.querySelector('iframe')).toBeNull();
  });

  it('handles attribute encoding in event handlers', () => {
    const block: Block = {
      id: 'html-attr-encoding',
      type: 'html',
      data: {
        value: `<div onclick="alert('xss')">test</div>`,
      },
      position: pos,
    };

    const { container } = renderBlock(block);

    const div = screen.getByText('test');
    expect(div.getAttribute('onclick')).toBeNull();
  });

  it('preserves safe HTML while stripping dangerous content', () => {
    const block: Block = {
      id: 'html-mixed',
      type: 'html',
      data: {
        value:
          '<h2>Title</h2><p>Normal <em>text</em></p><script>bad()</script><a href="https://safe.com">safe link</a>',
      },
      position: pos,
    };

    const { container } = renderBlock(block);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('text').tagName).toBe('EM');
    expect(screen.getByText('safe link').getAttribute('href')).toBe('https://safe.com');
    expect(container.querySelector('script')).toBeNull();
  });
});

// ─── GlyphCodeBlock ────────────────────────────────────────────

describe('GlyphCodeBlock', () => {
  it('renders code content within pre > code elements', () => {
    const block: Block = {
      id: 'code-1',
      type: 'code',
      data: { value: 'console.log("hello");', language: 'javascript' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();

    const code = pre!.querySelector('code');
    expect(code).not.toBeNull();
    expect(code!.textContent).toBe('console.log("hello");');
  });

  it('sets data-language attribute on pre element', () => {
    const block: Block = {
      id: 'code-lang',
      type: 'code',
      data: { value: 'print("hello")', language: 'python' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre!.getAttribute('data-language')).toBe('python');
  });

  it('adds language-{lang} CSS class to code element', () => {
    const block: Block = {
      id: 'code-class',
      type: 'code',
      data: { value: 'fn main() {}', language: 'rust' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const code = container.querySelector('code');
    expect(code).not.toBeNull();
    expect(code!.className).toBe('language-rust');
  });

  it('renders without language when not specified', () => {
    const block: Block = {
      id: 'code-no-lang',
      type: 'code',
      data: { value: 'plain text code' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    // data-language should not be set (or be undefined)
    expect(pre!.getAttribute('data-language')).toBeNull();

    const code = container.querySelector('code');
    expect(code).not.toBeNull();
    expect(code!.className).toBe('');
  });

  it('includes an aria-label with language info', () => {
    const block: Block = {
      id: 'code-aria',
      type: 'code',
      data: { value: 'let x = 1;', language: 'typescript' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const pre = container.querySelector('pre');
    expect(pre!.getAttribute('aria-label')).toBe('Code block (typescript)');
  });

  it('includes a generic aria-label when no language is set', () => {
    const block: Block = {
      id: 'code-aria-generic',
      type: 'code',
      data: { value: 'some code' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const pre = container.querySelector('pre');
    expect(pre!.getAttribute('aria-label')).toBe('Code block');
  });
});

// ─── GlyphBlockquote ──────────────────────────────────────────

describe('GlyphBlockquote', () => {
  it('renders a blockquote element with text content', () => {
    const block: Block = {
      id: 'bq-1',
      type: 'blockquote',
      data: {
        children: [{ type: 'text', value: 'To be or not to be.' }],
      },
      position: pos,
    };

    const { container } = renderBlock(block);

    const bq = container.querySelector('blockquote');
    expect(bq).not.toBeNull();
    expect(bq!.textContent).toBe('To be or not to be.');
  });

  it('renders inline formatting within the blockquote', () => {
    const block: Block = {
      id: 'bq-inline',
      type: 'blockquote',
      data: {
        children: [
          { type: 'text', value: 'This is ' },
          { type: 'strong', children: [{ type: 'text', value: 'important' }] },
        ],
      },
      position: pos,
    };

    const { container } = renderBlock(block);

    const bq = container.querySelector('blockquote');
    expect(bq).not.toBeNull();
    expect(bq!.textContent).toBe('This is important');

    const strong = bq!.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe('important');
  });
});

// ─── GlyphImage ────────────────────────────────────────────────

describe('GlyphImage', () => {
  it('renders an img within a figure element', () => {
    const block: Block = {
      id: 'img-1',
      type: 'image',
      data: { src: 'https://example.com/photo.png', alt: 'A photo' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const figure = container.querySelector('figure');
    expect(figure).not.toBeNull();

    const img = figure!.querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('src')).toBe('https://example.com/photo.png');
    expect(img!.getAttribute('alt')).toBe('A photo');
  });

  it('uses lazy loading', () => {
    const block: Block = {
      id: 'img-lazy',
      type: 'image',
      data: { src: 'https://example.com/big.jpg', alt: 'Large image' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const img = container.querySelector('img');
    expect(img!.getAttribute('loading')).toBe('lazy');
  });

  it('renders a figcaption when title is provided', () => {
    const block: Block = {
      id: 'img-title',
      type: 'image',
      data: {
        src: 'https://example.com/photo.png',
        alt: 'Photo',
        title: 'A beautiful sunset',
      },
      position: pos,
    };

    const { container } = renderBlock(block);

    const caption = container.querySelector('figcaption');
    expect(caption).not.toBeNull();
    expect(caption!.textContent).toBe('A beautiful sunset');
  });

  it('does not render figcaption when title is not provided', () => {
    const block: Block = {
      id: 'img-no-title',
      type: 'image',
      data: { src: 'https://example.com/photo.png', alt: 'Photo' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const caption = container.querySelector('figcaption');
    expect(caption).toBeNull();
  });

  it('defaults alt to empty string when not provided', () => {
    const block: Block = {
      id: 'img-no-alt',
      type: 'image',
      data: { src: 'https://example.com/photo.png' },
      position: pos,
    };

    const { container } = renderBlock(block);

    const img = container.querySelector('img');
    expect(img!.getAttribute('alt')).toBe('');
  });
});

// ─── GlyphThematicBreak ───────────────────────────────────────

describe('GlyphThematicBreak', () => {
  it('renders an <hr> element', () => {
    const block: Block = {
      id: 'tb-1',
      type: 'thematic-break',
      data: {},
      position: pos,
    };

    const { container } = renderBlock(block);

    const hr = container.querySelector('hr');
    expect(hr).not.toBeNull();
  });
});

// ─── FallbackRenderer ─────────────────────────────────────────

describe('FallbackRenderer', () => {
  it('renders fallback UI for unknown block types', () => {
    const block: Block = {
      id: 'unknown-1',
      type: 'fancy-widget' as Block['type'],
      data: { value: 42 },
      position: pos,
    };

    renderBlock(block);

    expect(screen.getByText(/Unknown block type/)).toBeInTheDocument();
    expect(screen.getByText(/fancy-widget/)).toBeInTheDocument();
  });

  it('shows stringified block data in the fallback', () => {
    const block: Block = {
      id: 'unknown-2',
      type: 'custom-chart' as Block['type'],
      data: { series: [1, 2, 3], label: 'Revenue' },
      position: pos,
    };

    renderBlock(block);

    expect(screen.getByText(/custom-chart/)).toBeInTheDocument();
    // The data should be JSON-stringified
    expect(screen.getByText(/Revenue/)).toBeInTheDocument();
  });

  it('handles non-serializable block data gracefully', () => {
    // Create circular reference data
    const data: Record<string, unknown> = { name: 'circular' };
    data.self = data;

    const block: Block = {
      id: 'unknown-circular',
      type: 'recursive-block' as Block['type'],
      data,
      position: pos,
    };

    renderBlock(block);

    expect(screen.getByText(/Unknown block type/)).toBeInTheDocument();
    expect(screen.getByText(/recursive-block/)).toBeInTheDocument();
    expect(screen.getByText(/Unable to serialize/)).toBeInTheDocument();
  });
});

// ─── GlyphList ─────────────────────────────────────────────────

describe('GlyphList', () => {
  it('renders an unordered list', () => {
    const block: Block = {
      id: 'list-ul',
      type: 'list',
      data: {
        ordered: false,
        items: [
          { children: [{ type: 'text', value: 'Item one' }] },
          { children: [{ type: 'text', value: 'Item two' }] },
          { children: [{ type: 'text', value: 'Item three' }] },
        ],
      },
      position: pos,
    };

    const { container } = renderBlock(block);

    const ul = container.querySelector('ul');
    expect(ul).not.toBeNull();
    expect(container.querySelector('ol')).toBeNull();

    const items = ul!.querySelectorAll('li');
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toBe('Item one');
    expect(items[1].textContent).toBe('Item two');
    expect(items[2].textContent).toBe('Item three');
  });

  it('renders an ordered list', () => {
    const block: Block = {
      id: 'list-ol',
      type: 'list',
      data: {
        ordered: true,
        items: [
          { children: [{ type: 'text', value: 'First' }] },
          { children: [{ type: 'text', value: 'Second' }] },
        ],
      },
      position: pos,
    };

    const { container } = renderBlock(block);

    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();

    const items = ol!.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe('First');
    expect(items[1].textContent).toBe('Second');
  });

  it('respects the start attribute for ordered lists', () => {
    const block: Block = {
      id: 'list-start',
      type: 'list',
      data: {
        ordered: true,
        start: 5,
        items: [
          { children: [{ type: 'text', value: 'Five' }] },
          { children: [{ type: 'text', value: 'Six' }] },
        ],
      },
      position: pos,
    };

    const { container } = renderBlock(block);

    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    expect(ol!.getAttribute('start')).toBe('5');
  });

  it('renders nested sub-lists', () => {
    const block: Block = {
      id: 'list-nested',
      type: 'list',
      data: {
        ordered: false,
        items: [
          {
            children: [{ type: 'text', value: 'Parent' }],
            subList: {
              ordered: true,
              items: [
                { children: [{ type: 'text', value: 'Child one' }] },
                { children: [{ type: 'text', value: 'Child two' }] },
              ],
            },
          },
          { children: [{ type: 'text', value: 'Sibling' }] },
        ],
      },
      position: pos,
    };

    const { container } = renderBlock(block);

    // Outer list is UL
    const ul = container.querySelector('ul');
    expect(ul).not.toBeNull();

    // Nested list is OL
    const ol = ul!.querySelector('ol');
    expect(ol).not.toBeNull();

    const nestedItems = ol!.querySelectorAll('li');
    expect(nestedItems).toHaveLength(2);
    expect(nestedItems[0].textContent).toBe('Child one');
    expect(nestedItems[1].textContent).toBe('Child two');
  });

  it('renders inline formatting within list items', () => {
    const block: Block = {
      id: 'list-inline',
      type: 'list',
      data: {
        ordered: false,
        items: [
          {
            children: [
              { type: 'text', value: 'An ' },
              {
                type: 'emphasis',
                children: [{ type: 'text', value: 'italic' }],
              },
              { type: 'text', value: ' item' },
            ],
          },
        ],
      },
      position: pos,
    };

    const { container } = renderBlock(block);

    const li = container.querySelector('li');
    expect(li).not.toBeNull();
    expect(li!.textContent).toBe('An italic item');

    const em = li!.querySelector('em');
    expect(em).not.toBeNull();
    expect(em!.textContent).toBe('italic');
  });
});
