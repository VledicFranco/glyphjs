import { PluginRegistry } from './plugins/registry.js';

/**
 * Component registry for managing block type renderers.
 *
 * Re-exported from the plugin system for backward compatibility.
 * The `PluginRegistry` adds validation on registration, theme
 * defaults merging, and change notification.
 */
export { PluginRegistry as ComponentRegistry } from './plugins/registry.js';

/**
 * Create a new ComponentRegistry (PluginRegistry) instance.
 * Convenience helper for consumers that prefer a factory over `new`.
 */
export function createRegistry(): PluginRegistry {
  return new PluginRegistry();
}
