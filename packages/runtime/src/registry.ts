import type {
  GlyphComponentDefinition,
  BlockProps,
  ComponentType,
} from '@glyphjs/types';

/**
 * Component registry for managing block type renderers.
 *
 * Holds `ui:*` component definitions (registered via plugins)
 * and override renderers for standard block types.
 */
export class ComponentRegistry {
  private components = new Map<string, GlyphComponentDefinition>();
  private overrides = new Map<string, ComponentType<BlockProps>>();

  /** Register a `ui:*` component plugin definition. */
  registerComponent(definition: GlyphComponentDefinition): void {
    this.components.set(definition.type, definition);
  }

  /** Bulk-register an array of component definitions. */
  registerAll(definitions: GlyphComponentDefinition[]): void {
    for (const def of definitions) {
      this.registerComponent(def);
    }
  }

  /** Set override renderers (keyed by block type). */
  setOverrides(
    overrides: Partial<Record<string, ComponentType<BlockProps>>>,
  ): void {
    for (const [type, renderer] of Object.entries(overrides)) {
      if (renderer) {
        this.overrides.set(type, renderer);
      }
    }
  }

  /** Get a registered `ui:*` component definition. */
  getRenderer(blockType: string): GlyphComponentDefinition | undefined {
    return this.components.get(blockType);
  }

  /** Get an override renderer for any block type. */
  getOverride(blockType: string): ComponentType<BlockProps> | undefined {
    return this.overrides.get(blockType);
  }
}
