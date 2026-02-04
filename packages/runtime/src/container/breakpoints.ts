import type { ContainerTier } from '@glyphjs/types';

// ─── Breakpoint Thresholds ───────────────────────────────────
// 16px hysteresis dead zone prevents layout thrashing when the
// container width hovers near a boundary.

const COMPACT_UP = 500;
const COMPACT_DOWN = 484; // 500 - 16
const WIDE_UP = 900;
const WIDE_DOWN = 884; // 900 - 16

/**
 * Resolves the container tier from a measured width with hysteresis.
 *
 * When growing, transitions use the higher threshold (500, 900).
 * When shrinking, transitions use the lower threshold (484, 884).
 * A width of 0 (not yet measured) defaults to `'wide'`.
 */
export function resolveTier(width: number, previous: ContainerTier): ContainerTier {
  if (width === 0) return 'wide';

  switch (previous) {
    case 'compact':
      if (width >= WIDE_UP) return 'wide';
      if (width >= COMPACT_UP) return 'standard';
      return 'compact';
    case 'standard':
      if (width >= WIDE_UP) return 'wide';
      if (width < COMPACT_DOWN) return 'compact';
      return 'standard';
    case 'wide':
      if (width < COMPACT_DOWN) return 'compact';
      if (width < WIDE_DOWN) return 'standard';
      return 'wide';
  }
}
