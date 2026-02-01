import { describe, it, expect, vi } from 'vitest';
import { ComponentRegistry, createRegistry } from '../registry.js';

function createTestDefinition(type: `ui:${string}`) {
  return {
    type,
    schema: {
      parse: (data: unknown) => data,
      safeParse: (data: unknown) => ({ success: true, data }),
    },
    render: () => null,
  };
}

describe('ComponentRegistry (PluginRegistry)', () => {
  it('can be instantiated', () => {
    const registry = new ComponentRegistry();
    expect(registry).toBeDefined();
  });

  it('can be created via createRegistry()', () => {
    const registry = createRegistry();
    expect(registry).toBeDefined();
  });

  describe('registerComponent', () => {
    it('adds a renderer that can be retrieved with getRenderer', () => {
      const registry = new ComponentRegistry();
      const def = createTestDefinition('ui:test');

      registry.registerComponent(def);

      const result = registry.getRenderer('ui:test');
      expect(result).toBe(def);
    });

    it('reports the type in getRegisteredTypes', () => {
      const registry = new ComponentRegistry();
      registry.registerComponent(createTestDefinition('ui:alpha'));
      registry.registerComponent(createTestDefinition('ui:beta'));

      const types = registry.getRegisteredTypes();
      expect(types).toContain('ui:alpha');
      expect(types).toContain('ui:beta');
    });

    it('has() returns true for registered types', () => {
      const registry = new ComponentRegistry();
      registry.registerComponent(createTestDefinition('ui:widget'));

      expect(registry.has('ui:widget')).toBe(true);
      expect(registry.has('ui:other')).toBe(false);
    });

    it('notifies listeners on registration', () => {
      const registry = new ComponentRegistry();
      const listener = vi.fn();
      registry.subscribe(listener);

      registry.registerComponent(createTestDefinition('ui:notified'));

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('registerAll', () => {
    it('registers multiple definitions at once', () => {
      const registry = new ComponentRegistry();
      const defs = [
        createTestDefinition('ui:one'),
        createTestDefinition('ui:two'),
      ];

      registry.registerAll(defs);

      expect(registry.has('ui:one')).toBe(true);
      expect(registry.has('ui:two')).toBe(true);
    });
  });

  describe('getRenderer', () => {
    it('returns undefined for unregistered types', () => {
      const registry = new ComponentRegistry();
      expect(registry.getRenderer('ui:nonexistent')).toBeUndefined();
    });

    it('returns the correct definition for registered types', () => {
      const registry = new ComponentRegistry();
      const def = createTestDefinition('ui:specific');
      registry.registerComponent(def);

      expect(registry.getRenderer('ui:specific')).toBe(def);
    });
  });

  describe('overrides', () => {
    it('getOverride returns undefined when no overrides are set', () => {
      const registry = new ComponentRegistry();
      expect(registry.getOverride('heading')).toBeUndefined();
    });

    it('setOverrides stores overrides retrievable via getOverride', () => {
      const registry = new ComponentRegistry();
      const customRenderer = () => null;

      registry.setOverrides({ heading: customRenderer });

      expect(registry.getOverride('heading')).toBe(customRenderer);
    });

    it('setOverrides supports multiple block types', () => {
      const registry = new ComponentRegistry();
      const headingOverride = () => null;
      const paragraphOverride = () => null;

      registry.setOverrides({
        heading: headingOverride,
        paragraph: paragraphOverride,
      });

      expect(registry.getOverride('heading')).toBe(headingOverride);
      expect(registry.getOverride('paragraph')).toBe(paragraphOverride);
    });
  });

  describe('subscribe', () => {
    it('returns an unsubscribe function', () => {
      const registry = new ComponentRegistry();
      const listener = vi.fn();
      const unsubscribe = registry.subscribe(listener);

      registry.registerComponent(createTestDefinition('ui:sub'));
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      registry.registerComponent(createTestDefinition('ui:sub2'));
      // Should still be 1 because we unsubscribed
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('theme defaults', () => {
    it('merges theme defaults from component definitions', () => {
      const registry = new ComponentRegistry();
      const def = {
        ...createTestDefinition('ui:themed'),
        themeDefaults: { '--my-var': 'red' },
      };

      registry.registerComponent(def);

      const defaults = registry.getThemeDefaults();
      expect(defaults['--my-var']).toBe('red');
    });

    it('mergeThemeDefaults merges into a theme object', () => {
      const registry = new ComponentRegistry();
      registry.registerComponent({
        ...createTestDefinition('ui:themed2'),
        themeDefaults: { '--plugin-color': 'blue' },
      });

      const theme = {
        name: 'test',
        variables: { '--glyph-bg': '#fff' },
      };

      const merged = registry.mergeThemeDefaults(theme);
      expect(merged.variables['--plugin-color']).toBe('blue');
      expect(merged.variables['--glyph-bg']).toBe('#fff');
    });
  });
});
