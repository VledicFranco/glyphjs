import { describe, it, expect } from 'vitest';
import {
  calloutSchema,
  tabsSchema,
  stepsSchema,
  tableSchema,
  graphSchema,
  chartSchema,
  relationSchema,
  timelineSchema,
  pollSchema,
  ratingSchema,
  rankerSchema,
  sliderSchema,
  matrixSchema,
  formSchema,
  kanbanSchema,
  annotateSchema,
} from '../index.js';

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Assert that safeParse fails for the given schema and data.
 */
function expectFailure(
  schema: { safeParse: (data: unknown) => { success: boolean } },
  data: unknown,
) {
  const result = schema.safeParse(data);
  expect(result.success).toBe(false);
}

/**
 * Assert that safeParse succeeds for the given schema and data.
 */
function expectSuccess(
  schema: { safeParse: (data: unknown) => { success: boolean } },
  data: unknown,
) {
  const result = schema.safeParse(data);
  expect(result.success).toBe(true);
}

// ─── Callout Schema Negative Tests ──────────────────────────

describe('calloutSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(calloutSchema, {});
  });

  it('rejects when "type" is missing', () => {
    expectFailure(calloutSchema, { content: 'Some content' });
  });

  it('rejects when "content" is missing', () => {
    expectFailure(calloutSchema, { type: 'info' });
  });

  it('rejects when "type" is a number instead of string', () => {
    expectFailure(calloutSchema, { type: 42, content: 'text' });
  });

  it('rejects when "content" is a number instead of string', () => {
    expectFailure(calloutSchema, { type: 'info', content: 123 });
  });

  it('rejects when "type" is a boolean', () => {
    expectFailure(calloutSchema, { type: true, content: 'text' });
  });

  it('rejects when "content" is an array', () => {
    expectFailure(calloutSchema, { type: 'info', content: ['a', 'b'] });
  });

  it('rejects an invalid type value (not warning/info/tip/error)', () => {
    expectFailure(calloutSchema, { type: 'danger', content: 'text' });
  });

  it('rejects type "notice" (not in enum)', () => {
    expectFailure(calloutSchema, { type: 'notice', content: 'text' });
  });

  it('rejects type "success" (not in enum)', () => {
    expectFailure(calloutSchema, { type: 'success', content: 'text' });
  });

  it('rejects null as input', () => {
    expectFailure(calloutSchema, null);
  });

  it('rejects a string as input', () => {
    expectFailure(calloutSchema, 'not an object');
  });

  it('rejects an array as input', () => {
    expectFailure(calloutSchema, [{ type: 'info', content: 'text' }]);
  });

  it('accepts valid input with extra unknown fields (Zod strips by default)', () => {
    expectSuccess(calloutSchema, { type: 'info', content: 'text', extra: 'field' });
  });

  it('accepts valid input with optional title', () => {
    expectSuccess(calloutSchema, { type: 'warning', content: 'text', title: 'Title' });
  });
});

// ─── Tabs Schema Negative Tests ─────────────────────────────

describe('tabsSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(tabsSchema, {});
  });

  it('rejects when "tabs" is missing', () => {
    expectFailure(tabsSchema, { other: 'data' });
  });

  it('rejects when "tabs" is a string instead of array', () => {
    expectFailure(tabsSchema, { tabs: 'not-an-array' });
  });

  it('rejects when "tabs" is a number', () => {
    expectFailure(tabsSchema, { tabs: 42 });
  });

  it('rejects when "tabs" is null', () => {
    expectFailure(tabsSchema, { tabs: null });
  });

  it('rejects tab items missing "label"', () => {
    expectFailure(tabsSchema, { tabs: [{ content: 'text' }] });
  });

  it('rejects tab items missing "content"', () => {
    expectFailure(tabsSchema, { tabs: [{ label: 'Tab 1' }] });
  });

  it('rejects tab items with numeric label', () => {
    expectFailure(tabsSchema, { tabs: [{ label: 123, content: 'text' }] });
  });

  it('rejects tab items with numeric content', () => {
    expectFailure(tabsSchema, { tabs: [{ label: 'Tab 1', content: 456 }] });
  });

  it('accepts an empty tabs array', () => {
    // z.array() with no .min() allows empty arrays
    expectSuccess(tabsSchema, { tabs: [] });
  });

  it('rejects null as input', () => {
    expectFailure(tabsSchema, null);
  });

  it('rejects an array as input', () => {
    expectFailure(tabsSchema, [{ tabs: [] }]);
  });
});

