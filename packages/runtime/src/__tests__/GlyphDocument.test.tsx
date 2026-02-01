import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createGlyphRuntime } from '../create-runtime.js';
import {
  createTestIR,
  headingBlock,
  paragraphBlock,
} from './helpers.js';

describe('GlyphDocument', () => {
  it('renders a heading block into a heading DOM element', () => {
    const runtime = createGlyphRuntime({});
    const ir = createTestIR([headingBlock('Hello World', 1)]);

    render(<runtime.GlyphDocument ir={ir} />);

    const heading = screen.getByText('Hello World');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });

  it('renders a paragraph block into a <p> element', () => {
    const runtime = createGlyphRuntime({});
    const ir = createTestIR([paragraphBlock('Some text')]);

    render(<runtime.GlyphDocument ir={ir} />);

    const paragraph = screen.getByText('Some text');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph.tagName).toBe('P');
  });

  it('renders multiple blocks in order', () => {
    const runtime = createGlyphRuntime({});
    const ir = createTestIR([
      headingBlock('Title', 1, 'h1'),
      paragraphBlock('First paragraph', 'p1'),
      paragraphBlock('Second paragraph', 'p2'),
    ]);

    render(<runtime.GlyphDocument ir={ir} />);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });

  it('renders an empty IR without error', () => {
    const runtime = createGlyphRuntime({});
    const ir = createTestIR([]);

    const { container } = render(<runtime.GlyphDocument ir={ir} />);

    const docEl = container.querySelector('[data-glyph-document="test-doc"]');
    expect(docEl).toBeInTheDocument();
  });

  it('applies className to the document wrapper', () => {
    const runtime = createGlyphRuntime({});
    const ir = createTestIR([]);

    const { container } = render(
      <runtime.GlyphDocument ir={ir} className="my-doc" />,
    );

    const docEl = container.querySelector('.my-doc');
    expect(docEl).toBeInTheDocument();
  });

  it('renders different heading depths correctly', () => {
    const runtime = createGlyphRuntime({});
    const ir = createTestIR([
      headingBlock('H2 Title', 2, 'h2'),
      headingBlock('H3 Title', 3, 'h3'),
    ]);

    render(<runtime.GlyphDocument ir={ir} />);

    expect(screen.getByText('H2 Title').tagName).toBe('H2');
    expect(screen.getByText('H3 Title').tagName).toBe('H3');
  });
});
