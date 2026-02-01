import { useRef, useState, useEffect, useMemo } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { useAnimation } from './AnimationProvider.js';

// ─── Return type ─────────────────────────────────────────────

export interface BlockAnimationResult {
  /** Attach to the block wrapper element. */
  ref: RefObject<HTMLDivElement | null>;
  /** Inline styles that drive the entry animation. */
  style: CSSProperties;
  /** Whether the block has entered the viewport. */
  isVisible: boolean;
}

// ─── Reduced-motion query ────────────────────────────────────

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mql.matches);

    const handler = (e: MediaQueryListEvent): void => {
      setPrefersReduced(e.matches);
    };

    mql.addEventListener('change', handler);
    return () => {
      mql.removeEventListener('change', handler);
    };
  }, []);

  return prefersReduced;
}

// ─── Hook ────────────────────────────────────────────────────

/**
 * Per-block entry animation powered by Intersection Observer.
 *
 * Returns a `ref` to attach to the block wrapper, an inline `style`
 * object that drives the CSS transition, and an `isVisible` flag.
 *
 * Animations are skipped when:
 * - The animation config has `enabled: false`
 * - The user has `prefers-reduced-motion: reduce` set
 *
 * @param index - The block's position in the document, used for stagger delay.
 */
export function useBlockAnimation(index: number): BlockAnimationResult {
  const config = useAnimation();
  const prefersReduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const disabled = !config.enabled || prefersReduced;

  useEffect(() => {
    if (disabled) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [disabled]);

  const style = useMemo<CSSProperties>(() => {
    if (disabled) {
      return {};
    }

    const delay = index * config.staggerDelay;

    return isVisible
      ? {
          opacity: 1,
          transform: 'translateY(0)',
          transition: `opacity ${config.duration}ms ${config.easing} ${delay}ms, transform ${config.duration}ms ${config.easing} ${delay}ms`,
        }
      : {
          opacity: 0,
          transform: 'translateY(10px)',
          transition: `opacity ${config.duration}ms ${config.easing} ${delay}ms, transform ${config.duration}ms ${config.easing} ${delay}ms`,
        };
  }, [disabled, isVisible, index, config.duration, config.easing, config.staggerDelay]);

  return { ref, style, isVisible };
}
