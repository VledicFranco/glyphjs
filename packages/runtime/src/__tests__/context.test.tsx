// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
  RuntimeProvider,
  useRuntime,
  useReferences,
} from '../context.js';
import type { RuntimeContextValue } from '../context.js';
import { PluginRegistry } from '../plugins/registry.js';
import type { Reference } from '@glyphjs/types';
import type { ReactNode } from 'react';

// ─── Shared helpers ────────────────────────────────────────────

function createWrapper(
  overrides: {
    references?: Reference[];
    theme?: 'light' | 'dark';
  } = {},
) {
  const registry = new PluginRegistry();
  const references = overrides.references ?? [];
  const theme = overrides.theme ?? 'light';

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <RuntimeProvider
        registry={registry}
        references={references}
        theme={theme}
      >
        {children}
      </RuntimeProvider>
    );
  };
}

// ─── useRuntime ────────────────────────────────────────────────

describe('useRuntime', () => {
  it('throws when used outside RuntimeProvider', () => {
    // Suppress console.error noise from React when a component throws
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useRuntime());
    }).toThrow('useRuntime() must be used within a <RuntimeProvider>');

    consoleSpy.mockRestore();
  });

  it('returns context value when used inside RuntimeProvider', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useRuntime(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.registry).toBeDefined();
    expect(result.current.references).toEqual([]);
    expect(result.current.theme).toBeDefined();
    expect(typeof result.current.onDiagnostic).toBe('function');
    expect(typeof result.current.onNavigate).toBe('function');
  });

  it('provides the correct theme context', () => {
    const wrapper = createWrapper({ theme: 'dark' });

    const { result } = renderHook(() => useRuntime(), { wrapper });

    expect(result.current.theme.isDark).toBe(true);
    expect(result.current.theme.name).toContain('dark');
  });
});

// ─── useReferences ─────────────────────────────────────────────

describe('useReferences', () => {
  const refs: Reference[] = [
    {
      id: 'ref-1',
      type: 'navigates-to',
      sourceBlockId: 'block-a',
      targetBlockId: 'block-b',
    },
    {
      id: 'ref-2',
      type: 'details',
      sourceBlockId: 'block-c',
      targetBlockId: 'block-a',
    },
    {
      id: 'ref-3',
      type: 'depends-on',
      sourceBlockId: 'block-a',
      targetBlockId: 'block-d',
      bidirectional: true,
    },
  ];

  it('returns outgoing references for a source block', () => {
    const wrapper = createWrapper({ references: refs });

    const { result } = renderHook(() => useReferences('block-a'), {
      wrapper,
    });

    // block-a is source for ref-1 and ref-3 (2 outgoing)
    expect(result.current.outgoingRefs).toHaveLength(2);
    // ref-1: sourceBlockId=block-a => outgoing
    expect(result.current.outgoingRefs.some((r) => r.id === 'ref-1')).toBe(true);
    // ref-3: sourceBlockId=block-a => outgoing
    expect(result.current.outgoingRefs.some((r) => r.id === 'ref-3')).toBe(true);
  });

  it('returns incoming references for a target block', () => {
    const wrapper = createWrapper({ references: refs });

    const { result } = renderHook(() => useReferences('block-b'), {
      wrapper,
    });

    // block-b is target for ref-1
    expect(result.current.incomingRefs).toHaveLength(1);
    expect(result.current.incomingRefs[0].id).toBe('ref-1');
  });

  it('handles bidirectional references correctly', () => {
    const wrapper = createWrapper({ references: refs });

    // For block-d which is the target of bidirectional ref-3
    const { result } = renderHook(() => useReferences('block-d'), {
      wrapper,
    });

    // block-d is targetBlockId of ref-3 => incoming
    expect(result.current.incomingRefs.some((r) => r.id === 'ref-3')).toBe(true);
    // ref-3 is bidirectional and block-d is target but not source => outgoing too
    expect(result.current.outgoingRefs.some((r) => r.id === 'ref-3')).toBe(true);
  });

  it('returns empty arrays when no references match', () => {
    const wrapper = createWrapper({ references: refs });

    const { result } = renderHook(() => useReferences('block-z'), {
      wrapper,
    });

    expect(result.current.incomingRefs).toHaveLength(0);
    expect(result.current.outgoingRefs).toHaveLength(0);
  });

  it('returns empty arrays when there are no references at all', () => {
    const wrapper = createWrapper({ references: [] });

    const { result } = renderHook(() => useReferences('block-a'), {
      wrapper,
    });

    expect(result.current.incomingRefs).toHaveLength(0);
    expect(result.current.outgoingRefs).toHaveLength(0);
  });
});

