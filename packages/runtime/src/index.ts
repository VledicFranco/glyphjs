// @glyphjs/runtime — barrel file

// Factory
export { createGlyphRuntime } from './create-runtime.js';

// Document component (for advanced / custom provider usage)
export { GlyphDocument } from './GlyphDocument.js';

// Block rendering
export { BlockRenderer } from './BlockRenderer.js';

// Error handling
export { ErrorBoundary } from './ErrorBoundary.js';

// Fallback renderer
export { FallbackRenderer } from './FallbackRenderer.js';

// Context & hooks
export {
  RuntimeProvider,
  useRuntime,
  useReferences,
} from './context.js';
export type { RuntimeContextValue, RuntimeProviderProps } from './context.js';

// Registry
export { ComponentRegistry } from './registry.js';
