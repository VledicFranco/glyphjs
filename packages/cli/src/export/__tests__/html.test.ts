import { describe, it, expect, vi } from 'vitest';
import type { GlyphIR } from '@glyphjs/types';

// Mock SSR rendering — we don't need a full React render in unit tests
vi.mock('../../rendering/ssr.js', () => ({
  renderDocumentToHTML: vi.fn(() => '<div>SSR content</div>'),
}));

import { renderDocumentToHTML } from '../../rendering/ssr.js';
import { exportHTML } from '../html.js';

function createTestIR(overrides: Partial<GlyphIR> = {}): GlyphIR {
  return {
    version: '1.0.0',
    id: 'test-doc',
    metadata: {},
    blocks: [
      {
        id: 'callout-1',
        type: 'ui:callout',
        data: { type: 'info', content: 'Test callout' },
        position: { start: { line: 1, column: 1 }, end: { line: 3, column: 4 } },
      },
    ],
    references: [],
    layout: { mode: 'document', spacing: 'normal' },
    ...overrides,
  };
}

describe('exportHTML', () => {
  it('produces a self-contained HTML document', () => {
    const ir = createTestIR();
    const html = exportHTML(ir);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('</html>');
    expect(html).toContain('SSR content');
  });

  it('includes theme CSS variables in the output', () => {
    const ir = createTestIR();
    const html = exportHTML(ir);

    // Light theme variables
    expect(html).toContain('--glyph-bg');
    expect(html).toContain('--glyph-text');
  });

  it('uses "GlyphJS Export" as default title', () => {
    const ir = createTestIR();
    const html = exportHTML(ir);

    expect(html).toContain('<title>GlyphJS Export</title>');
  });

  it('uses IR metadata title when available', () => {
    const ir = createTestIR({ metadata: { title: 'My Document' } });
    const html = exportHTML(ir);

    expect(html).toContain('<title>My Document</title>');
  });

  it('respects --title override over IR metadata', () => {
    const ir = createTestIR({ metadata: { title: 'IR Title' } });
    const html = exportHTML(ir, { title: 'Override Title' });

    expect(html).toContain('<title>Override Title</title>');
    expect(html).not.toContain('IR Title');
  });

  it('applies dark theme when specified', () => {
    const ir = createTestIR();
    const html = exportHTML(ir, { theme: 'dark' });

    expect(renderDocumentToHTML).toHaveBeenCalledWith(ir, 'dark');
    // Dark theme bg color
    expect(html).toContain('--glyph-bg: #0a0e1a');
  });

  it('applies light theme by default', () => {
    const ir = createTestIR();
    const html = exportHTML(ir);

    expect(renderDocumentToHTML).toHaveBeenCalledWith(ir, 'light');
    expect(html).toContain('--glyph-bg: #f4f6fa');
  });

  it('output is a single string with no external resource references', () => {
    const ir = createTestIR();
    const html = exportHTML(ir);

    // No external stylesheet or script links
    expect(html).not.toContain('<link rel="stylesheet"');
    expect(html).not.toContain('<script src=');
  });
});
