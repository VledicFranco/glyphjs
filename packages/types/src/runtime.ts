import type { Block, GlyphIR, LayoutHints, Reference } from './ir.js';
import type { Diagnostic } from './diagnostic.js';
import type { ComponentType, GlyphComponentDefinition } from './plugin.js';

// ─── Theme ────────────────────────────────────────────────────

export interface GlyphTheme {
  name: string;
  variables: Record<string, string>;
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

// ─── Runtime Config ───────────────────────────────────────────

export interface GlyphRuntimeConfig {
  components?: GlyphComponentDefinition[];
  overrides?: Partial<Record<string, ComponentType<BlockProps>>>;
  theme?: 'light' | 'dark' | GlyphTheme;
  onDiagnostic?: (diagnostic: Diagnostic) => void;
  onNavigate?: (ref: Reference, targetBlock: Block) => void;
}

// ─── Runtime Instance ─────────────────────────────────────────

export interface GlyphRuntime {
  GlyphDocument: ComponentType<{ ir: GlyphIR; className?: string }>;
  registerComponent(definition: GlyphComponentDefinition): void;
  setTheme(theme: 'light' | 'dark' | GlyphTheme): void;
}
