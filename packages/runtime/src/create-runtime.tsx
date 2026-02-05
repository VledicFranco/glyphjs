import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  GlyphIR,
  GlyphTheme,
  GlyphRuntimeConfig,
  GlyphRuntime,
  GlyphComponentDefinition,
} from '@glyphjs/types';
import { ComponentRegistry } from './registry.js';
import { RuntimeProvider } from './context.js';
import { GlyphDocument } from './GlyphDocument.js';

// ─── Wrapped document with provider ──────────────────────────

interface WrappedDocumentProps {
  ir: GlyphIR;
  className?: string;
}

/**
 * Creates a fully configured Glyph runtime instance.
 *
 * Returns a `GlyphRuntime` object containing:
 * - `GlyphDocument` — A React component pre-wired with the config
 * - `registerComponent()` — Dynamically add component definitions
 * - `setTheme()` — Update the theme (triggers re-render)
 */
export function createGlyphRuntime(config: GlyphRuntimeConfig): GlyphRuntime {
  // Create the component registry
  const registry = new ComponentRegistry();

  // Pre-register components from config
  if (config.components) {
    registry.registerAll(config.components);
  }

  // Store overrides
  if (config.overrides) {
    registry.setOverrides(config.overrides);
  }

  // Mutable state container shared between the factory and the React tree.
  // React state hooks inside WrappedDocument drive re-renders when these change.
  let currentTheme = config.theme;
  let registryVersion = 0;
  const listeners = new Set<() => void>();

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  // The wrapped document component that includes RuntimeProvider
  function WrappedDocument({ ir, className }: WrappedDocumentProps): ReactNode {
    const [theme, setThemeState] = useState(currentTheme);
    const [, setVersion] = useState(registryVersion);

    // Subscribe to external mutations (registerComponent, setTheme)
    const forceUpdate = useCallback(() => {
      setThemeState(currentTheme);
      setVersion(registryVersion);
    }, []);

    // Register and unregister listener on mount/unmount
    useEffect(() => {
      listeners.add(forceUpdate);
      return () => {
        listeners.delete(forceUpdate);
      };
    }, [forceUpdate]);

    return (
      <RuntimeProvider
        registry={registry}
        references={ir.references}
        documentId={ir.id}
        theme={theme}
        onDiagnostic={config.onDiagnostic}
        onNavigate={config.onNavigate}
        onInteraction={config.onInteraction}
      >
        <GlyphDocument ir={ir} className={className} animation={config.animation} />
      </RuntimeProvider>
    );
  }

  return {
    GlyphDocument: WrappedDocument,

    registerComponent(definition: GlyphComponentDefinition): void {
      registry.registerComponent(definition);
      registryVersion++;
      notify();
    },

    setTheme(theme: 'light' | 'dark' | GlyphTheme): void {
      currentTheme = theme;
      notify();
    },
  };
}
