import type {
  GlyphComponentDefinition,
  BlockProps,
  ComponentType,
  GlyphTheme,
} from '@glyphjs/types';
import { validateComponentDefinition } from './validate.js';

/**
 * Listener function invoked when the registry changes.
 */
export type RegistryChangeListener = () => void;

/**
 * Enhanced plugin registry that adds validation, theme defaults
 * merging, and change notification on top of the base ComponentRegistry.
 *
 * This class replaces the original `ComponentRegistry` with a
 * superset of its API so existing consumers continue to work.
 */
export class PluginRegistry {
  private components = new Map<string, GlyphComponentDefinition>();
  private overrides = new Map<string, ComponentType<BlockProps>>();
  private listeners = new Set<RegistryChangeListener>();
  private themeDefaults: Record<string, string> = {};

  // ─── Registration ────────────────────────────────────────────

  /**
   * Register a `ui:*` component plugin definition.
   * Validates the definition first; throws if invalid.
   * Merges any `themeDefaults` from the definition into
   * the accumulated theme defaults map.
   */
  registerComponent(definition: GlyphComponentDefinition): void {
    const result = validateComponentDefinition(definition);
    if (!result.valid) {
      throw new Error(
        `Invalid component definition for "${definition.type}":\n  - ${result.errors.join('\n  - ')}`,
      );
    }

    this.components.set(definition.type, definition);

    // Merge theme defaults
    if (definition.themeDefaults) {
      Object.assign(this.themeDefaults, definition.themeDefaults);
    }

    this.notify();
  }

  /** Bulk-register an array of component definitions. */
  registerAll(definitions: GlyphComponentDefinition[]): void {
    for (const def of definitions) {
      this.registerComponent(def);
    }
  }

  // ─── Overrides ───────────────────────────────────────────────

  /** Set override renderers (keyed by block type). */
  setOverrides(
    overrides: Partial<Record<string, ComponentType<BlockProps>>>,
  ): void {
    for (const [type, renderer] of Object.entries(overrides)) {
      if (renderer) {
        this.overrides.set(type, renderer);
      }
    }
    this.notify();
  }

  // ─── Lookups ─────────────────────────────────────────────────

  /** Get a registered `ui:*` component definition. */
  getRenderer(blockType: string): GlyphComponentDefinition | undefined {
    return this.components.get(blockType);
  }

  /** Get an override renderer for any block type. */
  getOverride(blockType: string): ComponentType<BlockProps> | undefined {
    return this.overrides.get(blockType);
  }

  /** Check if a component type is registered. */
  has(blockType: string): boolean {
    return this.components.has(blockType);
  }

  /** Get all registered component type names. */
  getRegisteredTypes(): string[] {
    return Array.from(this.components.keys());
  }

  // ─── Theme Defaults ──────────────────────────────────────────

  /**
   * Returns the accumulated theme defaults from all registered
   * component definitions. These can be merged into a GlyphTheme
   * to provide sensible defaults for plugin-specific variables.
   */
  getThemeDefaults(): Record<string, string> {
    return { ...this.themeDefaults };
  }

  /**
   * Merge accumulated plugin theme defaults into a GlyphTheme.
   * Plugin defaults have lower priority than existing theme variables.
   */
  mergeThemeDefaults(theme: GlyphTheme): GlyphTheme {
    return {
      ...theme,
      variables: {
        ...this.themeDefaults,
        ...theme.variables,
      },
    };
  }

  // ─── Change Notification ─────────────────────────────────────

  /** Subscribe to registry changes. Returns an unsubscribe function. */
  subscribe(listener: RegistryChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
