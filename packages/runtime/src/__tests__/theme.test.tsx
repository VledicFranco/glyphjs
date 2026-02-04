import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createGlyphRuntime } from '../create-runtime.js';
import { ThemeProvider } from '../theme/context.js';
import { lightTheme, darkTheme } from '../theme/index.js';
import { RuntimeProvider } from '../context.js';
import { ComponentRegistry } from '../registry.js';
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

  it('light theme includes effect variables', () => {
    const vars = lightTheme.variables;
    expect(vars['--glyph-shadow-sm']).toBeDefined();
    expect(vars['--glyph-shadow-md']).toBeDefined();
    expect(vars['--glyph-shadow-lg']).toBeDefined();
    expect(vars['--glyph-shadow-glow']).toBe('none');
    expect(vars['--glyph-gradient-accent']).toContain('linear-gradient');
    expect(vars['--glyph-transition']).toBe('0.2s ease');
    expect(vars['--glyph-opacity-muted']).toBe('0.7');
    expect(vars['--glyph-opacity-disabled']).toBe('0.4');
    expect(vars['--glyph-focus-ring']).toContain('#0a9d7c');
  });

  it('dark theme includes effect variables', () => {
    const vars = darkTheme.variables;
    expect(vars['--glyph-shadow-sm']).toBeDefined();
    expect(vars['--glyph-shadow-md']).toBeDefined();
    expect(vars['--glyph-shadow-lg']).toBeDefined();
    expect(vars['--glyph-shadow-glow']).toContain('rgba(0,212,170');
    expect(vars['--glyph-gradient-accent']).toContain('linear-gradient');
    expect(vars['--glyph-transition']).toBe('0.2s ease');
    expect(vars['--glyph-opacity-muted']).toBe('0.7');
    expect(vars['--glyph-opacity-disabled']).toBe('0.4');
    expect(vars['--glyph-focus-ring']).toContain('#00d4aa');
  });

  it('light theme includes SVG theming variables', () => {
    const vars = lightTheme.variables;
    expect(vars['--glyph-node-fill-opacity']).toBe('0.85');
    expect(vars['--glyph-node-radius']).toBe('3');
    expect(vars['--glyph-node-stroke-width']).toBe('1.5');
    expect(vars['--glyph-node-label-color']).toBe('#fff');
    expect(vars['--glyph-edge-color']).toBe('#a8b5c8');
    expect(vars['--glyph-icon-stroke']).toBe('#fff');
    expect(vars['--glyph-icon-stroke-width']).toBe('1.5');
  });

  it('dark theme includes SVG theming variables', () => {
    const vars = darkTheme.variables;
    expect(vars['--glyph-node-fill-opacity']).toBe('0.85');
    expect(vars['--glyph-node-radius']).toBe('3');
    expect(vars['--glyph-node-stroke-width']).toBe('1.5');
    expect(vars['--glyph-node-label-color']).toBe('#fff');
    expect(vars['--glyph-edge-color']).toBe('#6b7a94');
    expect(vars['--glyph-icon-stroke']).toBe('#fff');
    expect(vars['--glyph-icon-stroke-width']).toBe('1.5');
  });

  it('ThemeProvider renders className on wrapper div', () => {
    const { container } = render(
      <ThemeProvider theme="dark" className="my-custom-class">
        <span>child</span>
      </ThemeProvider>,
    );

    const themeDiv = container.querySelector('[data-glyph-theme="dark"]');
    expect(themeDiv).not.toBeNull();
    expect(themeDiv!.className).toBe('my-custom-class');
  });

  it('ThemeProvider merges consumer style with theme variables', () => {
    const { container } = render(
      <ThemeProvider theme="light" style={{ maxWidth: 800 }}>
        <span>child</span>
      </ThemeProvider>,
    );

    const themeDiv = container.querySelector('[data-glyph-theme="light"]');
    expect(themeDiv).not.toBeNull();

    const style = themeDiv!.getAttribute('style');
    // Consumer style is merged in
    expect(style).toContain('max-width');
    // Theme variables are still present
    expect(style).toContain('#f4f6fa');
  });

  it('RuntimeProvider renders className on wrapper div', () => {
    const registry = new ComponentRegistry();

    const { container } = render(
      <RuntimeProvider
        registry={registry}
        references={[]}
        theme="dark"
        className="runtime-custom-class"
      >
        <span>child</span>
      </RuntimeProvider>,
    );

    const themeDiv = container.querySelector('[data-glyph-theme="dark"]');
    expect(themeDiv).not.toBeNull();
    expect(themeDiv!.className).toBe('runtime-custom-class');
  });
});
