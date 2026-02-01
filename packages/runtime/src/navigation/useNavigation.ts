import { useCallback, useRef } from 'react';
import type { Reference, Block } from '@glyphjs/types';
import { useRuntime } from '../context.js';

// ─── Constants ────────────────────────────────────────────────

const HIGHLIGHT_DURATION_MS = 1500;
const SCROLL_BEHAVIOR: ScrollBehavior = 'smooth';
const BLOCK_SELECTOR_PREFIX = 'data-glyph-block';

// ─── Hook ─────────────────────────────────────────────────────

export interface NavigationResult {
  /**
   * Smooth-scroll to a block by ID, highlight it briefly, and
   * move focus. Also fires the runtime `onNavigate` callback.
   */
  navigateTo: (blockId: string, ref?: Reference) => void;
}

/**
 * Provides cross-block navigation utilities.
 *
 * - Smooth-scrolls the target block into view
 * - Applies a temporary highlight via a `data-glyph-highlight` attribute
 * - Moves DOM focus to the block for keyboard users
 * - Announces the navigation to screen readers via an `aria-live` region
 * - Invokes the `onNavigate` callback from the runtime config
 */
export function useNavigation(): NavigationResult {
  const { onNavigate, references } = useRuntime();
  const announcerRef = useRef<HTMLDivElement | null>(null);

  const navigateTo = useCallback(
    (blockId: string, ref?: Reference) => {
      // Find the DOM element for the target block
      const el = document.querySelector(
        `[${BLOCK_SELECTOR_PREFIX}="${blockId}"]`,
      );

      if (!el || !(el instanceof HTMLElement)) {
        return;
      }

      // 1. Smooth-scroll into view
      el.scrollIntoView({ behavior: SCROLL_BEHAVIOR, block: 'center' });

      // 2. Apply highlight attribute (consumers style via CSS)
      el.setAttribute('data-glyph-highlight', 'true');
      setTimeout(() => {
        el.removeAttribute('data-glyph-highlight');
      }, HIGHLIGHT_DURATION_MS);

      // 3. Move focus for keyboard / assistive-tech users
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '-1');
      }
      el.focus({ preventScroll: true });

      // 4. Screen reader announcement via aria-live
      announceNavigation(blockId, announcerRef);

      // 5. Fire the runtime onNavigate callback
      if (ref) {
        // Build a minimal target block representation for the callback
        const targetBlock: Block = {
          id: blockId,
          type: 'paragraph',
          data: {},
          position: {
            start: { line: 0, column: 0 },
            end: { line: 0, column: 0 },
          },
        };
        onNavigate(ref, targetBlock);
      } else if (references.length > 0) {
        // Try to find a matching reference
        const matchedRef = references.find(
          (r) => r.targetBlockId === blockId || r.sourceBlockId === blockId,
        );
        if (matchedRef) {
          const targetBlock: Block = {
            id: blockId,
            type: 'paragraph',
            data: {},
            position: {
              start: { line: 0, column: 0 },
              end: { line: 0, column: 0 },
            },
          };
          onNavigate(matchedRef, targetBlock);
        }
      }
    },
    [onNavigate, references],
  );

  return { navigateTo };
}

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Inserts (or reuses) a visually-hidden aria-live region and
 * announces the navigation target to screen readers.
 */
function announceNavigation(
  blockId: string,
  ref: React.RefObject<HTMLDivElement | null>,
): void {
  let announcer = ref.current;

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('role', 'status');
    // Visually hidden but available to screen readers
    Object.assign(announcer.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });
    document.body.appendChild(announcer);
    ref.current = announcer;
  }

  announcer.textContent = `Navigated to block ${blockId}`;
}
