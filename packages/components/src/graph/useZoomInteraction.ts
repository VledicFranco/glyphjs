import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import * as d3 from 'd3';

export type InteractionMode = 'modifier-key' | 'click-to-activate' | 'always';

export interface UseZoomInteractionOptions {
  svgRef: React.RefObject<SVGSVGElement | null>;
  rootRef: React.RefObject<SVGGElement | null>;
  interactionMode: InteractionMode;
  blockId: string;
}

export interface OverlayProps {
  mode: InteractionMode;
  isActive: boolean;
  onActivate: () => void;
  width: string;
  height: string;
}

export interface UseZoomInteractionResult {
  isActive: boolean;
  overlayProps: OverlayProps | null;
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

/**
 * Hook to manage zoom/pan interaction modes for D3 visualizations.
 * Provides three modes:
 * - 'modifier-key': Requires Ctrl/Cmd + scroll to zoom (default)
 * - 'click-to-activate': Click to activate, Escape/click-outside to deactivate
 * - 'always': Traditional behavior with no restrictions
 */
export function useZoomInteraction({
  svgRef,
  rootRef,
  interactionMode,
}: UseZoomInteractionOptions): UseZoomInteractionResult {
  const [isActive, setIsActive] = useState(interactionMode === 'always');
  const [hasAttemptedScroll, setHasAttemptedScroll] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Update active state when mode changes
  useEffect(() => {
    setIsActive(interactionMode === 'always');
    setHasAttemptedScroll(false);
  }, [interactionMode]);

  // Create filter function based on interaction mode
  const filterFunction = useCallback(
    (event: Event) => {
      if (interactionMode === 'always') {
        return true; // No restrictions
      }

      if (interactionMode === 'modifier-key') {
        // Allow mousedown for panning
        if (event.type === 'mousedown') return true;

        // For wheel events, require Alt key
        if (event.type === 'wheel') {
          const wheelEvent = event as WheelEvent;
          const hasModifier = wheelEvent.altKey;

          // Track scroll attempts for tooltip display
          if (!hasModifier && !hasAttemptedScroll) {
            setHasAttemptedScroll(true);
            // Reset after 3 seconds
            setTimeout(() => setHasAttemptedScroll(false), 3000);
          }

          return hasModifier;
        }

        return true;
      }

      if (interactionMode === 'click-to-activate') {
        // Block all interactions when inactive
        return isActive;
      }

      return true;
    },
    [interactionMode, isActive, hasAttemptedScroll],
  );

  // Prevent browser default behavior with Alt+scroll
  useEffect(() => {
    if (interactionMode !== 'modifier-key' || !svgRef.current) return;

    const svg = svgRef.current;
    const container = svg.parentElement;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      // Prevent default if Alt is held AND the event is over the SVG
      const target = event.target as Node;
      if (event.altKey && svg.contains(target)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Use capture phase to intercept early
    container.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [interactionMode, svgRef]);

  // Create zoom behavior with mode-specific filter
  const zoomBehavior = useMemo(() => {
    return d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .filter(filterFunction)
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        if (rootRef.current) {
          d3.select(rootRef.current).attr('transform', event.transform.toString());
        }
      });
  }, [filterFunction, rootRef]);

  // Handle click to activate (for click-to-activate mode)
  const handleActivate = useCallback(() => {
    if (interactionMode === 'click-to-activate') {
      setIsActive(true);
    }
  }, [interactionMode]);

  // Handle Escape key to deactivate
  useEffect(() => {
    if (interactionMode !== 'click-to-activate' || !isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsActive(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [interactionMode, isActive]);

  // Handle click outside to deactivate
  useEffect(() => {
    if (interactionMode !== 'click-to-activate' || !isActive) return;

    const handleClickOutside = (e: MouseEvent) => {
      const container = svgRef.current?.parentElement;
      if (container && !container.contains(e.target as Node)) {
        setIsActive(false);
      }
    };

    // Use capture phase to ensure we catch the click before other handlers
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [interactionMode, isActive, svgRef]);

  // Store container ref for overlay
  useEffect(() => {
    if (svgRef.current) {
      containerRef.current = svgRef.current.parentElement as HTMLDivElement;
    }
  }, [svgRef]);

  // Construct overlay props if needed
  const overlayProps: OverlayProps | null = useMemo(() => {
    if (interactionMode === 'always') return null;

    // For modifier-key mode, only show overlay on failed scroll attempt
    if (interactionMode === 'modifier-key' && !hasAttemptedScroll) return null;

    // For click-to-activate, always show overlay when inactive
    if (interactionMode === 'click-to-activate' && isActive) return null;

    return {
      mode: interactionMode,
      isActive,
      onActivate: handleActivate,
      width: '100%',
      height: '100%',
    };
  }, [interactionMode, isActive, hasAttemptedScroll, handleActivate]);

  // Zoom control functions
  const zoomIn = useCallback(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehavior.scaleBy, 1.3);
  }, [svgRef, zoomBehavior]);

  const zoomOut = useCallback(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehavior.scaleBy, 1 / 1.3);
  }, [svgRef, zoomBehavior]);

  const resetZoom = useCallback(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehavior.transform, d3.zoomIdentity);
  }, [svgRef, zoomBehavior]);

  return {
    isActive,
    overlayProps,
    zoomBehavior,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
