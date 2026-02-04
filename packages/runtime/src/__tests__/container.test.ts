import { describe, it, expect } from 'vitest';
import { resolveTier } from '../container/breakpoints.js';

describe('resolveTier', () => {
  // ── Default when not yet measured ────────────────────────────
  it('returns "wide" when width is 0 (not yet measured)', () => {
    expect(resolveTier(0, 'wide')).toBe('wide');
    expect(resolveTier(0, 'compact')).toBe('wide');
    expect(resolveTier(0, 'standard')).toBe('wide');
  });

  // ── From compact ────────────────────────────────────────────
  describe('previous = compact', () => {
    it('stays compact below 500', () => {
      expect(resolveTier(499, 'compact')).toBe('compact');
      expect(resolveTier(350, 'compact')).toBe('compact');
      expect(resolveTier(1, 'compact')).toBe('compact');
    });

    it('transitions to standard at 500', () => {
      expect(resolveTier(500, 'compact')).toBe('standard');
    });

    it('transitions to wide at 900', () => {
      expect(resolveTier(900, 'compact')).toBe('wide');
      expect(resolveTier(1200, 'compact')).toBe('wide');
    });
  });

  // ── From standard ───────────────────────────────────────────
  describe('previous = standard', () => {
    it('stays standard within hysteresis zone (484–899)', () => {
      expect(resolveTier(484, 'standard')).toBe('standard');
      expect(resolveTier(500, 'standard')).toBe('standard');
      expect(resolveTier(700, 'standard')).toBe('standard');
      expect(resolveTier(899, 'standard')).toBe('standard');
    });

    it('transitions to compact below 484', () => {
      expect(resolveTier(483, 'standard')).toBe('compact');
      expect(resolveTier(400, 'standard')).toBe('compact');
    });

    it('transitions to wide at 900', () => {
      expect(resolveTier(900, 'standard')).toBe('wide');
      expect(resolveTier(1200, 'standard')).toBe('wide');
    });
  });

  // ── From wide ───────────────────────────────────────────────
  describe('previous = wide', () => {
    it('stays wide within hysteresis zone (≥884)', () => {
      expect(resolveTier(884, 'wide')).toBe('wide');
      expect(resolveTier(900, 'wide')).toBe('wide');
      expect(resolveTier(1920, 'wide')).toBe('wide');
    });

    it('transitions to standard below 884', () => {
      expect(resolveTier(883, 'wide')).toBe('standard');
      expect(resolveTier(500, 'wide')).toBe('standard');
    });

    it('transitions to compact below 484', () => {
      expect(resolveTier(483, 'wide')).toBe('compact');
      expect(resolveTier(350, 'wide')).toBe('compact');
    });
  });

  // ── Hysteresis round-trip ───────────────────────────────────
  describe('hysteresis prevents thrashing', () => {
    it('compact→standard→hovering near 500 stays standard', () => {
      // Start compact, cross 500 → standard
      const tier1 = resolveTier(500, 'compact');
      expect(tier1).toBe('standard');

      // Drop to 490 — still standard (hysteresis down-threshold is 484)
      const tier2 = resolveTier(490, tier1);
      expect(tier2).toBe('standard');

      // Drop to 484 — still standard
      const tier3 = resolveTier(484, tier2);
      expect(tier3).toBe('standard');

      // Drop to 483 — now compact
      const tier4 = resolveTier(483, tier3);
      expect(tier4).toBe('compact');
    });

    it('standard→wide→hovering near 900 stays wide', () => {
      const tier1 = resolveTier(900, 'standard');
      expect(tier1).toBe('wide');

      const tier2 = resolveTier(890, tier1);
      expect(tier2).toBe('wide');

      const tier3 = resolveTier(884, tier2);
      expect(tier3).toBe('wide');

      const tier4 = resolveTier(883, tier3);
      expect(tier4).toBe('standard');
    });
  });
});
