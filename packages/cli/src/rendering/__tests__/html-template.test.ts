import { describe, it, expect } from 'vitest';
import { buildHtmlTemplate } from '../html-template.js';
import type { GlyphIR } from '@glyphjs/types';

function createTestIR(): GlyphIR {
  return {
    version: '1.0.0',
    id: 'test-doc',
    metadata: {},
    blocks: [{ id: 'b1', type: 'callout', data: { style: 'info', body: 'hi' } }],
    references: [],
    layout: { mode: 'document', spacing: 'normal' },
  };
}

describe('buildHtmlTemplate', () => {
  it('produces a valid HTML5 document', () => {
    const html = buildHtmlTemplate({ body: '<p>Hello</p>' });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<meta charset="UTF-8">');
    expect(html).toContain('</html>');
  });

  it('embeds the body content inside #glyph-root', () => {
    const html = buildHtmlTemplate({ body: '<div>Content</div>' });

    expect(html).toContain('id="glyph-root"');
    expect(html).toContain('<div>Content</div>');
  });

  it('injects light theme CSS variables by default', () => {
    const html = buildHtmlTemplate({ body: '' });

    // Light theme uses --glyph-bg: transparent
    expect(html).toContain('--glyph-bg: transparent');
    expect(html).toContain('--glyph-text: #1a2035');
  });

  it('injects dark theme CSS variables when theme is dark', () => {
    const html = buildHtmlTemplate({ body: '', theme: 'dark' });

    // Dark theme uses --glyph-bg: #0a0e1a
    expect(html).toContain('--glyph-bg: #0a0e1a');
    expect(html).toContain('--glyph-text: #d4dae3');
  });

  it('sets the page title', () => {
    const html = buildHtmlTemplate({ body: '', title: 'My Doc' });

    expect(html).toContain('<title>My Doc</title>');
  });

  it('uses default title when not specified', () => {
    const html = buildHtmlTemplate({ body: '' });

    expect(html).toContain('<title>GlyphJS Render</title>');
  });

  it('escapes HTML entities in the title', () => {
    const html = buildHtmlTemplate({ body: '', title: 'A <b>bold</b> title' });

    expect(html).toContain('<title>A &lt;b&gt;bold&lt;/b&gt; title</title>');
    expect(html).not.toContain('<title>A <b>');
  });

  it('includes a script tag when clientBundle is provided', () => {
    const html = buildHtmlTemplate({
      body: '',
      clientBundle: 'console.log("hydrated")',
    });

    expect(html).toContain('<script>console.log("hydrated")</script>');
  });

  it('omits script tag when clientBundle is not provided', () => {
    const html = buildHtmlTemplate({ body: '' });

    expect(html).not.toContain('<script>');
  });

  it('sets body background from theme variables', () => {
    const html = buildHtmlTemplate({ body: '', theme: 'light' });

    expect(html).toContain('background: transparent');
  });

  // ── New: data-glyph-theme attribute ────────────────────────

  it('sets data-glyph-theme="light" by default', () => {
    const html = buildHtmlTemplate({ body: '' });

    expect(html).toContain('data-glyph-theme="light"');
  });

  it('sets data-glyph-theme="dark" when theme is dark', () => {
    const html = buildHtmlTemplate({ body: '', theme: 'dark' });

    expect(html).toContain('data-glyph-theme="dark"');
  });

  // ── New: IR embedding ──────────────────────────────────────

  it('embeds IR as JSON in a script tag when ir is provided', () => {
    const ir = createTestIR();
    const html = buildHtmlTemplate({ body: '', ir });

    expect(html).toContain('<script id="glyph-ir-data" type="application/json">');
    expect(html).toContain('"id":"test-doc"');
  });

  it('omits IR script tag when ir is not provided', () => {
    const html = buildHtmlTemplate({ body: '' });

    expect(html).not.toContain('glyph-ir-data');
  });

  it('escapes </script> in embedded IR JSON', () => {
    const ir = createTestIR();
    // Inject a value that contains </script> to test escaping
    ir.metadata = { note: '</script><script>alert("xss")' };
    const html = buildHtmlTemplate({ body: '', ir });

    expect(html).not.toContain('</script><script>alert');
    expect(html).toContain('<\\/script>');
  });

  // ── New: prose CSS ─────────────────────────────────────────

  it('includes Inter font import', () => {
    const html = buildHtmlTemplate({ body: '' });

    expect(html).toContain('fonts.googleapis.com/css2?family=Inter');
  });

  it('includes prose heading styles', () => {
    const html = buildHtmlTemplate({ body: '' });

    expect(html).toContain('#glyph-root h1');
    expect(html).toContain('#glyph-root h2');
    expect(html).toContain('#glyph-root h3');
  });

  it('includes prose element styles', () => {
    const html = buildHtmlTemplate({ body: '' });

    expect(html).toContain('#glyph-root p');
    expect(html).toContain('#glyph-root blockquote');
    expect(html).toContain('#glyph-root code');
    expect(html).toContain('#glyph-root pre');
    expect(html).toContain('#glyph-root a');
  });

  it('sets max-width on #glyph-root to default 52rem', () => {
    const html = buildHtmlTemplate({ body: '' });

    expect(html).toContain('max-width: 52rem');
  });

  it('uses custom maxWidth when provided', () => {
    const html = buildHtmlTemplate({ body: '', maxWidth: '64rem' });

    expect(html).toContain('max-width: 64rem');
    expect(html).not.toContain('max-width: 52rem');
  });

  // ── @media print CSS ─────────────────────────────────────

  it('includes @media print rules for page breaks', () => {
    const html = buildHtmlTemplate({ body: '' });

    expect(html).toContain('@media print');
    expect(html).toContain('break-inside: avoid');
    expect(html).toContain('page-break-inside: avoid');
    expect(html).toContain('break-after: avoid');
    expect(html).toContain('orphans: 3');
    expect(html).toContain('widows: 3');
  });

  // ── Custom themeVars ───────────────────────────────────────

  it('uses custom themeVars when provided instead of built-in theme', () => {
    const html = buildHtmlTemplate({
      body: '',
      themeVars: {
        '--glyph-bg': '#FDFAF6',
        '--glyph-text': '#222222',
        '--glyph-accent': '#F56400',
      },
    });

    expect(html).toContain('--glyph-bg: #FDFAF6');
    expect(html).toContain('--glyph-text: #222222');
    expect(html).toContain('--glyph-accent: #F56400');
    // Should use custom bg for body background
    expect(html).toContain('background: #FDFAF6');
  });

  it('embeds themeVars as JSON script tag when provided', () => {
    const vars = { '--glyph-bg': '#fff' };
    const html = buildHtmlTemplate({ body: '', themeVars: vars });

    expect(html).toContain('<script id="glyph-theme-vars" type="application/json">');
    expect(html).toContain('"--glyph-bg":"#fff"');
  });

  it('does not embed themeVars script tag when not provided', () => {
    const html = buildHtmlTemplate({ body: '' });

    expect(html).not.toContain('glyph-theme-vars');
  });
});
