import type * as d3 from 'd3';

// ─── SVG Icon Paths (24x24 viewBox) ────────────────────────

export const ICON_PATHS: Record<string, string> = {
  // Rack server
  server: 'M4 4h16v4H4zm0 6h16v4H4zm0 6h16v4H4zM6 6h1v0.5H6zm0 6h1v0.5H6zm0 6h1v0.5H6z',
  // Cylinder
  database:
    'M12 2C7.58 2 4 3.34 4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5c0-1.66-3.58-3-8-3zm0 2c3.87 0 6 1.12 6 1s-2.13 1-6 1-6-0.12-6-1 2.13-1 6-1zM6 7.26C7.53 7.83 9.64 8 12 8s4.47-0.17 6-0.74V10c0 0.88-2.13 2-6 2s-6-1.12-6-2V7.26zm0 5C7.53 12.83 9.64 13 12 13s4.47-0.17 6-0.74V15c0 0.88-2.13 2-6 2s-6-1.12-6-2v-2.74zM12 20c-3.87 0-6-1.12-6-2v-2.74C7.53 15.83 9.64 16 12 16s4.47-0.17 6-0.74V18c0 0.88-2.13 2-6 2z',
  // Horizontal arrows/bars
  queue: 'M2 7h14l-4-3.5M2 12h18l-4-3.5M2 17h14l-4-3.5',
  // Lightning bolt
  cache: 'M13 2L3 14h7l-2 8 10-12h-7z',
  // Branching arrows
  loadbalancer: 'M12 2v6m0 0l-6 6m6-6l6 6m-6-6v0M6 14v4h4m4 0h4v-4M12 8a2 2 0 100-4 2 2 0 000 4z',
  // Lambda symbol
  function: 'M7 4l5 16M12 4l5 16M5 10h14M5 14h14',
  // Disk/bucket
  storage: 'M4 6a8 3 0 0116 0v12a8 3 0 01-16 0V6zm0 0a8 3 0 0016 0',
  // Gateway arch
  gateway: 'M3 21V8a9 9 0 0118 0v13M7 21v-8a5 5 0 0110 0v8M11 3v2m-4 1l1 1m8-1l-1 1',
  // Person silhouette
  user: 'M12 4a4 4 0 110 8 4 4 0 010-8zm0 10c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z',
  // Cloud shape
  cloud:
    'M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z',
  // Box with lid
  container: 'M2 8l10-5 10 5v10l-10 5-10-5V8zm10-5v20M2 8l10 5 10-5',
  // Connected nodes
  network:
    'M12 2a2 2 0 110 4 2 2 0 010-4zM4 10a2 2 0 110 4 2 2 0 010-4zM20 10a2 2 0 110 4 2 2 0 010-4zM12 18a2 2 0 110 4 2 2 0 010-4zM12 6v12M4 12h16M6 11l5-5M18 11l-5-5M6 13l5 5M18 13l-5 5',
};

// ─── Render Helper ──────────────────────────────────────────

export function renderIcon(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  iconName: string,
  x: number,
  y: number,
  size = 20,
): void {
  const d = ICON_PATHS[iconName];
  if (!d) return;

  const iconG = g
    .append('g')
    .attr('transform', `translate(${x - size / 2}, ${y - size / 2}) scale(${size / 24})`);

  iconG
    .append('path')
    .attr('d', d)
    .attr('fill', 'none')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round');
}