// ─── Steps Schema Negative Tests ────────────────────────────

describe('stepsSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(stepsSchema, {});
  });

  it('rejects when "steps" is missing', () => {
    expectFailure(stepsSchema, { other: 'data' });
  });

  it('rejects when "steps" is a string instead of array', () => {
    expectFailure(stepsSchema, { steps: 'not-an-array' });
  });

  it('rejects when "steps" is a number', () => {
    expectFailure(stepsSchema, { steps: 99 });
  });

  it('rejects step items missing "title"', () => {
    expectFailure(stepsSchema, { steps: [{ content: 'Do this' }] });
  });

  it('rejects step items missing "content"', () => {
    expectFailure(stepsSchema, { steps: [{ title: 'Step 1' }] });
  });

  it('rejects step items with numeric title', () => {
    expectFailure(stepsSchema, { steps: [{ title: 123, content: 'text' }] });
  });

  it('rejects step items with numeric content', () => {
    expectFailure(stepsSchema, { steps: [{ title: 'Step 1', content: 456 }] });
  });

  it('rejects an invalid status value', () => {
    expectFailure(stepsSchema, {
      steps: [{ title: 'Step 1', content: 'text', status: 'done' }],
    });
  });

  it('rejects status "in-progress" (not in enum)', () => {
    expectFailure(stepsSchema, {
      steps: [{ title: 'Step 1', content: 'text', status: 'in-progress' }],
    });
  });

  it('rejects status as a boolean', () => {
    expectFailure(stepsSchema, {
      steps: [{ title: 'Step 1', content: 'text', status: true }],
    });
  });

  it('accepts valid step with status "pending"', () => {
    expectSuccess(stepsSchema, {
      steps: [{ title: 'Step 1', content: 'text', status: 'pending' }],
    });
  });

  it('accepts valid step with status "active"', () => {
    expectSuccess(stepsSchema, {
      steps: [{ title: 'Step 1', content: 'text', status: 'active' }],
    });
  });

  it('accepts valid step with status "completed"', () => {
    expectSuccess(stepsSchema, {
      steps: [{ title: 'Step 1', content: 'text', status: 'completed' }],
    });
  });

  it('rejects null as input', () => {
    expectFailure(stepsSchema, null);
  });
});

// ─── Table Schema Negative Tests ────────────────────────────

describe('tableSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(tableSchema, {});
  });

  it('rejects when "columns" is missing', () => {
    expectFailure(tableSchema, { rows: [] });
  });

  it('rejects when "rows" is missing', () => {
    expectFailure(tableSchema, {
      columns: [{ key: 'name', label: 'Name' }],
    });
  });

  it('rejects when "columns" is a string', () => {
    expectFailure(tableSchema, { columns: 'not-an-array', rows: [] });
  });

  it('rejects when "rows" is a string', () => {
    expectFailure(tableSchema, {
      columns: [{ key: 'name', label: 'Name' }],
      rows: 'not-an-array',
    });
  });

  it('rejects columns missing "key"', () => {
    expectFailure(tableSchema, {
      columns: [{ label: 'Name' }],
      rows: [],
    });
  });

  it('rejects columns missing "label"', () => {
    expectFailure(tableSchema, {
      columns: [{ key: 'name' }],
      rows: [],
    });
  });

  it('rejects columns with numeric key', () => {
    expectFailure(tableSchema, {
      columns: [{ key: 123, label: 'Name' }],
      rows: [],
    });
  });

  it('rejects invalid column type enum value', () => {
    expectFailure(tableSchema, {
      columns: [{ key: 'name', label: 'Name', type: 'text' }],
      rows: [],
    });
  });

  it('rejects invalid aggregation function enum value', () => {
    expectFailure(tableSchema, {
      columns: [{ key: 'val', label: 'Value' }],
      rows: [],
      aggregation: [{ column: 'val', function: 'median' }],
    });
  });

  it('accepts rows with keys not matching columns (schema does not enforce key alignment)', () => {
    // The table schema uses z.record(z.unknown()) for rows, so any keys are valid
    expectSuccess(tableSchema, {
      columns: [{ key: 'name', label: 'Name' }],
      rows: [{ totally_unrelated_key: 'value' }],
    });
  });

  it('accepts empty columns and rows arrays', () => {
    expectSuccess(tableSchema, { columns: [], rows: [] });
  });

  it('rejects null as input', () => {
    expectFailure(tableSchema, null);
  });
});

