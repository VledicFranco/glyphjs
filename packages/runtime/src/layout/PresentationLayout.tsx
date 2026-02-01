import { useState, useEffect, useCallback } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Block } from '@glyphjs/types';

// ─── Props ───────────────────────────────────────────────────

interface PresentationLayoutProps {
  blocks: Block[];
  renderBlock: (block: Block, index: number) => ReactNode;
}

// ─── Component ───────────────────────────────────────────────

/**
 * Presentation mode layout — full-viewport slides.
 *
 * Displays one block at a time with keyboard navigation
 * (left/up for previous, right/down/space for next).
 * Shows a slide indicator in the bottom-right corner.
 */
export function PresentationLayout({
  blocks,
  renderBlock,
}: PresentationLayoutProps): ReactNode {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = blocks.length;

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goPrev();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goNext, goPrev]);

  if (total === 0) {
    return null;
  }

  const currentBlock = blocks[currentIndex];

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  };

  const slideStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    boxSizing: 'border-box',
  };

  const indicatorStyle: CSSProperties = {
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    fontSize: '0.875rem',
    color: '#718096',
    fontFamily: 'sans-serif',
    userSelect: 'none',
  };

  return (
    <div style={containerStyle} data-glyph-layout="presentation">
      <div style={slideStyle}>
        {currentBlock ? renderBlock(currentBlock, currentIndex) : null}
      </div>
      <div style={indicatorStyle}>
        {String(currentIndex + 1)} / {String(total)}
      </div>
    </div>
  );
}
