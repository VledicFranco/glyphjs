import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ContainerMeasureProps {
  children: ReactNode;
  /** Stable callback invoked with the container's content width in px. */
  onMeasure: (width: number) => void;
}

/**
 * Wraps children in a block-level div and reports its content width
 * via ResizeObserver. The wrapper uses `width: 100%` and does not
 * alter the layout of its children.
 *
 * `onMeasure` should be a stable reference (e.g. a `setState` setter)
 * to avoid unnecessary observer teardown/setup.
 */
export function ContainerMeasure({ children, onMeasure }: ContainerMeasureProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          onMeasure(entry.contentRect.width);
        }
      }
    });

    // Fire initial measurement synchronously
    onMeasure(el.clientWidth);
    observer.observe(el);

    return () => observer.disconnect();
  }, [onMeasure]);

  return (
    <div ref={ref} style={{ width: '100%' }}>
      {children}
    </div>
  );
}
