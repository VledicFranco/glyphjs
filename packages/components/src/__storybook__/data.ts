import type { Block, LayoutHints, Reference } from '@glyphjs/types';
import type { GlyphThemeContext } from '@glyphjs/types';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Mock Block ────────────────────────────────────────────────

export function mockBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'mock-block-1',
    type: 'ui:callout',
    data: {},
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 10, column: 1, offset: 100 },
    },
    ...overrides,
  };
}

// ─── Mock Layout ───────────────────────────────────────────────

export function mockLayout(overrides?: Partial<LayoutHints>): LayoutHints {
  return {
    mode: 'document',
    columns: 1,
    maxWidth: '800px',
    spacing: 'normal',
    ...overrides,
  };
}

// ─── Mock Theme ────────────────────────────────────────────────

export function mockTheme(isDark = false): GlyphThemeContext {
  return {
    name: isDark ? 'dark' : 'light',
    resolveVar: () => '',
    isDark,
  };
}

// ─── Mock onNavigate ───────────────────────────────────────────

export const mockOnNavigate = (): void => {
  // noop — stub for storybook/tests
};

// ─── Mock References ───────────────────────────────────────────

export const emptyRefs: Reference[] = [];

// ─── Generic Props Builder ─────────────────────────────────────

export function mockProps<T>(
  data: T,
  overrides?: Partial<GlyphComponentProps<T>>,
): GlyphComponentProps<T> {
  return {
    data,
    block: mockBlock(),
    outgoingRefs: emptyRefs,
    incomingRefs: emptyRefs,
    onNavigate: mockOnNavigate,
    theme: mockTheme(),
    layout: mockLayout(),
    ...overrides,
  };
}