// ─── Graph Schema Negative Tests ────────────────────────────

describe('graphSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(graphSchema, {});
  });

  it('rejects when "type" is missing', () => {
    expectFailure(graphSchema, {
      nodes: [{ id: 'a', label: 'A' }],
      edges: [],
    });
  });

  it('rejects when "nodes" is missing', () => {
    expectFailure(graphSchema, {
      type: 'dag',
      edges: [],
    });
  });

  it('rejects when "edges" is missing', () => {
    expectFailure(graphSchema, {
      type: 'dag',
      nodes: [{ id: 'a', label: 'A' }],
    });
  });

  it('rejects an invalid graph type', () => {
    expectFailure(graphSchema, {
      type: 'tree',
      nodes: [{ id: 'a', label: 'A' }],
      edges: [],
    });
  });

  it('rejects when "nodes" is a string', () => {
    expectFailure(graphSchema, {
      type: 'dag',
      nodes: 'not-an-array',
      edges: [],
    });
  });

  it('rejects when "edges" is a string', () => {
    expectFailure(graphSchema, {
      type: 'dag',
      nodes: [{ id: 'a', label: 'A' }],
      edges: 'not-an-array',
    });
  });

  it('rejects nodes missing "id"', () => {
    expectFailure(graphSchema, {
      type: 'dag',
      nodes: [{ label: 'A' }],
      edges: [],
    });
  });

  it('rejects nodes missing "label"', () => {
    expectFailure(graphSchema, {
      type: 'dag',
      nodes: [{ id: 'a' }],
      edges: [],
    });
  });

  it('rejects nodes with numeric id', () => {
    expectFailure(graphSchema, {
      type: 'dag',
      nodes: [{ id: 123, label: 'A' }],
      edges: [],
    });
  });

  it('rejects edges missing "from"', () => {
    expectFailure(graphSchema, {
      type: 'dag',
      nodes: [{ id: 'a', label: 'A' }],
      edges: [{ to: 'a' }],
    });
  });

  it('rejects edges missing "to"', () => {
    expectFailure(graphSchema, {
      type: 'dag',
      nodes: [{ id: 'a', label: 'A' }],
      edges: [{ from: 'a' }],
    });
  });

  it('rejects an invalid layout value', () => {
    expectFailure(graphSchema, {
      type: 'dag',
      nodes: [{ id: 'a', label: 'A' }],
      edges: [],
      layout: 'circular',
    });
  });

  it('accepts edges referencing non-existent nodes (schema does not enforce referential integrity)', () => {
    expectSuccess(graphSchema, {
      type: 'dag',
      nodes: [{ id: 'a', label: 'A' }],
      edges: [{ from: 'a', to: 'nonexistent' }],
    });
  });

  it('accepts empty nodes and edges arrays', () => {
    expectSuccess(graphSchema, {
      type: 'dag',
      nodes: [],
      edges: [],
    });
  });

  it('rejects null as input', () => {
    expectFailure(graphSchema, null);
  });
});

