import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createGlyphRuntime } from '../create-runtime.js';
import {
  createTestIR,
  headingBlock,
  paragraphBlock,
} from './helpers.js';

describe('Layout system', () => {
  describe('Document layout', () => {
    it('renders with data-glyph-layout="document"', () => {
      const runtime = createGlyphRuntime({});
      const ir = createTestIR(
        [paragraphBlock('Document text')],
        { mode: 'document' },
      );

      const { container } = render(<runtime.GlyphDocument ir={ir} />);

      const layoutDiv = container.querySelector(
        '[data-glyph-layout="document"]',
      );
      expect(layoutDiv).not.toBeNull();
    });

    it('renders blocks in a single column (flex column)', () => {
      const runtime = createGlyphRuntime({});
      const ir = createTestIR(
        [
          paragraphBlock('First', 'p1'),
          paragraphBlock('Second', 'p2'),
        ],
        { mode: 'document' },
      );

      const { container } = render(<runtime.GlyphDocument ir={ir} />);

      const layoutDiv = container.querySelector(
        '[data-glyph-layout="document"]',
      );
      expect(layoutDiv).not.toBeNull();
      expect(layoutDiv!.style.flexDirection).toBe('column');
    });

    it('applies maxWidth from layout config', () => {
      const runtime = createGlyphRuntime({});
      const ir = createTestIR(
        [paragraphBlock('Limited width')],
        { mode: 'document', maxWidth: '800px' },
      );

      const { container } = render(<runtime.GlyphDocument ir={ir} />);

      const layoutDiv = container.querySelector(
        '[data-glyph-layout="document"]',
      );
      expect(layoutDiv!.style.maxWidth).toBe('800px');
    });

    it('defaults to document layout when mode is not specified', () => {
      const runtime = createGlyphRuntime({});
      // Layout object with just the mode field set to document
      const ir = createTestIR(
        [paragraphBlock('Default layout')],
        { mode: 'document' },
      );

      const { container } = render(<runtime.GlyphDocument ir={ir} />);

      const layoutDiv = container.querySelector(
        '[data-glyph-layout="document"]',
      );
      expect(layoutDiv).not.toBeNull();
    });
  });

  describe('Dashboard layout', () => {
    it('renders with data-glyph-layout="dashboard"', () => {
      const runtime = createGlyphRuntime({});
      const ir = createTestIR(
        [paragraphBlock('Dashboard text')],
        { mode: 'dashboard' },
      );

      const { container } = render(<runtime.GlyphDocument ir={ir} />);

      const layoutDiv = container.querySelector(
        '[data-glyph-layout="dashboard"]',
      );
      expect(layoutDiv).not.toBeNull();
    });

    it('renders as a CSS grid', () => {
      const runtime = createGlyphRuntime({});
      const ir = createTestIR(
        [
          paragraphBlock('Cell 1', 'cell1'),
          paragraphBlock('Cell 2', 'cell2'),
        ],
        { mode: 'dashboard', columns: 2 },
      );

      const { container } = render(<runtime.GlyphDocument ir={ir} />);

      const layoutDiv = container.querySelector(
        '[data-glyph-layout="dashboard"]',
      );
      expect(layoutDiv).not.toBeNull();
      expect(layoutDiv!.style.display).toBe('grid');
      expect(layoutDiv!.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
    });

    it('defaults to 2 columns when columns is not specified', () => {
      const runtime = createGlyphRuntime({});
      const ir = createTestIR(
        [paragraphBlock('Grid item')],
        { mode: 'dashboard' },
      );

      const { container } = render(<runtime.GlyphDocument ir={ir} />);

      const layoutDiv = container.querySelector(
        '[data-glyph-layout="dashboard"]',
      );
      expect(layoutDiv!.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
    });
  });

  describe('Presentation layout', () => {
    it('renders with data-glyph-layout="presentation"', () => {
      const runtime = createGlyphRuntime({});
      const ir = createTestIR(
        [paragraphBlock('Slide 1')],
        { mode: 'presentation' },
      );

      const { container } = render(<runtime.GlyphDocument ir={ir} />);

      const layoutDiv = container.querySelector(
        '[data-glyph-layout="presentation"]',
      );
      expect(layoutDiv).not.toBeNull();
    });

    it('shows a slide indicator', () => {
      const runtime = createGlyphRuntime({});
      const ir = createTestIR(
        [
          paragraphBlock('Slide 1', 'slide1'),
          paragraphBlock('Slide 2', 'slide2'),
        ],
        { mode: 'presentation' },
      );

      render(<runtime.GlyphDocument ir={ir} />);

      // Should show "1 / 2" as the slide indicator
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('renders only the first slide initially', () => {
      const runtime = createGlyphRuntime({});
      const ir = createTestIR(
        [
          paragraphBlock('First slide', 'slide1'),
          paragraphBlock('Second slide', 'slide2'),
        ],
        { mode: 'presentation' },
      );

      render(<runtime.GlyphDocument ir={ir} />);

      expect(screen.getByText('First slide')).toBeInTheDocument();
      // Second slide should not be visible initially
      expect(screen.queryByText('Second slide')).not.toBeInTheDocument();
    });

    it('renders nothing for empty block list', () => {
      const runtime = createGlyphRuntime({});
      const ir = createTestIR([], { mode: 'presentation' });

      const { container } = render(<runtime.GlyphDocument ir={ir} />);

      // PresentationLayout returns null for empty blocks
      const layoutDiv = container.querySelector(
        '[data-glyph-layout="presentation"]',
      );
      expect(layoutDiv).toBeNull();
    });
  });
});
