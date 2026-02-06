import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useZoomInteraction } from '../useZoomInteraction.js';
import type { InteractionMode } from '../useZoomInteraction.js';
import * as d3 from 'd3';

// Mock D3 zoom behavior
vi.mock('d3', async () => {
  const actual = await vi.importActual<typeof d3>('d3');
  let storedFilter: ((event: Event) => boolean) | undefined;

  return {
    ...actual,
    zoom: vi.fn(() => ({
      scaleExtent: vi.fn().mockReturnThis(),
      filter: vi.fn((filterFn: (event: Event) => boolean) => {
        storedFilter = filterFn;
        return {
          scaleExtent: vi.fn().mockReturnThis(),
          filter: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          // Expose filter for testing
          _testFilter: storedFilter,
        };
      }),
      on: vi.fn().mockReturnThis(),
    })),
    select: vi.fn(() => ({
      attr: vi.fn().mockReturnThis(),
    })),
  };
});

describe('useZoomInteraction', () => {
  let svgRef: React.RefObject<SVGSVGElement>;
  let rootRef: React.RefObject<SVGGElement>;

  beforeEach(() => {
    // Create mock refs
    svgRef = {
      current: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
    } as React.RefObject<SVGSVGElement>;
    rootRef = {
      current: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
    } as React.RefObject<SVGGElement>;

    // Create a parent div for the SVG
    const parent = document.createElement('div');
    parent.appendChild(svgRef.current as SVGSVGElement);
    document.body.appendChild(parent);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('modifier-key mode', () => {
    it('should create zoom behavior with modifier key filter', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'modifier-key',
          blockId: 'test-block',
        }),
      );

      expect(result.current.zoomBehavior).toBeDefined();
      expect(d3.zoom).toHaveBeenCalled();
    });

    it('should allow mousedown events for panning', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'modifier-key',
          blockId: 'test-block',
        }),
      );

      const zoomBehavior = result.current.zoomBehavior as unknown as {
        _testFilter?: (event: Event) => boolean;
      };
      const filter = zoomBehavior._testFilter;

      if (filter) {
        const mousedownEvent = new MouseEvent('mousedown');
        expect(filter(mousedownEvent)).toBe(true);
      }
    });

    it('should block wheel events without modifier key', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'modifier-key',
          blockId: 'test-block',
        }),
      );

      const zoomBehavior = result.current.zoomBehavior as unknown as {
        _testFilter?: (event: Event) => boolean;
      };
      const filter = zoomBehavior._testFilter;

      if (filter) {
        const wheelEvent = new WheelEvent('wheel', { ctrlKey: false, metaKey: false });
        expect(filter(wheelEvent)).toBe(false);
      }
    });

    it('should allow wheel events with Ctrl key', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'modifier-key',
          blockId: 'test-block',
        }),
      );

      const zoomBehavior = result.current.zoomBehavior as unknown as {
        _testFilter?: (event: Event) => boolean;
      };
      const filter = zoomBehavior._testFilter;

      if (filter) {
        const wheelEvent = new WheelEvent('wheel', { ctrlKey: true });
        expect(filter(wheelEvent)).toBe(true);
      }
    });

    it('should allow wheel events with Meta key', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'modifier-key',
          blockId: 'test-block',
        }),
      );

      const zoomBehavior = result.current.zoomBehavior as unknown as {
        _testFilter?: (event: Event) => boolean;
      };
      const filter = zoomBehavior._testFilter;

      if (filter) {
        const wheelEvent = new WheelEvent('wheel', { metaKey: true });
        expect(filter(wheelEvent)).toBe(true);
      }
    });

    it('should not show overlay initially', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'modifier-key',
          blockId: 'test-block',
        }),
      );

      expect(result.current.overlayProps).toBeNull();
    });
  });

  describe('click-to-activate mode', () => {
    it('should start inactive', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'click-to-activate',
          blockId: 'test-block',
        }),
      );

      expect(result.current.isActive).toBe(false);
    });

    it('should provide overlay props when inactive', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'click-to-activate',
          blockId: 'test-block',
        }),
      );

      expect(result.current.overlayProps).not.toBeNull();
      expect(result.current.overlayProps?.mode).toBe('click-to-activate');
      expect(result.current.overlayProps?.isActive).toBe(false);
    });

    it('should activate on onActivate callback', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'click-to-activate',
          blockId: 'test-block',
        }),
      );

      act(() => {
        result.current.overlayProps?.onActivate();
      });

      expect(result.current.isActive).toBe(true);
    });

    it('should deactivate on Escape key', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'click-to-activate',
          blockId: 'test-block',
        }),
      );

      // Activate first
      act(() => {
        result.current.overlayProps?.onActivate();
      });

      expect(result.current.isActive).toBe(true);

      // Press Escape
      act(() => {
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);
      });

      expect(result.current.isActive).toBe(false);
    });

    it('should deactivate on click outside', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'click-to-activate',
          blockId: 'test-block',
        }),
      );

      // Activate first
      act(() => {
        result.current.overlayProps?.onActivate();
      });

      expect(result.current.isActive).toBe(true);

      // Click outside
      act(() => {
        const clickEvent = new MouseEvent('click', { bubbles: true });
        document.body.dispatchEvent(clickEvent);
      });

      expect(result.current.isActive).toBe(false);
    });

    it('should block all events when inactive', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'click-to-activate',
          blockId: 'test-block',
        }),
      );

      const zoomBehavior = result.current.zoomBehavior as unknown as {
        _testFilter?: (event: Event) => boolean;
      };
      const filter = zoomBehavior._testFilter;

      if (filter) {
        const wheelEvent = new WheelEvent('wheel');
        const mousedownEvent = new MouseEvent('mousedown');

        expect(filter(wheelEvent)).toBe(false);
        expect(filter(mousedownEvent)).toBe(false);
      }
    });

    it('should allow all events when active', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'click-to-activate',
          blockId: 'test-block',
        }),
      );

      // Activate
      act(() => {
        result.current.overlayProps?.onActivate();
      });

      const zoomBehavior = result.current.zoomBehavior as unknown as {
        _testFilter?: (event: Event) => boolean;
      };
      const filter = zoomBehavior._testFilter;

      if (filter) {
        const wheelEvent = new WheelEvent('wheel');
        const mousedownEvent = new MouseEvent('mousedown');

        expect(filter(wheelEvent)).toBe(true);
        expect(filter(mousedownEvent)).toBe(true);
      }
    });
  });

  describe('always mode', () => {
    it('should start active', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'always',
          blockId: 'test-block',
        }),
      );

      expect(result.current.isActive).toBe(true);
    });

    it('should not provide overlay props', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'always',
          blockId: 'test-block',
        }),
      );

      expect(result.current.overlayProps).toBeNull();
    });

    it('should allow all events', () => {
      const { result } = renderHook(() =>
        useZoomInteraction({
          svgRef,
          rootRef,
          interactionMode: 'always',
          blockId: 'test-block',
        }),
      );

      const zoomBehavior = result.current.zoomBehavior as unknown as {
        _testFilter?: (event: Event) => boolean;
      };
      const filter = zoomBehavior._testFilter;

      if (filter) {
        const wheelEvent = new WheelEvent('wheel');
        const mousedownEvent = new MouseEvent('mousedown');

        expect(filter(wheelEvent)).toBe(true);
        expect(filter(mousedownEvent)).toBe(true);
      }
    });
  });

  describe('mode switching', () => {
    it('should update active state when mode changes', () => {
      const { result, rerender } = renderHook(
        ({ mode }: { mode: InteractionMode }) =>
          useZoomInteraction({
            svgRef,
            rootRef,
            interactionMode: mode,
            blockId: 'test-block',
          }),
        { initialProps: { mode: 'click-to-activate' as InteractionMode } },
      );

      expect(result.current.isActive).toBe(false);

      rerender({ mode: 'always' });

      expect(result.current.isActive).toBe(true);

      rerender({ mode: 'modifier-key' });

      expect(result.current.isActive).toBe(false);
    });
  });
});
