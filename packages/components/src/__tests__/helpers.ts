import type { GlyphComponentProps } from '@glyphjs/types';

export function createMockProps<T>(data: T, type: string): GlyphComponentProps<T> {
  return {
    data,
    block: {
      id: 'test-block',
      type: type as GlyphComponentProps<T>['block']['type'],
      data,
      position: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    },
    outgoingRefs: [],
    incomingRefs: [],
    onNavigate: () => {},
    theme: { name: 'light', resolveVar: (_v: string) => '', isDark: false },
    layout: { mode: 'document' },
    container: { width: 0, tier: 'wide' },
  };
}
