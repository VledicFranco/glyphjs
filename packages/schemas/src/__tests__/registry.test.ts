import { describe, it, expect } from 'vitest';
import { componentSchemas, getJsonSchema } from '../registry.js';

const ALL_TYPES = [
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
  'heatmap',
  'funnel',
  'sankey',
  'decisiontree',
];

describe('componentSchemas', () => {
  it('has exactly 36 registered components', () => {
    expect(componentSchemas.size).toBe(36);
  });

  it('contains every expected component type', () => {
    for (const type of ALL_TYPES) {
      expect(componentSchemas.has(type)).toBe(true);
    }
  });
});

describe('getJsonSchema', () => {
  it('returns undefined for an unknown type', () => {
    expect(getJsonSchema('nonexistent')).toBeUndefined();
  });

  it('returns undefined for a prefixed type (ui:chart)', () => {
    expect(getJsonSchema('ui:chart')).toBeUndefined();
  });

  it('returns a defined object for every registered type', () => {
    for (const type of ALL_TYPES) {
      expect(getJsonSchema(type)).toBeDefined();
    }
  });

  it('every returned schema has type: object', () => {
    for (const type of ALL_TYPES) {
      const schema = getJsonSchema(type) as Record<string, unknown>;
      expect(schema['type']).toBe('object');
    }
  });

  it('every returned schema has a properties key', () => {
    for (const type of ALL_TYPES) {
      const schema = getJsonSchema(type) as Record<string, unknown>;
      expect(schema['properties']).toBeDefined();
    }
  });
});
