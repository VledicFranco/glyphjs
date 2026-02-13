import { describe, it, expect } from 'vitest';
import { buildHtmlTemplate } from '../html-template.js';

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

    // Light theme uses --glyph-bg: #f4f6fa
    expect(html).toContain('--glyph-bg: #f4f6fa');
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

    expect(html).toContain('<script type="module">console.log("hydrated")</script>');
  });

  it('omits script tag when clientBundle is not provided', () => {
    const html = buildHtmlTemplate({ body: '' });

    expect(html).not.toContain('<script');
  });

  it('sets body background from theme variables', () => {
    const html = buildHtmlTemplate({ body: '', theme: 'light' });

    expect(html).toContain('background: #f4f6fa');
  });
});
