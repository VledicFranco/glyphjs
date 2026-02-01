import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  Block,
  Reference,
  GlyphTheme,
  GlyphThemeContext,
  Diagnostic,
} from '@glyphjs/types';
import type { ComponentRegistry } from './registry.js';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

// ─── Runtime Context Value ────────────────────────────────────

export interface RuntimeContextValue {
  registry: ComponentRegistry;
  references: Reference[];
  theme: GlyphThemeContext;
  onDiagnostic: (diagnostic: Diagnostic) => void;
  onNavigate: (ref: Reference, targetBlock: Block) => void;
}

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

// ─── Theme resolution ─────────────────────────────────────────

function resolveTheme(
  theme: 'light' | 'dark' | GlyphTheme | undefined,
): GlyphThemeContext {
  if (!theme || theme === 'light') {
    return {
      name: 'light',
      resolveVar: () => '',
      isDark: false,
    };
  }
  if (theme === 'dark') {
    return {
      name: 'dark',
      resolveVar: () => '',
      isDark: true,
    };
  }
  // Custom GlyphTheme object
  return {
    name: theme.name,
    resolveVar: (varName: string) => theme.variables[varName] ?? '',
    isDark: theme.name.toLowerCase().includes('dark'),
  };
}

// ─── Provider ─────────────────────────────────────────────────

export interface RuntimeProviderProps {
  registry: ComponentRegistry;
  references: Reference[];
  theme: 'light' | 'dark' | GlyphTheme | undefined;
  onDiagnostic?: (diagnostic: Diagnostic) => void;
  onNavigate?: (ref: Reference, targetBlock: Block) => void;
  children: ReactNode;
}

export function RuntimeProvider({
  registry,
  references,
  theme,
  onDiagnostic,
  onNavigate,
  children,
}: RuntimeProviderProps): ReactNode {
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);

  const value = useMemo<RuntimeContextValue>(
    () => ({
      registry,
      references,
      theme: resolvedTheme,
      onDiagnostic: onDiagnostic ?? noop,
      onNavigate: onNavigate ?? noop,
    }),
    [registry, references, resolvedTheme, onDiagnostic, onNavigate],
  );

  return <RuntimeContext value={value}>{children}</RuntimeContext>;
}

// ─── Hooks ────────────────────────────────────────────────────

/** Access the full runtime context. Throws if used outside RuntimeProvider. */
export function useRuntime(): RuntimeContextValue {
  const ctx = useContext(RuntimeContext);
  if (!ctx) {
    throw new Error(
      'useRuntime() must be used within a <RuntimeProvider>. ' +
        'Did you forget to use createGlyphRuntime()?',
    );
  }
  return ctx;
}

/**
 * Get incoming and outgoing references for a specific block.
 */
export function useReferences(blockId: string): {
  incomingRefs: Reference[];
  outgoingRefs: Reference[];
} {
  const { references } = useRuntime();

  return useMemo(() => {
    const incoming: Reference[] = [];
    const outgoing: Reference[] = [];

    for (const ref of references) {
      if (ref.sourceBlockId === blockId) {
        outgoing.push(ref);
      }
      if (ref.targetBlockId === blockId) {
        incoming.push(ref);
      }
      // Bidirectional refs appear in both directions
      if (ref.bidirectional) {
        if (ref.targetBlockId === blockId && ref.sourceBlockId !== blockId) {
          outgoing.push(ref);
        }
        if (ref.sourceBlockId === blockId && ref.targetBlockId !== blockId) {
          incoming.push(ref);
        }
      }
    }

    return { incomingRefs: incoming, outgoingRefs: outgoing };
  }, [references, blockId]);
}