// ─── Chart Schema Negative Tests ────────────────────────────

describe('chartSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(chartSchema, {});
  });

  it('rejects when "type" is missing', () => {
    expectFailure(chartSchema, {
      series: [{ name: 'S1', data: [{ x: 1, y: 2 }] }],
    });
  });

  it('rejects when "series" is missing', () => {
    expectFailure(chartSchema, { type: 'line' });
  });

  it('rejects an invalid chart type', () => {
    expectFailure(chartSchema, {
      type: 'pie',
      series: [{ name: 'S1', data: [{ x: 1, y: 2 }] }],
    });
  });

  it('rejects when "series" is a string', () => {
    expectFailure(chartSchema, { type: 'line', series: 'not-an-array' });
  });

  it('rejects series items missing "name"', () => {
    expectFailure(chartSchema, {
      type: 'line',
      series: [{ data: [{ x: 1, y: 2 }] }],
    });
  });

  it('rejects series items missing "data"', () => {
    expectFailure(chartSchema, {
      type: 'line',
      series: [{ name: 'S1' }],
    });
  });

  it('rejects series items with numeric name', () => {
    expectFailure(chartSchema, {
      type: 'line',
      series: [{ name: 123, data: [{ x: 1, y: 2 }] }],
    });
  });

  it('rejects series data containing non-record values', () => {
    expectFailure(chartSchema, {
      type: 'line',
      series: [{ name: 'S1', data: ['not-a-record'] }],
    });
  });

  it('rejects series data records with boolean values', () => {
    expectFailure(chartSchema, {
      type: 'line',
      series: [{ name: 'S1', data: [{ x: true }] }],
    });
  });

  it('accepts an empty series array', () => {
    expectSuccess(chartSchema, { type: 'line', series: [] });
  });

  it('accepts input without xAxis and yAxis (they are optional)', () => {
    expectSuccess(chartSchema, {
      type: 'bar',
      series: [{ name: 'S1', data: [{ x: 1, y: 2 }] }],
    });
  });

  it('rejects xAxis missing "key"', () => {
    expectFailure(chartSchema, {
      type: 'line',
      series: [{ name: 'S1', data: [{ x: 1, y: 2 }] }],
      xAxis: { label: 'X Label' },
    });
  });

  it('rejects yAxis missing "key"', () => {
    expectFailure(chartSchema, {
      type: 'line',
      series: [{ name: 'S1', data: [{ x: 1, y: 2 }] }],
      yAxis: { label: 'Y Label' },
    });
  });

  it('rejects xAxis with numeric key', () => {
    expectFailure(chartSchema, {
      type: 'line',
      series: [{ name: 'S1', data: [{ x: 1, y: 2 }] }],
      xAxis: { key: 123 },
    });
  });

  it('rejects legend as a string', () => {
    expectFailure(chartSchema, {
      type: 'line',
      series: [{ name: 'S1', data: [{ x: 1, y: 2 }] }],
      legend: 'yes',
    });
  });

  it('rejects null as input', () => {
    expectFailure(chartSchema, null);
  });
});

// ─── Relation Schema Negative Tests ─────────────────────────