// ─── RuntimeProvider ───────────────────────────────────────────

describe('RuntimeProvider', () => {
  it('provides context to children', () => {
    const registry = new PluginRegistry();

    function Consumer() {
      const ctx = useRuntime();
      return <div data-testid="has-context">{ctx.theme.name}</div>;
    }

    render(
      <RuntimeProvider
        registry={registry}
        references={[]}
        theme="light"
      >
        <Consumer />
      </RuntimeProvider>,
    );

    expect(screen.getByTestId('has-context')).toBeInTheDocument();
    expect(screen.getByTestId('has-context').textContent).toContain('light');
  });

  it('passes references through to consumers', () => {
    const registry = new PluginRegistry();
    const refs: Reference[] = [
      {
        id: 'ref-x',
        type: 'navigates-to',
        sourceBlockId: 'src',
        targetBlockId: 'tgt',
      },
    ];

    function Consumer() {
      const ctx = useRuntime();
      return (
        <div data-testid="ref-count">{ctx.references.length}</div>
      );
    }

    render(
      <RuntimeProvider
        registry={registry}
        references={refs}
        theme="light"
      >
        <Consumer />
      </RuntimeProvider>,
    );

    expect(screen.getByTestId('ref-count').textContent).toBe('1');
  });

  it('uses default noop callbacks when onDiagnostic and onNavigate are not provided', () => {
    const registry = new PluginRegistry();

    function Consumer() {
      const ctx = useRuntime();
      // Calling the noop callbacks should not throw
      ctx.onDiagnostic({
        severity: 'warning',
        code: 'TEST',
        message: 'test',
        source: 'runtime',
      });
      ctx.onNavigate(
        {
          id: 'ref-1',
          type: 'navigates-to',
          sourceBlockId: 'a',
          targetBlockId: 'b',
        },
        {
          id: 'b',
          type: 'paragraph',
          data: {},
          position: {
            start: { line: 1, column: 1 },
            end: { line: 1, column: 1 },
          },
        },
      );
      return <div data-testid="noop-ok">ok</div>;
    }

    render(
      <RuntimeProvider
        registry={registry}
        references={[]}
        theme="light"
      >
        <Consumer />
      </RuntimeProvider>,
    );

    expect(screen.getByTestId('noop-ok')).toBeInTheDocument();
  });

  it('wraps children in a themed div with data-glyph-theme attribute', () => {
    const registry = new PluginRegistry();

    render(
      <RuntimeProvider
        registry={registry}
        references={[]}
        theme="dark"
      >
        <span data-testid="child">Hello</span>
      </RuntimeProvider>,
    );

    const child = screen.getByTestId('child');
    // The parent div should have the data-glyph-theme attribute
    const themedDiv = child.closest('[data-glyph-theme]');
    expect(themedDiv).not.toBeNull();
    expect(themedDiv!.getAttribute('data-glyph-theme')).toContain('dark');
  });

  it('calls custom onDiagnostic when provided', () => {
    const registry = new PluginRegistry();
    const onDiagnostic = vi.fn();

    function Consumer() {
      const ctx = useRuntime();
      ctx.onDiagnostic({
        severity: 'error',
        code: 'CUSTOM_ERROR',
        message: 'Something broke',
        source: 'runtime',
      });
      return <div data-testid="diag-consumer">done</div>;
    }

    render(
      <RuntimeProvider
        registry={registry}
        references={[]}
        theme="light"
        onDiagnostic={onDiagnostic}
      >
        <Consumer />
      </RuntimeProvider>,
    );

    expect(onDiagnostic).toHaveBeenCalledTimes(1);
    expect(onDiagnostic).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        code: 'CUSTOM_ERROR',
        message: 'Something broke',
      }),
    );
  });
});
