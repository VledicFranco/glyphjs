import type { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { graphSchema } from './graph.js';
import { tableSchema } from './table.js';
import { chartSchema } from './chart.js';
import { relationSchema } from './relation.js';
import { timelineSchema } from './timeline.js';
import { calloutSchema } from './callout.js';
import { tabsSchema } from './tabs.js';
import { stepsSchema } from './steps.js';
import { architectureSchema } from './architecture.js';
import { kpiSchema } from './kpi.js';
import { accordionSchema } from './accordion.js';
import { comparisonSchema } from './comparison.js';

// ─── Schema Registry ─────────────────────────────────────────

const entries: [string, z.ZodType][] = [
  ['graph', graphSchema],
  ['table', tableSchema],
  ['chart', chartSchema],
  ['relation', relationSchema],
  ['timeline', timelineSchema],
  ['callout', calloutSchema],
  ['tabs', tabsSchema],
  ['steps', stepsSchema],
  ['architecture', architectureSchema],
  ['kpi', kpiSchema],
  ['accordion', accordionSchema],
  ['comparison', comparisonSchema],
];

export const componentSchemas: ReadonlyMap<string, z.ZodType> = new Map(entries);

// ─── JSON Schema Helper ─────────────────────────────────────

export function getJsonSchema(componentType: string): object | undefined {
  const schema = componentSchemas.get(componentType);
  if (!schema) return undefined;
  return zodToJsonSchema(schema);
}
