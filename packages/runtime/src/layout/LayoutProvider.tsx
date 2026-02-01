import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { LayoutHints } from '@glyphjs/types';

// ─── Default layout ──────────────────────────────────────────

const defaultLayout: LayoutHints = {
  mode: 'document',
  spacing: 'normal',
};

// ─── Context ─────────────────────────────────────────────────

const LayoutContext = createContext<LayoutHints>(defaultLayout);

// ─── Provider ────────────────────────────────────────────────

interface LayoutProviderProps {
  layout: LayoutHints;
  children: ReactNode;
}

/**
 * Provides layout hints to the component tree.
 * Wraps children in a `LayoutContext` so any descendant
 * can call `useLayout()` to access the active layout.
 */
export function LayoutProvider({
  layout,
  children,
}: LayoutProviderProps): ReactNode {
  return <LayoutContext value={layout}>{children}</LayoutContext>;
}

// ─── Hook ────────────────────────────────────────────────────

/**
 * Access the current layout hints from the nearest `LayoutProvider`.
 * Falls back to the default document layout if no provider is found.
 */
export function useLayout(): LayoutHints {
  return useContext(LayoutContext);
}
