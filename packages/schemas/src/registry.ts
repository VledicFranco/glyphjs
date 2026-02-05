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
import { codediffSchema } from './codediff.js';
import { flowchartSchema } from './flowchart.js';
import { filetreeSchema } from './filetree.js';
import { sequenceSchema } from './sequence.js';
import { mindmapSchema } from './mindmap.js';
import { equationSchema } from './equation.js';
import { quizSchema } from './quiz.js';
import { cardSchema } from './card.js';
import { infographicSchema } from './infographic.js';
import { pollSchema } from './poll.js';
import { ratingSchema } from './rating.js';
import { rankerSchema } from './ranker.js';
import { sliderSchema } from './slider.js';
import { matrixSchema } from './matrix.js';
import { formSchema } from './form.js';
import { kanbanSchema } from './kanban.js';
import { annotateSchema } from './annotate.js';

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
  ['codediff', codediffSchema],
  ['flowchart', flowchartSchema],
  ['filetree', filetreeSchema],
  ['sequence', sequenceSchema],
  ['mindmap', mindmapSchema],
  ['equation', equationSchema],
  ['quiz', quizSchema],
  ['card', cardSchema],
  ['infographic', infographicSchema],
  ['poll', pollSchema],
  ['rating', ratingSchema],
  ['ranker', rankerSchema],
  ['slider', sliderSchema],
  ['matrix', matrixSchema],
  ['form', formSchema],
  ['kanban', kanbanSchema],
  ['annotate', annotateSchema],
];

export const componentSchemas: ReadonlyMap<string, z.ZodType> = new Map(entries);

// ─── JSON Schema Helper ─────────────────────────────────────

export function getJsonSchema(componentType: string): object | undefined {
  const schema = componentSchemas.get(componentType);
  if (!schema) return undefined;
  return zodToJsonSchema(schema);
}