describe('relationSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(relationSchema, {});
  });

  it('rejects when "entities" is missing', () => {
    expectFailure(relationSchema, {
      relationships: [{ from: 'a', to: 'b', cardinality: '1:1' }],
    });
  });

  it('rejects when "relationships" is missing', () => {
    expectFailure(relationSchema, {
      entities: [{ id: 'a', label: 'A' }],
    });
  });

  it('rejects when "entities" is a string', () => {
    expectFailure(relationSchema, {
      entities: 'not-an-array',
      relationships: [],
    });
  });

  it('rejects when "relationships" is a string', () => {
    expectFailure(relationSchema, {
      entities: [{ id: 'a', label: 'A' }],
      relationships: 'not-an-array',
    });
  });

  it('rejects entities missing "id"', () => {
    expectFailure(relationSchema, {
      entities: [{ label: 'A' }],
      relationships: [],
    });
  });

  it('rejects entities missing "label"', () => {
    expectFailure(relationSchema, {
      entities: [{ id: 'a' }],
      relationships: [],
    });
  });

  it('rejects entities with numeric id', () => {
    expectFailure(relationSchema, {
      entities: [{ id: 123, label: 'A' }],
      relationships: [],
    });
  });

  it('rejects relationships missing "from"', () => {
    expectFailure(relationSchema, {
      entities: [{ id: 'a', label: 'A' }],
      relationships: [{ to: 'a', cardinality: '1:1' }],
    });
  });

  it('rejects relationships missing "to"', () => {
    expectFailure(relationSchema, {
      entities: [{ id: 'a', label: 'A' }],
      relationships: [{ from: 'a', cardinality: '1:1' }],
    });
  });

  it('rejects relationships missing "cardinality"', () => {
    expectFailure(relationSchema, {
      entities: [{ id: 'a', label: 'A' }],
      relationships: [{ from: 'a', to: 'a' }],
    });
  });

  it('rejects an invalid cardinality value', () => {
    expectFailure(relationSchema, {
      entities: [{ id: 'a', label: 'A' }],
      relationships: [{ from: 'a', to: 'a', cardinality: 'many-to-many' }],
    });
  });

  it('rejects cardinality "1:*" (not in enum)', () => {
    expectFailure(relationSchema, {
      entities: [{ id: 'a', label: 'A' }],
      relationships: [{ from: 'a', to: 'a', cardinality: '1:*' }],
    });
  });

  it('rejects an invalid layout value', () => {
    expectFailure(relationSchema, {
      entities: [{ id: 'a', label: 'A' }],
      relationships: [],
      layout: 'radial',
    });
  });

  it('accepts an empty entities array', () => {
    expectSuccess(relationSchema, { entities: [], relationships: [] });
  });

  it('accepts valid cardinality values', () => {
    for (const cardinality of ['1:1', '1:N', 'N:1', 'N:M']) {
      expectSuccess(relationSchema, {
        entities: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        relationships: [{ from: 'a', to: 'b', cardinality }],
      });
    }
  });

  it('rejects null as input', () => {
    expectFailure(relationSchema, null);
  });
});

// ─── Timeline Schema Negative Tests ─────────────────────────

describe('timelineSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(timelineSchema, {});
  });

  it('rejects when "events" is missing', () => {
    expectFailure(timelineSchema, { other: 'data' });
  });

  it('rejects when "events" is a string', () => {
    expectFailure(timelineSchema, { events: 'not-an-array' });
  });

  it('rejects when "events" is a number', () => {
    expectFailure(timelineSchema, { events: 42 });
  });

  it('rejects when "events" is null', () => {
    expectFailure(timelineSchema, { events: null });
  });

  it('rejects events missing "date"', () => {
    expectFailure(timelineSchema, {
      events: [{ title: 'Event 1' }],
    });
  });

  it('rejects events missing "title"', () => {
    expectFailure(timelineSchema, {
      events: [{ date: '2024-01-01' }],
    });
  });

  it('rejects events with numeric date', () => {
    expectFailure(timelineSchema, {
      events: [{ date: 20240101, title: 'Event 1' }],
    });
  });

  it('rejects events with numeric title', () => {
    expectFailure(timelineSchema, {
      events: [{ date: '2024-01-01', title: 999 }],
    });
  });

  it('rejects an invalid orientation value', () => {
    expectFailure(timelineSchema, {
      events: [{ date: '2024-01-01', title: 'Event 1' }],
      orientation: 'diagonal',
    });
  });

  it('rejects orientation as a boolean', () => {
    expectFailure(timelineSchema, {
      events: [{ date: '2024-01-01', title: 'Event 1' }],
      orientation: true,
    });
  });

  it('accepts an empty events array', () => {
    expectSuccess(timelineSchema, { events: [] });
  });

  it('accepts valid orientation "vertical"', () => {
    expectSuccess(timelineSchema, {
      events: [{ date: '2024-01-01', title: 'Event 1' }],
      orientation: 'vertical',
    });
  });

  it('accepts valid orientation "horizontal"', () => {
    expectSuccess(timelineSchema, {
      events: [{ date: '2024-01-01', title: 'Event 1' }],
      orientation: 'horizontal',
    });
  });

  it('rejects null as input', () => {
    expectFailure(timelineSchema, null);
  });

  it('rejects an array as input', () => {
    expectFailure(timelineSchema, [{ events: [] }]);
  });
});

