import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createGlyphRuntime } from '../create-runtime.js';
import type { Block, BlockProps } from '@glyphjs/types';
import { createTestIR, paragraphBlock } from './helpers.js';

/**
 * A component that always throws during render, for testing the ErrorBoundary.
 */
function ThrowingComponent(): never {
  throw new Error('Intentional test error');
}

describe('ErrorBoundary', () => {
  it('renders fallback UI when a block renderer throws', () => {
    // Suppress React error boundary console.error noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function ExplodingHeading({ block }: BlockProps) {
      throw new Error('Boom!');
    }

    const runtime = createGlyphRuntime({
      overrides: { heading: ExplodingHeading },
    });

    const ir = createTestIR([
      {
        id: 'bad-block',
        type: 'heading',
        data: { depth: 1, children: [{ type: 'text', value: 'Fail' }] },
        position: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
      },
    ]);

    render(<runtime.GlyphDocument ir={ir} />);

    // The error boundary should render an error message
    expect(screen.getByText(/Render error in block/)).toBeInTheDocument();
    expect(screen.getByText(/bad-block/)).toBeInTheDocument();
    expect(screen.getByText(/Boom!/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('does not crash siblings when one block throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function ExplodingParagraph({ block }: BlockProps) {
      throw new Error('Paragraph exploded');
    }

    const runtime = createGlyphRuntime({
      overrides: { paragraph: ExplodingParagraph },
    });

    const ir = createTestIR([
      {
        id: 'good-heading',
        type: 'heading',
        data: { depth: 1, children: [{ type: 'text', value: 'Safe Heading' }] },
        position: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
      },
      {
        id: 'bad-para',
        type: 'paragraph',
        data: { children: [{ type: 'text', value: 'Will explode' }] },
        position: { start: { line: 2, column: 1 }, end: { line: 2, column: 1 } },
      },
    ]);

    render(<runtime.GlyphDocument ir={ir} />);

    // The safe heading should still render
    expect(screen.getByText('Safe Heading')).toBeInTheDocument();
    // The error boundary catches the paragraph error
    expect(screen.getByText(/Render error in block/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('calls onDiagnostic with the error details', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const onDiagnostic = vi.fn();

    function ExplodingBlock({ block }: BlockProps) {
      throw new Error('Diagnostic test');
    }

    const runtime = createGlyphRuntime({
      onDiagnostic,
      overrides: { heading: ExplodingBlock },
    });

    const ir = createTestIR([
      {
        id: 'diag-block',
        type: 'heading',
        data: { depth: 1, children: [{ type: 'text', value: 'Fail' }] },
        position: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
      },
    ]);

    render(<runtime.GlyphDocument ir={ir} />);

    expect(onDiagnostic).toHaveBeenCalledTimes(1);

    const diagnostic = onDiagnostic.mock.calls[0][0];
    expect(diagnostic.severity).toBe('error');
    expect(diagnostic.code).toBe('RUNTIME_RENDER_ERROR');
    expect(diagnostic.message).toContain('diag-block');
    expect(diagnostic.message).toContain('heading');
    expect(diagnostic.message).toContain('Diagnostic test');
    expect(diagnostic.source).toBe('runtime');
    expect(diagnostic.details).toHaveProperty('blockId', 'diag-block');
    expect(diagnostic.details).toHaveProperty('blockType', 'heading');

    consoleSpy.mockRestore();
  });
});
