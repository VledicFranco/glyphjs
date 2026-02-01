// Plugin system barrel file

export { validateComponentDefinition } from './validate.js';
export type { ValidationResult } from './validate.js';

export { resolveComponentProps } from './resolve-props.js';

export { PluginRegistry } from './registry.js';
export type { RegistryChangeListener } from './registry.js';