// ─── Poll Schema Negative Tests ────────────────────────────

describe('pollSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(pollSchema, {});
  });

  it('rejects when "question" is missing', () => {
    expectFailure(pollSchema, { options: ['A', 'B'] });
  });

  it('rejects when "options" is missing', () => {
    expectFailure(pollSchema, { question: 'Pick one' });
  });

  it('rejects when "options" has fewer than 2 items', () => {
    expectFailure(pollSchema, { question: 'Pick one', options: ['Only'] });
  });

  it('rejects when "options" has more than 10 items', () => {
    expectFailure(pollSchema, {
      question: 'Pick one',
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
    });
  });

  it('rejects when "question" is a number', () => {
    expectFailure(pollSchema, { question: 42, options: ['A', 'B'] });
  });

  it('rejects when "options" contains non-strings', () => {
    expectFailure(pollSchema, { question: 'Pick one', options: [1, 2] });
  });

  it('rejects when "multiple" is a string', () => {
    expectFailure(pollSchema, { question: 'Pick one', options: ['A', 'B'], multiple: 'yes' });
  });

  it('rejects null as input', () => {
    expectFailure(pollSchema, null);
  });

  it('accepts valid input with defaults', () => {
    expectSuccess(pollSchema, { question: 'Pick one', options: ['A', 'B'] });
  });
});

// ─── Rating Schema Negative Tests ──────────────────────────

describe('ratingSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(ratingSchema, {});
  });

  it('rejects when "items" is missing', () => {
    expectFailure(ratingSchema, { title: 'Rate', scale: 5 });
  });

  it('rejects when "items" is empty', () => {
    expectFailure(ratingSchema, { items: [] });
  });

  it('rejects when "scale" is below minimum (2)', () => {
    expectFailure(ratingSchema, { items: [{ label: 'A' }], scale: 1 });
  });

  it('rejects when "scale" is above maximum (10)', () => {
    expectFailure(ratingSchema, { items: [{ label: 'A' }], scale: 11 });
  });

  it('rejects an invalid "mode" value', () => {
    expectFailure(ratingSchema, { items: [{ label: 'A' }], mode: 'emoji' });
  });

  it('rejects when items are missing "label"', () => {
    expectFailure(ratingSchema, { items: [{ description: 'desc' }] });
  });

  it('rejects null as input', () => {
    expectFailure(ratingSchema, null);
  });

  it('accepts valid minimal input', () => {
    expectSuccess(ratingSchema, { items: [{ label: 'Quality' }] });
  });
});

// ─── Ranker Schema Negative Tests ──────────────────────────

describe('rankerSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(rankerSchema, {});
  });

  it('rejects when "items" is missing', () => {
    expectFailure(rankerSchema, { title: 'Rank' });
  });

  it('rejects when "items" has fewer than 2 entries', () => {
    expectFailure(rankerSchema, { items: [{ id: 'a', label: 'A' }] });
  });

  it('rejects items missing "id"', () => {
    expectFailure(rankerSchema, {
      items: [{ label: 'A' }, { id: 'b', label: 'B' }],
    });
  });

  it('rejects items missing "label"', () => {
    expectFailure(rankerSchema, {
      items: [{ id: 'a' }, { id: 'b', label: 'B' }],
    });
  });

  it('rejects null as input', () => {
    expectFailure(rankerSchema, null);
  });

  it('accepts valid input with 2 items', () => {
    expectSuccess(rankerSchema, {
      items: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
    });
  });
});

