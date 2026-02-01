import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createGlyphRuntime } from '../create-runtime.js';
import type { BlockProps } from '@glyphjs/types';
import {
  createTestIR,
  headingBlock,
  paragraphBlock,
  unknownBlock,
} from './helpers.js';

describe('BlockRenderer', () => {
  it('routes heading blocks to the built-in heading renderer', () => {
    const runtime = createGlyphRuntime({});
    const ir = createTestIR([headingBlock('Built-in heading', 1)]);

    render(<runtime.GlyphDocument ir={ir} />);

    const heading = screen.getByText('Built-in heading');
    expect(heading.tagName).toBe('H1');
  });

  it('routes paragraph blocks to the built-in paragraph renderer', () => {
    const runtime = createGlyphRuntime({});
    const ir = createTestIR([paragraphBlock('Built-in paragraph')]);

    render(<runtime.GlyphDocument ir={ir} />);

    const para = screen.getByText('Built-in paragraph');
    expect(para.tagName).toBe('P');
  });

  it('uses an override renderer when one is provided', () => {
    function CustomHeading({ block }: BlockProps) {
      return <div data-testid="custom-heading">OVERRIDE</div>;
    }

    const runtime = createGlyphRuntime({
      overrides: { heading: CustomHeading },
    });
    const ir = createTestIR([headingBlock('Original', 1)]);

    render(<runtime.GlyphDocument ir={ir} />);

    expect(screen.getByTestId('custom-heading')).toBeInTheDocument();
    expect(screen.getByText('OVERRIDE')).toBeInTheDocument();
    // The original heading text should NOT appear because override fully replaces
    expect(screen.queryByText('Original')).not.toBeInTheDocument();
  });

  it('renders fallback for unknown block types', () => {
    const runtime = createGlyphRuntime({});
    const ir = createTestIR([
      unknownBlock('fancy-widget', { value: 42 }),
    ]);

    render(<runtime.GlyphDocument ir={ir} />);

    expect(screen.getByText(/Unknown block type/)).toBeInTheDocument();
    expect(screen.getByText(/fancy-widget/)).toBeInTheDocument();
  });

  it('renders multiple block types together', () => {
    const runtime = createGlyphRuntime({});
    const ir = createTestIR([
      headingBlock('Title', 1, 'h1'),
      paragraphBlock('Paragraph text', 'p1'),
      unknownBlock('custom-block', { info: 'data' }, 'custom-1'),
    ]);

    render(<runtime.GlyphDocument ir={ir} />);

    expect(screen.getByText('Title').tagName).toBe('H1');
    expect(screen.getByText('Paragraph text').tagName).toBe('P');
    expect(screen.getByText(/Unknown block type/)).toBeInTheDocument();
  });
});
