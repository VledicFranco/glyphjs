// @glyphjs/schemas — barrel file

// ─── Component Schemas ──────────────────────────────────────
export { graphSchema } from './graph.js';
export { tableSchema } from './table.js';
export { chartSchema } from './chart.js';
export { relationSchema } from './relation.js';
export { timelineSchema } from './timeline.js';
export { calloutSchema } from './callout.js';
export { tabsSchema } from './tabs.js';
export { stepsSchema } from './steps.js';

// ─── Registry & Helpers ─────────────────────────────────────
export { componentSchemas, getJsonSchema } from './registry.js';
