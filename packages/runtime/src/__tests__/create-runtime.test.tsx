import { describe, it, expect } from 'vitest';
import { createGlyphRuntime } from '../create-runtime.js';
import { createTestIR, headingBlock, paragraphBlock } from './helpers.js';

describe('createGlyphRuntime', () => {
  it('returns an object with GlyphDocument, registerComponent, and setTheme', () => {
    const runtime = createGlyphRuntime({});
    expect(runtime).toHaveProperty('GlyphDocument');
    expect(runtime).toHaveProperty('registerComponent');
    expect(runtime).toHaveProperty('setTheme');
    expect(typeof runtime.GlyphDocument).toBe('function');
    expect(typeof runtime.registerComponent).toBe('function');
    expect(typeof runtime.setTheme).toBe('function');
  });

  it('accepts config with theme option', () => {
    const runtime = createGlyphRuntime({ theme: 'dark' });
    expect(runtime).toBeDefined();
  });

  it('accepts config with onDiagnostic callback', () => {
    const onDiagnostic = () => {};
    const runtime = createGlyphRuntime({ onDiagnostic });
    expect(runtime).toBeDefined();
  });

  it('accepts config with onNavigate callback', () => {
    const onNavigate = () => {};
    const runtime = createGlyphRuntime({ onNavigate });
    expect(runtime).toBeDefined();
  });

  it('accepts config with overrides', () => {
    const MyHeading = ({ block }: { block: unknown; layout: unknown }) => (
      <div data-testid="custom-heading">Custom</div>
    );
    const runtime = createGlyphRuntime({
      overrides: { heading: MyHeading },
    });
    expect(runtime).toBeDefined();
  });

  it('accepts config with components array', () => {
    const definition = {
      type: 'ui:test' as const,
      schema: {
        parse: (data: unknown) => data,
        safeParse: (data: unknown) => ({ success: true, data }),
      },
      render: () => <div>Test</div>,
    };
    const runtime = createGlyphRuntime({ components: [definition] });
    expect(runtime).toBeDefined();
  });
});
