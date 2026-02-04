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
import { architectureDefinition } from '../../packages/components/src/architecture/index';
import { accordionDefinition } from '../../packages/components/src/accordion/index';
import { cardDefinition } from '../../packages/components/src/card/index';
import { codeDiffDefinition } from '../../packages/components/src/codediff/index';
import { comparisonDefinition } from '../../packages/components/src/comparison/index';
import { equationDefinition } from '../../packages/components/src/equation/index';
import { fileTreeDefinition } from '../../packages/components/src/filetree/index';
import { flowchartDefinition } from '../../packages/components/src/flowchart/index';
import { kpiDefinition } from '../../packages/components/src/kpi/index';
import { mindMapDefinition } from '../../packages/components/src/mindmap/index';
import { quizDefinition } from '../../packages/components/src/quiz/index';
import { sequenceDefinition } from '../../packages/components/src/sequence/index';
import { infographicDefinition } from '../../packages/components/src/infographic/index';
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
  architectureDefinition,
  accordionDefinition,
  cardDefinition,
  codeDiffDefinition,
  comparisonDefinition,
  equationDefinition,
  fileTreeDefinition,
  flowchartDefinition,
  kpiDefinition,
  mindMapDefinition,
  quizDefinition,
  sequenceDefinition,
  infographicDefinition,
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

// ─── Architecture ────────────────────────────────────────────

describe('Architecture E2E', () => {
  it('compiles and renders simple architecture diagram', () => {
    const md = `\`\`\`ui:architecture
children:
  - id: web
    label: Web App
    icon: cloud
  - id: api
    label: API Server
    icon: server
  - id: db
    label: Database
    icon: database
edges:
  - from: web
    to: api
  - from: api
    to: db
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeInTheDocument();
  });

  it('compiles and renders architecture with nested zones', () => {
    const md = `\`\`\`ui:architecture
title: VPC
children:
  - id: vpc
    label: VPC
    type: zone
    children:
      - id: subnet
        label: Subnet
        type: zone
        children:
          - id: svc
            label: Service
            icon: server
  - id: user
    label: User
    icon: user
edges:
  - from: user
    to: svc
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeInTheDocument();
  });
});

// ─── Accordion ─────────────────────────────────────────────

describe('Accordion E2E', () => {
  it('compiles and renders accordion with multiple sections', () => {
    const md = `\`\`\`ui:accordion
sections:
  - title: Getting Started
    content: Install the package and configure your runtime.
  - title: API Reference
    content: See the full API documentation.
  - title: FAQ
    content: Frequently asked questions.
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const details = container.querySelectorAll('details');
    expect(details.length).toBeGreaterThanOrEqual(3);
  });
});

// ─── Card ──────────────────────────────────────────────────

describe('Card E2E', () => {
  it('compiles and renders card grid', () => {
    const md = `\`\`\`ui:card
cards:
  - title: Parser
    body: Parses Markdown into AST.
  - title: Compiler
    body: Compiles AST to IR.
  - title: Runtime
    body: Renders IR as React components.
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const headings = container.querySelectorAll('h3, h4, [class*="card"]');
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── CodeDiff ──────────────────────────────────────────────

describe('CodeDiff E2E', () => {
  it('compiles and renders code diff', () => {
    const md = `\`\`\`ui:codediff
language: javascript
before: "const x = 1;"
after: "const x = 2;"
beforeLabel: Original
afterLabel: Updated
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });
});

// ─── Comparison ────────────────────────────────────────────

describe('Comparison E2E', () => {
  it('compiles and renders comparison table', () => {
    const md = `\`\`\`ui:comparison
options:
  - name: Plan A
    description: Basic plan
  - name: Plan B
    description: Pro plan
features:
  - name: Storage
    values:
      - 10 GB
      - 100 GB
  - name: Support
    values:
      - Email
      - Phone
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });
});

// ─── Equation ──────────────────────────────────────────────

describe('Equation E2E', () => {
  it('compiles and renders equation with steps', () => {
    const md = `\`\`\`ui:equation
expression: "E = mc^2"
label: Mass-energy equivalence
steps:
  - expression: "E = mc^2"
    annotation: Einstein's equation
  - expression: "E / c^2 = m"
    annotation: Solve for mass
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    expect(container.textContent).toContain('E');
  });
});

// ─── FileTree ──────────────────────────────────────────────

describe('FileTree E2E', () => {
  it('compiles and renders file tree', () => {
    const md = `\`\`\`ui:filetree
root: project
defaultExpanded: true
tree:
  - name: src
    children:
      - name: index.ts
      - name: utils.ts
  - name: package.json
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const tree = container.querySelector('[role="tree"], [role="group"], ul');
    expect(tree).toBeInTheDocument();
  });
});

// ─── Flowchart ─────────────────────────────────────────────

describe('Flowchart E2E', () => {
  it('compiles and renders flowchart', () => {
    const md = `\`\`\`ui:flowchart
direction: top-down
nodes:
  - id: start
    type: start
    label: Begin
  - id: process
    type: process
    label: Process Data
  - id: end
    type: end
    label: Done
edges:
  - from: start
    to: process
  - from: process
    to: end
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeInTheDocument();
  });
});

// ─── KPI ───────────────────────────────────────────────────

describe('KPI E2E', () => {
  it('compiles and renders KPI metrics', () => {
    const md = `\`\`\`ui:kpi
title: Dashboard
metrics:
  - label: Revenue
    value: "$1.2M"
    delta: "+15%"
    trend: up
    sentiment: positive
  - label: Churn
    value: "2.1%"
    delta: "-0.3%"
    trend: down
    sentiment: positive
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    expect(container.textContent).toContain('Revenue');
    expect(container.textContent).toContain('$1.2M');
  });
});

// ─── MindMap ───────────────────────────────────────────────

describe('MindMap E2E', () => {
  it('compiles and renders mind map', () => {
    const md = `\`\`\`ui:mindmap
root: GlyphJS
layout: radial
children:
  - label: Parser
    children:
      - label: Remark
  - label: Compiler
  - label: Runtime
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeInTheDocument();
  });
});

// ─── Quiz ──────────────────────────────────────────────────

describe('Quiz E2E', () => {
  it('compiles and renders quiz with multiple choice', () => {
    const md = `\`\`\`ui:quiz
title: Quick Quiz
questions:
  - type: multiple-choice
    question: "What does GlyphJS compile?"
    options:
      - HTML
      - Markdown
      - YAML
    answer: 1
  - type: true-false
    question: "GlyphJS uses React."
    answer: true
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const region = container.querySelector('[role="region"]');
    expect(region).toBeInTheDocument();
  });
});

// ─── Sequence ──────────────────────────────────────────────

describe('Sequence E2E', () => {
  it('compiles and renders sequence diagram', () => {
    const md = `\`\`\`ui:sequence
title: API Call
actors:
  - id: client
    label: Client
  - id: server
    label: Server
messages:
  - from: client
    to: server
    label: GET /api/data
    type: message
  - from: server
    to: client
    label: 200 OK
    type: reply
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeInTheDocument();
  });
});

// ─── Infographic ───────────────────────────────────────────

describe('Infographic E2E', () => {
  it('compiles and renders infographic with stats', () => {
    const md = `\`\`\`ui:infographic
title: Company Overview
sections:
  - heading: Key Metrics
    items:
      - type: stat
        label: Users
        value: "1.2M"
      - type: stat
        label: Revenue
        value: "$5M"
      - type: progress
        label: Goal Completion
        value: 75
\`\`\``;

    const { result, container } = compileAndRender(md);

    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);

    expect(container.textContent).toContain('Key Metrics');
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
