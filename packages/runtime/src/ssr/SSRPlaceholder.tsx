import type { CSSProperties, ReactNode } from 'react';
import { useIsClient } from './useIsClient.js';

// ─── Props ────────────────────────────────────────────────────

export interface SSRPlaceholderProps {
  /** Width of the placeholder element (CSS value). Defaults to `'100%'`. */
  width?: string | number;
  /** Height of the placeholder element (CSS value). Defaults to `300`. */
  height?: string | number;
  /** Optional CSS class name applied to both the placeholder and wrapper. */
  className?: string;
  /** Content to render once the component has mounted on the client. */
  children: ReactNode;
}

// ─── Component ────────────────────────────────────────────────

/**
 * Renders a lightweight placeholder `<div>` during server-side rendering
 * and on the initial client render (before hydration completes).
 * Once `useEffect` fires on the client, the placeholder is replaced
 * with the provided `children`.
 *
 * This is useful for wrapping components that rely on browser-only APIs
 * (e.g. D3 charts, Canvas, ResizeObserver) so that `renderToString`
 * produces valid, non-crashing HTML with the correct dimensions reserved.
 *
 * @example
 * ```tsx
 * <SSRPlaceholder width="100%" height={400}>
 *   <Chart data={chartData} />
 * </SSRPlaceholder>
 * ```
 */
export function SSRPlaceholder({
  width = '100%',
  height = 300,
  className,
  children,
}: SSRPlaceholderProps): ReactNode {
  const isClient = useIsClient();

  if (!isClient) {
    const style: CSSProperties = {
      width,
      height,
      // Subtle background so the reserved space is visible in the layout
      backgroundColor: 'var(--glyph-ssr-placeholder-bg, #f0f0f0)',
    };

    return (
      <div
        className={className}
        style={style}
        data-ssr-placeholder="true"
        aria-hidden="true"
      />
    );
  }

  return <>{children}</>;
}