// ─── Slider Schema Negative Tests ──────────────────────────

describe('sliderSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(sliderSchema, {});
  });

  it('rejects when "parameters" is missing', () => {
    expectFailure(sliderSchema, { title: 'Slider' });
  });

  it('rejects when "parameters" is empty', () => {
    expectFailure(sliderSchema, { parameters: [] });
  });

  it('rejects parameters missing "id"', () => {
    expectFailure(sliderSchema, { parameters: [{ label: 'Volume' }] });
  });

  it('rejects parameters missing "label"', () => {
    expectFailure(sliderSchema, { parameters: [{ id: 'vol' }] });
  });

  it('rejects an invalid "layout" value', () => {
    expectFailure(sliderSchema, {
      parameters: [{ id: 'vol', label: 'Volume' }],
      layout: 'diagonal',
    });
  });

  it('rejects when "step" is zero or negative', () => {
    expectFailure(sliderSchema, {
      parameters: [{ id: 'vol', label: 'Volume', step: 0 }],
    });
  });

  it('rejects null as input', () => {
    expectFailure(sliderSchema, null);
  });

  it('accepts valid minimal input', () => {
    expectSuccess(sliderSchema, { parameters: [{ id: 'vol', label: 'Volume' }] });
  });
});

// ─── Matrix Schema Negative Tests ──────────────────────────

describe('matrixSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(matrixSchema, {});
  });

  it('rejects when "columns" is missing', () => {
    expectFailure(matrixSchema, { rows: [{ id: 'r1', label: 'Row' }] });
  });

  it('rejects when "rows" is missing', () => {
    expectFailure(matrixSchema, { columns: [{ id: 'c1', label: 'Col' }] });
  });

  it('rejects when "columns" is empty', () => {
    expectFailure(matrixSchema, {
      columns: [],
      rows: [{ id: 'r1', label: 'Row' }],
    });
  });

  it('rejects when "rows" is empty', () => {
    expectFailure(matrixSchema, {
      columns: [{ id: 'c1', label: 'Col' }],
      rows: [],
    });
  });

  it('rejects when "scale" is below minimum (2)', () => {
    expectFailure(matrixSchema, {
      columns: [{ id: 'c1', label: 'Col' }],
      rows: [{ id: 'r1', label: 'Row' }],
      scale: 1,
    });
  });

  it('rejects when "scale" is above maximum (10)', () => {
    expectFailure(matrixSchema, {
      columns: [{ id: 'c1', label: 'Col' }],
      rows: [{ id: 'r1', label: 'Row' }],
      scale: 11,
    });
  });

  it('rejects columns with zero weight', () => {
    expectFailure(matrixSchema, {
      columns: [{ id: 'c1', label: 'Col', weight: 0 }],
      rows: [{ id: 'r1', label: 'Row' }],
    });
  });

  it('rejects null as input', () => {
    expectFailure(matrixSchema, null);
  });

  it('accepts valid minimal input', () => {
    expectSuccess(matrixSchema, {
      columns: [{ id: 'c1', label: 'Col' }],
      rows: [{ id: 'r1', label: 'Row' }],
    });
  });
});

// ─── Form Schema Negative Tests ────────────────────────────

describe('formSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(formSchema, {});
  });

  it('rejects when "fields" is missing', () => {
    expectFailure(formSchema, { title: 'Form' });
  });

  it('rejects when "fields" is empty', () => {
    expectFailure(formSchema, { fields: [] });
  });

  it('rejects fields with invalid "type"', () => {
    expectFailure(formSchema, {
      fields: [{ type: 'date', id: 'dob', label: 'Date of Birth' }],
    });
  });

  it('rejects text fields missing "id"', () => {
    expectFailure(formSchema, {
      fields: [{ type: 'text', label: 'Name' }],
    });
  });

  it('rejects text fields missing "label"', () => {
    expectFailure(formSchema, {
      fields: [{ type: 'text', id: 'name' }],
    });
  });

  it('rejects select fields missing "options"', () => {
    expectFailure(formSchema, {
      fields: [{ type: 'select', id: 'choice', label: 'Choice' }],
    });
  });

  it('rejects textarea fields with rows > 20', () => {
    expectFailure(formSchema, {
      fields: [{ type: 'textarea', id: 'notes', label: 'Notes', rows: 25 }],
    });
  });

  it('rejects null as input', () => {
    expectFailure(formSchema, null);
  });

  it('accepts valid minimal input', () => {
    expectSuccess(formSchema, {
      fields: [{ type: 'text', id: 'name', label: 'Name' }],
    });
  });
});

