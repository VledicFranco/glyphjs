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
import {
  resolveTheme as resolveThemeObject,
  createResolveVar,
  isDarkTheme,
} from './theme/resolve.js';
import { ThemeContext } from './theme/context.js';

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
  const resolvedThemeObject = useMemo(() => resolveThemeObject(theme), [theme]);

  const resolvedTheme = useMemo<GlyphThemeContext>(
    () => ({
      name: resolvedThemeObject.name,
      resolveVar: createResolveVar(resolvedThemeObject),
      isDark: isDarkTheme(resolvedThemeObject),
    }),
    [resolvedThemeObject],
  );

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

  // Build inline style object from the resolved theme's CSS variables
  const style = useMemo<Record<string, string>>(
    () => ({ ...resolvedThemeObject.variables }),
    [resolvedThemeObject],
  );

  return (
    <RuntimeContext value={value}>
      <ThemeContext value={resolvedTheme}>
        <div data-glyph-theme={resolvedThemeObject.name} style={style}>
          {children}
        </div>
      </ThemeContext>
    </RuntimeContext>
  );
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
