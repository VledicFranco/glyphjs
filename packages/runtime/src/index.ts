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
export { RuntimeProvider, useRuntime, useReferences } from './context.js';
export type { RuntimeContextValue, RuntimeProviderProps } from './context.js';

// Registry
export { ComponentRegistry } from './registry.js';

// Plugin system
export {
  validateComponentDefinition,
  resolveComponentProps,
  PluginRegistry,
} from './plugins/index.js';
export type { ValidationResult, RegistryChangeListener } from './plugins/index.js';

// Layout engine
export {
  LayoutProvider,
  useLayout,
  DocumentLayout,
  DashboardLayout,
  PresentationLayout,
} from './layout/index.js';

// Built-in renderers
export {
  InlineRenderer,
  RichText,
  GlyphHeading,
  GlyphParagraph,
  GlyphList,
  GlyphCodeBlock,
  GlyphBlockquote,
  GlyphImage,
  GlyphThematicBreak,
  GlyphRawHtml,
  builtInRenderers,
} from './renderers/index.js';
export type { RichTextProps } from './renderers/index.js';

// Theme system
export {
  lightTheme,
  darkTheme,
  LIGHT_THEME_VARS,
  DARK_THEME_VARS,
  themeVarsToCSS,
  ThemeProvider,
  useGlyphTheme,
  resolveTheme,
  mergeThemeDefaults,
  createResolveVar,
  isDarkTheme,
} from './theme/index.js';
export type { ThemeProviderProps } from './theme/index.js';

// Animation system
export {
  AnimationProvider,
  useAnimation,
  AnimationContext,
  useBlockAnimation,
} from './animation/index.js';
export type { AnimationConfig, AnimationState, BlockAnimationResult } from './animation/index.js';

// Diagnostics
export { DiagnosticsOverlay, BlockDiagnosticIndicator } from './diagnostics/index.js';

// Navigation
export { ReferenceIndicator, useNavigation } from './navigation/index.js';
export type { NavigationResult } from './navigation/index.js';

// Container measurement
export { resolveTier, ContainerMeasure } from './container/index.js';

// SSR utilities
export { useIsClient, SSRPlaceholder } from './ssr/index.js';
export type { SSRPlaceholderProps } from './ssr/index.js';

// Interaction helpers
export { debounceInteractions } from './debounce.js';