// ─── Kanban Schema Negative Tests ──────────────────────────

describe('kanbanSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(kanbanSchema, {});
  });

  it('rejects when "columns" is missing', () => {
    expectFailure(kanbanSchema, { title: 'Board' });
  });

  it('rejects when "columns" is empty', () => {
    expectFailure(kanbanSchema, { columns: [] });
  });

  it('rejects columns missing "id"', () => {
    expectFailure(kanbanSchema, {
      columns: [{ title: 'To Do' }],
    });
  });

  it('rejects columns missing "title"', () => {
    expectFailure(kanbanSchema, {
      columns: [{ id: 'todo' }],
    });
  });

  it('rejects cards missing "id"', () => {
    expectFailure(kanbanSchema, {
      columns: [{ id: 'todo', title: 'To Do', cards: [{ title: 'Task' }] }],
    });
  });

  it('rejects cards missing "title"', () => {
    expectFailure(kanbanSchema, {
      columns: [{ id: 'todo', title: 'To Do', cards: [{ id: 'task1' }] }],
    });
  });

  it('rejects an invalid card "priority" value', () => {
    expectFailure(kanbanSchema, {
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          cards: [{ id: 'task1', title: 'Task', priority: 'critical' }],
        },
      ],
    });
  });

  it('rejects null as input', () => {
    expectFailure(kanbanSchema, null);
  });

  it('accepts valid column with no cards', () => {
    expectSuccess(kanbanSchema, {
      columns: [{ id: 'todo', title: 'To Do' }],
    });
  });
});

// ─── Annotate Schema Negative Tests ────────────────────────

describe('annotateSchema negative tests', () => {
  it('rejects an empty object', () => {
    expectFailure(annotateSchema, {});
  });

  it('rejects when "text" is missing', () => {
    expectFailure(annotateSchema, {
      labels: [{ name: 'Bug', color: '#dc2626' }],
    });
  });

  it('rejects when "labels" is missing', () => {
    expectFailure(annotateSchema, { text: 'Some text' });
  });

  it('rejects when "labels" is empty', () => {
    expectFailure(annotateSchema, { text: 'Some text', labels: [] });
  });

  it('rejects labels missing "name"', () => {
    expectFailure(annotateSchema, {
      text: 'Some text',
      labels: [{ color: '#dc2626' }],
    });
  });

  it('rejects labels missing "color"', () => {
    expectFailure(annotateSchema, {
      text: 'Some text',
      labels: [{ name: 'Bug' }],
    });
  });

  it('rejects annotations with negative "start"', () => {
    expectFailure(annotateSchema, {
      text: 'Some text',
      labels: [{ name: 'Bug', color: '#dc2626' }],
      annotations: [{ start: -1, end: 5, label: 'Bug' }],
    });
  });

  it('rejects annotations missing "label"', () => {
    expectFailure(annotateSchema, {
      text: 'Some text',
      labels: [{ name: 'Bug', color: '#dc2626' }],
      annotations: [{ start: 0, end: 5 }],
    });
  });

  it('rejects null as input', () => {
    expectFailure(annotateSchema, null);
  });

  it('accepts valid minimal input', () => {
    expectSuccess(annotateSchema, {
      text: 'Some text',
      labels: [{ name: 'Note', color: '#3b82f6' }],
    });
  });
});
