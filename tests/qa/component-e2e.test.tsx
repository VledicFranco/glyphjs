// @vitest-environment jsdom
/**
 * Component E2E QA tests
 *
 * Compiles each component's doc-example markdown through the full pipeline
 * (markdown → compile → IR → render) and verifies that expected DOM elements
 * appear without errors or crashes.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { compile } from '../../packages/compiler/src/compile';
import { createGlyphRuntime } from '../../packages/runtime/src/create-runtime';
import { calloutDefinition } from '../../packages/components/src/callout/index';
import { tabsDefinition } from '../../packages/components/src/tabs/index';
import { stepsDefinition } from '../../packages/components/src/steps/index';
import { tableDefinition } from '../../packages/components/src/table/index';
import { graphDefinition } from '../../packages/components/src/graph/index';
import { chartDefinition } from '../../packages/components/src/chart/index';
import { relationDefinition } from '../../packages/components/src/relation/index';
import { timelineDefinition } from '../../packages/components/src/timeline/index';
import type { GlyphComponentDefinition } from '../../packages/types/src/index';

// ─── jsdom polyfills ────────────────────────────────────────
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver;
}

// ─── Component definitions ──────────────────────────────────

const allComponents: GlyphComponentDefinition[] = [
  calloutDefinition,
  tabsDefinition,
  stepsDefinition,
  tableDefinition,
  graphDefinition,
  chartDefinition,
  relationDefinition,
  timelineDefinition,
];

// ─── Helper ─────────────────────────────────────────────────

function compileAndRender(markdown: string) {
  const result = compile(markdown);
  const runtime = createGlyphRuntime({ components: allComponents });
  const { container } = render(<runtime.GlyphDocument ir={result.ir} />);
  return { result, container };
}

// ─── Callout ────────────────────────────────────────────────

describe('Callout E2E', () => {
  const variants = ['warning', 'info', 'tip', 'error'] as const;

  for (const variant of variants) {
    it(`compiles and renders ${variant} variant`, () => {
      const md = `\`\`\`ui:callout
type: ${variant}
title: Test ${variant}
content: This is a ${variant} callout.
\`\`\``;

      const { result, container } = compileAndRender(md);

      const errors = result.diagnostics.filter((d) => d.severity === 'error');
      expect(errors).toHaveLength(0);

      const note = container.querySelector('[role="note"]');
      expect(note).toBeInTheDocument();
    });
  }
});

// ─── Tabs ───────────────────────────────────────────────────

describe('Tabs E2E', () => {
  it('compiles and renders 3-tab example', () => {
    const md = `\`\`\`ui:tabs
tabs:
  - label: Overview
    content: General overview content.
  - label: API
    content: API documentation here.
  - label: Examples
    content: Usage examples.
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).toBeInTheDocument();

    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(3);
  });
});

// ─── Steps ──────────────────────────────────────────────────

describe('Steps E2E', () => {
  it('compiles and renders 3-step example', () => {
    const md = `\`\`\`ui:steps
steps:
  - title: Install Dependencies
    status: completed
    content: Run pnpm install to install all packages.
  - title: Configure the Runtime
    status: active
    content: Create a runtime instance with createGlyphRuntime.
  - title: Render Documents
    status: pending
    content: Pass compiled IR to GlyphDocument.
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const list = container.querySelector('ol');
    expect(list).toBeInTheDocument();

    const items = container.querySelectorAll('li');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });
});

// ─── Table ──────────────────────────────────────────────────

describe('Table E2E', () => {
  it('compiles and renders employee table', () => {
    const md = `\`\`\`ui:table
columns:
  - key: name
    label: Name
    sortable: true
  - key: role
    label: Role
  - key: department
    label: Department
rows:
  - name: Alice
    role: Engineer
    department: Platform
  - name: Bob
    role: Designer
    department: Product
  - name: Charlie
    role: Manager
    department: Engineering
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const table = container.querySelector('table, [role="grid"]');
    expect(table).toBeInTheDocument();

    const rows = container.querySelectorAll('tr');
    // Header row + 3 data rows
    expect(rows.length).toBeGreaterThanOrEqual(4);
  });
});

// ─── Graph ──────────────────────────────────────────────────

describe('Graph E2E', () => {
  it('compiles and renders DAG graph', () => {
    const md = `\`\`\`ui:graph
type: dag
nodes:
  - id: a
    label: Parser
  - id: b
    label: Compiler
  - id: c
    label: Runtime
edges:
  - from: a
    to: b
  - from: b
    to: c
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeInTheDocument();
  });

  it('compiles and renders mindmap graph', () => {
    const md = `\`\`\`ui:graph
type: mindmap
nodes:
  - id: center
    label: Glyph JS
  - id: parser
    label: Parser
  - id: compiler
    label: Compiler
edges:
  - from: center
    to: parser
  - from: center
    to: compiler
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeInTheDocument();
  });
});

// ─── Relation ───────────────────────────────────────────────

describe('Relation E2E', () => {
  it('compiles and renders ER diagram', () => {
    const md = `\`\`\`ui:relation
entities:
  - id: users
    label: User
    attributes:
      - name: id
        type: uuid
        primaryKey: true
      - name: email
        type: string
  - id: posts
    label: Post
    attributes:
      - name: id
        type: uuid
        primaryKey: true
      - name: title
        type: string
      - name: authorId
        type: uuid
relationships:
  - from: users
    to: posts
    cardinality: "1:N"
    label: writes
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeInTheDocument();
  });
});

// ─── Chart ──────────────────────────────────────────────────

describe('Chart E2E', () => {
  it('compiles and renders line chart', () => {
    const md = `\`\`\`ui:chart
type: line
series:
  - name: Revenue
    data:
      - x: Q1
        y: 120
      - x: Q2
        y: 185
      - x: Q3
        y: 210
xAxis:
  key: x
  label: Quarter
yAxis:
  key: y
  label: Revenue
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeInTheDocument();
  });

  it('compiles and renders bar chart', () => {
    const md = `\`\`\`ui:chart
type: bar
series:
  - name: Sales
    data:
      - x: Jan
        y: 50
      - x: Feb
        y: 80
      - x: Mar
        y: 120
xAxis:
  key: x
  label: Month
yAxis:
  key: y
  label: Sales
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeInTheDocument();
  });
});

// ─── Timeline ───────────────────────────────────────────────

describe('Timeline E2E', () => {
  it('compiles and renders vertical timeline with ISO dates', () => {
    const md = `\`\`\`ui:timeline
events:
  - date: "2026-01-15"
    title: Project kickoff
    description: Initial RFC published.
    type: milestone
  - date: "2026-01-22"
    title: Parser v0.1
    description: First working parser.
    type: release
  - date: "2026-02-05"
    title: Runtime v0.1
    type: release
orientation: vertical
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const timeline = container.querySelector('[role="img"]');
    expect(timeline).toBeInTheDocument();
    expect(timeline).toHaveAttribute('aria-label', 'Timeline with 3 events');

    // Events should be visible (not all clustered at epoch)
    const srList = container.querySelector('ol');
    expect(srList).toBeInTheDocument();
    const items = srList!.querySelectorAll('li');
    expect(items).toHaveLength(3);
  });

  it('compiles and renders horizontal timeline with YYYY-MM dates', () => {
    const md = `\`\`\`ui:timeline
orientation: horizontal
events:
  - date: "2026-01"
    title: Alpha Release
    description: Core pipeline working.
  - date: "2026-03"
    title: Beta Release
  - date: "2026-06"
    title: v1.0 GA
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const timeline = container.querySelector('[role="img"]');
    expect(timeline).toBeInTheDocument();

    // Horizontal container should have minHeight (not zero)
    const style = (timeline as HTMLElement).style;
    expect(parseInt(style.minHeight, 10)).toBeGreaterThanOrEqual(300);
  });

  it('compiles and renders timeline with quarter dates', () => {
    const md = `\`\`\`ui:timeline
events:
  - date: Q1 2026
    title: Alpha
    type: release
  - date: Q2 2026
    title: Beta
    type: release
  - date: Q3 2026
    title: GA
    type: milestone
orientation: horizontal
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const timeline = container.querySelector('[role="img"]');
    expect(timeline).toBeInTheDocument();

    // Should not show "Jan 1, 1970" for unparseable dates
    expect(container.textContent).not.toContain('1970');
  });
});

// ─── Gallery (Kitchen Sink) ─────────────────────────────────

describe('Gallery Kitchen Sink E2E', () => {
  it('compiles and renders multiple component types', () => {
    const md = `# Sprint 12 Retrospective

\`\`\`ui:callout
type: info
title: Sprint Summary
content: |
  Sprint 12 focused on performance optimization and bug fixes.
  We closed 23 issues and shipped 2 new features.
\`\`\`

## Issue Breakdown

\`\`\`ui:table
columns:
  - key: type
    label: Type
  - key: count
    label: Count
    sortable: true
  - key: closed
    label: Closed
    sortable: true
rows:
  - type: Bug
    count: 12
    closed: 11
  - type: Feature
    count: 5
    closed: 4
  - type: Chore
    count: 8
    closed: 8
\`\`\`

## Next Steps

\`\`\`ui:steps
steps:
  - title: Review open bugs
    status: active
    content: Triage remaining 1 bug from Sprint 12.
  - title: Plan Sprint 13
    status: pending
    content: Prioritize backlog items for next sprint.
  - title: Ship release
    status: pending
    content: Deploy v1.3.0 to production.
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    // Callout rendered
    const note = container.querySelector('[role="note"]');
    expect(note).toBeInTheDocument();

    // Table rendered
    const table = container.querySelector('table, [role="grid"]');
    expect(table).toBeInTheDocument();

    // Steps rendered
    const list = container.querySelector('ol');
    expect(list).toBeInTheDocument();

    // Heading rendered
    const heading = container.querySelector('h1');
    expect(heading).toBeInTheDocument();
    expect(heading!.textContent).toContain('Sprint 12 Retrospective');
  });
});
