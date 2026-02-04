// ─── Container-Adaptive Layout ───────────────────────────────

/**
 * Container-width tier resolved from measured pixel width.
 * - `compact`: < 500px — chat sidebars, mobile, narrow panels
 * - `standard`: 500–899px — docs sites, split-pane editors
 * - `wide`: ≥ 900px — dashboards, full-width, presentations
 */
export type ContainerTier = 'compact' | 'standard' | 'wide';

/**
 * Container measurement context injected into every component via props.
 * The runtime measures the document container via ResizeObserver and
 * resolves the tier using hysteresis to prevent layout thrashing.
 */
export interface ContainerContext {
  /** Measured container width in CSS pixels. 0 before first measurement. */
  width: number;
  /** Resolved breakpoint tier. Defaults to `'wide'` when width is 0. */
  tier: ContainerTier;
}
