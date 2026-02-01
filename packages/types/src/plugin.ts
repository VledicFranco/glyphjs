import type { Block, LayoutHints, Reference } from './ir.js';
import type { GlyphThemeContext } from './runtime.js';

// ─── Plugin System ────────────────────────────────────────────

/**
 * Definition for a Glyph UI component plugin.
 * The `schema` field uses Zod but is typed loosely here to avoid
 * a hard dependency on zod in this type-only package.
 */
export interface GlyphComponentDefinition<T = unknown> {
  type: `ui:${string}`;
  schema: { parse: (data: unknown) => T; safeParse: (data: unknown) => { success: boolean; data?: T; error?: unknown } };
  render: ComponentType<GlyphComponentProps<T>>;
  themeDefaults?: Record<string, string>;
  dependencies?: string[];
}

export interface GlyphComponentProps<T = unknown> {
  data: T;
  block: Block;
  outgoingRefs: Reference[];
  incomingRefs: Reference[];
  onNavigate: (ref: Reference) => void;
  theme: GlyphThemeContext;
  layout: LayoutHints;
}

/**
 * Minimal React component type to avoid depending on @types/react.
 * Compatible with React.ComponentType<P>.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ComponentType<P = {}> =
  | ((props: P) => unknown)
  | (new (props: P) => unknown);
