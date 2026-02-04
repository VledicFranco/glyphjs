import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createGlyphRuntime } from '../create-runtime.js';
import { createTestIR, paragraphBlock } from './helpers.js';

describe('Theme system', () => {
  it('light theme applies light CSS variables', () => {
    const runtime = createGlyphRuntime({ theme: 'light' });
    const ir = createTestIR([paragraphBlock('Light text')]);

    const { container } = render(<runtime.GlyphDocument ir={ir} />);

    const themeDiv = container.querySelector('[data-glyph-theme="light"]');
    expect(themeDiv).not.toBeNull();

    // Check that light theme variables are set as inline styles
    const style = themeDiv!.getAttribute('style');
    expect(style).toContain('#f4f6fa'); // --glyph-bg for light theme
    expect(style).toContain('#1a2035'); // --glyph-text for light theme
  });

  it('dark theme applies dark CSS variables', () => {
    const runtime = createGlyphRuntime({ theme: 'dark' });
    const ir = createTestIR([paragraphBlock('Dark text')]);

    const { container } = render(<runtime.GlyphDocument ir={ir} />);

    const themeDiv = container.querySelector('[data-glyph-theme="dark"]');
    expect(themeDiv).not.toBeNull();

    // Check that dark theme variables are set as inline styles
    const style = themeDiv!.getAttribute('style');
    expect(style).toContain('#0a0e1a'); // --glyph-bg for dark theme
    expect(style).toContain('#d4dae3'); // --glyph-text for dark theme
  });

  it('defaults to light theme when no theme is specified', () => {
    const runtime = createGlyphRuntime({});
    const ir = createTestIR([paragraphBlock('Default text')]);

    const { container } = render(<runtime.GlyphDocument ir={ir} />);

    const themeDiv = container.querySelector('[data-glyph-theme="light"]');
    expect(themeDiv).not.toBeNull();
  });

  it('accepts a custom theme object', () => {
    const customTheme = {
      name: 'custom',
      variables: {
        '--glyph-bg': '#ff0000',
        '--glyph-text': '#00ff00',
      },
    };

    const runtime = createGlyphRuntime({ theme: customTheme });
    const ir = createTestIR([paragraphBlock('Custom text')]);

    const { container } = render(<runtime.GlyphDocument ir={ir} />);

    const themeDiv = container.querySelector('[data-glyph-theme="custom"]');
    expect(themeDiv).not.toBeNull();

    const style = themeDiv!.getAttribute('style');
    expect(style).toContain('#ff0000');
    expect(style).toContain('#00ff00');
  });

  it('setTheme exists and is callable', () => {
    const runtime = createGlyphRuntime({ theme: 'light' });

    // setTheme should not throw
    expect(() => runtime.setTheme('dark')).not.toThrow();
    expect(() => runtime.setTheme('light')).not.toThrow();
    expect(() =>
      runtime.setTheme({
        name: 'custom',
        variables: { '--glyph-bg': '#123456' },
      }),
    ).not.toThrow();
  });
});
