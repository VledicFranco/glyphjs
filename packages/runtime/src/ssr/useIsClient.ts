import { useState, useEffect } from 'react';

/**
 * Returns `true` once the component has mounted on the client.
 *
 * During server-side rendering (SSR) and the initial client render
 * before hydration completes, this returns `false`. After the first
 * `useEffect` fires (client only), it flips to `true`.
 *
 * Use this to gate browser-only code paths (e.g. D3 rendering,
 * ResizeObserver, window access) so they are skipped during SSR.
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
}
