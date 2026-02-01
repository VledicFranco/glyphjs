import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AnimationConfig } from '@glyphjs/types';

// ─── Animation State ─────────────────────────────────────────

export interface AnimationState {
  enabled: boolean;
  duration: number;
  easing: string;
  staggerDelay: number;
}

const defaultConfig: AnimationState = {
  enabled: true,
  duration: 300,
  easing: 'ease-out',
  staggerDelay: 50,
};

// ─── Context ─────────────────────────────────────────────────

const AnimationContext = createContext<AnimationState>(defaultConfig);

// ─── Provider ────────────────────────────────────────────────

interface AnimationProviderProps {
  config?: AnimationConfig;
  children: ReactNode;
}

/**
 * Provides animation configuration to the component tree.
 * Merges partial user config with sensible defaults.
 */
export function AnimationProvider({
  config,
  children,
}: AnimationProviderProps): ReactNode {
  const state = useMemo<AnimationState>(
    () => ({
      ...defaultConfig,
      ...config,
    }),
    [config],
  );

  return <AnimationContext value={state}>{children}</AnimationContext>;
}

// ─── Hook ────────────────────────────────────────────────────

/**
 * Returns the current animation configuration.
 * Falls back to defaults if no `AnimationProvider` is found.
 */
export function useAnimation(): AnimationState {
  return useContext(AnimationContext);
}

export { AnimationContext };
