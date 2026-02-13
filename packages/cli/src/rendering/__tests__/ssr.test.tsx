import { describe, it, expect } from 'vitest';
import type { Block, GlyphIR } from '@glyphjs/types';
import { renderBlockToHTML, renderDocumentToHTML } from '../ssr.js';

function createCalloutBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: 'block-callout-1',
    type: 'ui:callout',
    data: {
      type: 'info',
      title: 'Test Note',
      content: 'This is a test callout.',
    },
    position: { start: { line: 1, column: 1 }, end: { line: 5, column: 1 } },
    ...overrides,
  };
}

function createIR(blocks: Block[]): GlyphIR {
  return {
    version: '1.0.0',
    id: 'test-doc',
    metadata: {},
    blocks,
    references: [],
    layout: { mode: 'document', spacing: 'normal' },
  };
}

describe('renderBlockToHTML', () => {
  it('renders a callout block to HTML', () => {
    const html = renderBlockToHTML(createCalloutBlock());

    expect(html).toContain('Test Note');
    expect(html).toContain('data-glyph-block');
  });

  it('produces valid HTML string', () => {
    const html = renderBlockToHTML(createCalloutBlock());

    // Should contain opening and closing tags
    expect(html).toContain('<');
    expect(html).toContain('>');
    // Should not be empty
    expect(html.length).toBeGreaterThan(0);
  });
});

describe('renderDocumentToHTML', () => {
  it('renders a document with light theme', () => {
    const ir = createIR([createCalloutBlock()]);
    const html = renderDocumentToHTML(ir, 'light');

    expect(html).toContain('data-glyph-document');
    expect(html).toContain('Test Note');
  });

  it('renders a document with dark theme', () => {
    const ir = createIR([createCalloutBlock()]);
    const html = renderDocumentToHTML(ir, 'dark');

    expect(html).toContain('data-glyph-document');
    expect(html).toContain('data-glyph-theme');
  });

  it('renders an empty document', () => {
    const ir = createIR([]);
    const html = renderDocumentToHTML(ir);

    expect(html).toContain('data-glyph-document');
  });
});
