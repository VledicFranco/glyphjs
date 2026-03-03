import type { Block, GlyphIR, LayoutHints, Reference } from './ir.js';
import type { InteractionEvent } from './interaction.js';
import type { Diagnostic } from './diagnostic.js';
import type { ComponentType, GlyphComponentDefinition } from './plugin.js';

// ─── Theme ────────────────────────────────────────────────────

/**
 * Tier 1 semantic tokens — the 53 CSS custom properties that every GlyphJS
 * theme must supply. Component-specific aliases (Tier 2) are no longer
 * TypeScript-required; they live in component styles as CSS fallback chains
 * so advanced users can still override them via plain CSS.
 */
export type GlyphThemeVarKey =
  // ── Core colors (10) ─────────────────────────────────────────
  | '--glyph-bg'
  | '--glyph-text'
  | '--glyph-text-muted'
  | '--glyph-heading'
  | '--glyph-link'
  | '--glyph-link-hover'
  | '--glyph-border'
  | '--glyph-border-strong'
  | '--glyph-surface'
  | '--glyph-surface-raised'
  // ── Accent (5) ───────────────────────────────────────────────
  | '--glyph-accent'
  | '--glyph-accent-hover'
  | '--glyph-accent-subtle'
  | '--glyph-accent-muted'
  | '--glyph-text-on-accent'
  // ── Code (2) ─────────────────────────────────────────────────
  | '--glyph-code-bg'
  | '--glyph-code-text'
  // ── Typography (3) ───────────────────────────────────────────
  | '--glyph-font-body'
  | '--glyph-font-heading'
  | '--glyph-font-mono'
  // ── Spacing (5) ──────────────────────────────────────────────
  | '--glyph-spacing-xs'
  | '--glyph-spacing-sm'
  | '--glyph-spacing-md'
  | '--glyph-spacing-lg'
  | '--glyph-spacing-xl'
  // ── Border radius (4) ────────────────────────────────────────
  | '--glyph-radius-xs'
  | '--glyph-radius-sm'
  | '--glyph-radius-md'
  | '--glyph-radius-lg'
  // ── Effects (7) ──────────────────────────────────────────────
  | '--glyph-shadow-sm'
  | '--glyph-shadow-md'
  | '--glyph-shadow-lg'
  | '--glyph-transition'
  | '--glyph-focus-ring'
  | '--glyph-opacity-muted'
  | '--glyph-opacity-disabled'
  // ── Semantic states (4) ──────────────────────────────────────
  | '--glyph-color-success'
  | '--glyph-color-warning'
  | '--glyph-color-error'
  | '--glyph-color-info'
  // ── Shared palette (10) ──────────────────────────────────────
  | '--glyph-palette-color-1'
  | '--glyph-palette-color-2'
  | '--glyph-palette-color-3'
  | '--glyph-palette-color-4'
  | '--glyph-palette-color-5'
  | '--glyph-palette-color-6'
  | '--glyph-palette-color-7'
  | '--glyph-palette-color-8'
  | '--glyph-palette-color-9'
  | '--glyph-palette-color-10'
  // ── Misc (3) ─────────────────────────────────────────────────
  | '--glyph-tooltip-bg'
  | '--glyph-tooltip-text'
  | '--glyph-rating-star-fill';

/** A complete set of all GlyphJS theme variables. Every key is required. */
export type GlyphThemeVars = Record<GlyphThemeVarKey, string>;

export interface GlyphTheme {
  name: string;
  /** Full theme vars (`GlyphThemeVars`) or any partial `Record<string, string>` from external sources. */
  variables: GlyphThemeVars | Record<string, string>;
}

export interface GlyphThemeContext {
  name: string;
  resolveVar: (varName: string) => string;
  isDark: boolean;
}

// ─── Block Props (for base renderer overrides) ───────────────

export interface BlockProps {
  block: Block;
  layout: LayoutHints;
}

// ─── Animation Config ─────────────────────────────────────────

export interface AnimationConfig {
  /** Whether animations are enabled. Defaults to `true`. */
  enabled?: boolean;
  /** Base duration in milliseconds. Defaults to `300`. */
  duration?: number;
  /** CSS easing function. Defaults to `'ease-out'`. */
  easing?: string;
  /** Stagger delay between consecutive blocks in milliseconds. Defaults to `50`. */
  staggerDelay?: number;
}

// ─── Runtime Config ───────────────────────────────────────────

export interface GlyphRuntimeConfig {
  components?: GlyphComponentDefinition[];
  overrides?: Partial<Record<string, ComponentType<BlockProps>>>;
  theme?: 'light' | 'dark' | GlyphTheme;
  animation?: AnimationConfig;
  onDiagnostic?: (diagnostic: Diagnostic) => void;
  onNavigate?: (ref: Reference, targetBlock: Block) => void;
  onInteraction?: (event: InteractionEvent) => void;
}

// ─── Runtime Instance ─────────────────────────────────────────

export interface GlyphRuntime {
  GlyphDocument: ComponentType<{ ir: GlyphIR; className?: string }>;
  registerComponent(definition: GlyphComponentDefinition): void;
  setTheme(theme: 'light' | 'dark' | GlyphTheme): void;
}
