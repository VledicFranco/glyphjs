import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  graphSchema,
  tableSchema,
  chartSchema,
  relationSchema,
  timelineSchema,
  calloutSchema,
  tabsSchema,
  stepsSchema,
  architectureSchema,
  kpiSchema,
  accordionSchema,
  comparisonSchema,
  codediffSchema,
  flowchartSchema,
  filetreeSchema,
  sequenceSchema,
  mindmapSchema,
  equationSchema,
  quizSchema,
  cardSchema,
  infographicSchema,
  pollSchema,
  ratingSchema,
  rankerSchema,
  sliderSchema,
  matrixSchema,
  formSchema,
  kanbanSchema,
  annotateSchema,
  getJsonSchema,
} from '../index.js';

// ─── Setup ───────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesDir = join(__dirname, 'fixtures');

const ajv = new Ajv({ strict: false });

// Map component names to their Zod schemas
const zodSchemas: Record<string, typeof calloutSchema> = {
  graph: graphSchema,
  table: tableSchema,
  chart: chartSchema,
  relation: relationSchema,
  timeline: timelineSchema,
  callout: calloutSchema,
  tabs: tabsSchema,
  steps: stepsSchema,
  architecture: architectureSchema,
  kpi: kpiSchema,
  accordion: accordionSchema,
  comparison: comparisonSchema,
  codediff: codediffSchema,
  flowchart: flowchartSchema,
  filetree: filetreeSchema,
  sequence: sequenceSchema,
  mindmap: mindmapSchema,
  equation: equationSchema,
  quiz: quizSchema,
  card: cardSchema,
  infographic: infographicSchema,
  poll: pollSchema,
  rating: ratingSchema,
  ranker: rankerSchema,
  slider: sliderSchema,
  matrix: matrixSchema,
  form: formSchema,
  kanban: kanbanSchema,
  annotate: annotateSchema,
};

// ─── Helpers ─────────────────────────────────────────────────

function loadFixtures(component: string, kind: 'valid' | 'invalid') {
  const dir = join(fixturesDir, component);
  const prefix = kind === 'valid' ? 'valid-' : 'invalid-';
  const files = readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith('.json'));

  return files.map((file) => ({
    name: file.replace('.json', ''),
    data: JSON.parse(readFileSync(join(dir, file), 'utf-8')) as unknown,
  }));
}

// ─── Conformance Tests ──────────────────────────────────────

const components = [
  'graph',
  'table',
  'chart',
  'relation',
  'timeline',
  'callout',
  'tabs',
  'steps',
  'architecture',
  'kpi',
  'accordion',
  'comparison',
  'codediff',
  'flowchart',
  'filetree',
  'sequence',
  'mindmap',
  'equation',
  'quiz',
  'card',
  'infographic',
  'poll',
  'rating',
  'ranker',
  'slider',
  'matrix',
  'form',
  'kanban',
  'annotate',
] as const;

describe('Schema dual validation conformance', () => {
  for (const component of components) {
    describe(component, () => {
      const jsonSchema = getJsonSchema(component);
      const zodSchema = zodSchemas[component]!;

      // Ensure the JSON Schema was generated successfully
      it('should have a JSON Schema generated from the registry', () => {
        expect(jsonSchema).toBeDefined();
      });

      const validate = ajv.compile(jsonSchema!);

      // ── Valid fixtures ──────────────────────────────────
      const validFixtures = loadFixtures(component, 'valid');

      describe('valid fixtures', () => {
        for (const fixture of validFixtures) {
          it(`${fixture.name}: Zod accepts`, () => {
            expect(() => zodSchema.parse(fixture.data)).not.toThrow();
          });

          it(`${fixture.name}: JSON Schema accepts`, () => {
            const result = validate(fixture.data);
            expect(result).toBe(true);
            if (!result) {
              // Surface AJV errors in test output for debugging
              expect(validate.errors).toBeNull();
            }
          });
        }
      });

      // ── Invalid fixtures ────────────────────────────────
      const invalidFixtures = loadFixtures(component, 'invalid');

      describe('invalid fixtures', () => {
        for (const fixture of invalidFixtures) {
          it(`${fixture.name}: Zod rejects`, () => {
            const result = zodSchema.safeParse(fixture.data);
            expect(result.success).toBe(false);
          });

          it(`${fixture.name}: JSON Schema rejects`, () => {
            const result = validate(fixture.data);
            expect(result).toBe(false);
          });
        }
      });
    });
  }
});
