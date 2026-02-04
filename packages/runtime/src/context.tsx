import { createContext, useContext, useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type {
  Block,
  Reference,
  GlyphTheme,
  GlyphThemeContext,
  Diagnostic,
  InteractionEvent,
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
  documentId: string;
  theme: GlyphThemeContext;
  onDiagnostic: (diagnostic: Diagnostic) => void;
  onNavigate: (ref: Reference, targetBlock: Block) => void;
  onInteraction?: (event: InteractionEvent) => void;
}

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export interface RuntimeProviderProps {
  registry: ComponentRegistry;
  references: Reference[];
  documentId: string;
  theme: 'light' | 'dark' | GlyphTheme | undefined;
  /** Optional CSS class name applied to the runtime wrapper div. */
  className?: string;
  /** Optional inline styles merged with (and overriding) theme CSS variables. */
  style?: CSSProperties;
  onDiagnostic?: (diagnostic: Diagnostic) => void;
  onNavigate?: (ref: Reference, targetBlock: Block) => void;
  onInteraction?: (event: InteractionEvent) => void;
  children: ReactNode;
}

export function RuntimeProvider({
  registry,
  references,
  documentId,
  theme,
  className,
  style: consumerStyle,
  onDiagnostic,
  onNavigate,
  onInteraction,
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
      documentId,
      theme: resolvedTheme,
      onDiagnostic: onDiagnostic ?? noop,
      onNavigate: onNavigate ?? noop,
      onInteraction,
    }),
    [registry, references, documentId, resolvedTheme, onDiagnostic, onNavigate, onInteraction],
  );

  // Build inline style object from the resolved theme's CSS variables.
  // Consumer style wins over theme variables for intentional overrides.
  const style = useMemo<Record<string, string>>(
    () => ({ ...resolvedThemeObject.variables, ...(consumerStyle as Record<string, string>) }),
    [resolvedThemeObject, consumerStyle],
  );

  return (
    <RuntimeContext value={value}>
      <ThemeContext value={resolvedTheme}>
        <div data-glyph-theme={resolvedThemeObject.name} className={className} style={style}>
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
