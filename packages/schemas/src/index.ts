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
export { architectureSchema } from './architecture.js';
export { kpiSchema } from './kpi.js';
export { accordionSchema } from './accordion.js';
export { comparisonSchema } from './comparison.js';
export { codediffSchema } from './codediff.js';
export { flowchartSchema } from './flowchart.js';
export { filetreeSchema } from './filetree.js';
export { sequenceSchema } from './sequence.js';
export { mindmapSchema } from './mindmap.js';

// ─── Registry & Helpers ─────────────────────────────────────
export { componentSchemas, getJsonSchema } from './registry.js';
