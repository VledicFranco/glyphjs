# RFC-001: Glyph JS — Initial Concept and Implementation

- **Status:** Draft
- **Authors:** VledicFranco
- **Created:** 2026-01-31
- **License:** MIT

---

## 1. Summary

Glyph JS is a framework for compiling Markdown documents into an Intermediate Representation (IR) that renders into interactive, visually rich user interfaces. The primary goal is to optimize communication between Large Language Models (LLMs) and humans — leveraging text as the medium for machines and visual cognition as the medium for humans.

The system introduces a three-layer architecture:

1. **Authoring (Markdown)** — LLMs and humans write structured Markdown annotated with UI semantics.
2. **Compilation (IR)** — A compiler translates annotated Markdown into a deterministic, versioned JSON IR.
3. **Rendering (UI)** — A React-based JavaScript runtime renders the IR into interactive, animated, and explorable information UIs.

## 2. Motivation

LLMs produce text. Humans consume information visually. Today, the gap between LLM output and human-optimized presentation is bridged by ad-hoc rendering (raw Markdown viewers, chat UIs with limited formatting). There is no standard pipeline for LLMs to express rich, interactive visualizations through a text-native authoring format.

Glyph JS closes this gap by defining:

- A Markdown-compatible authoring syntax that LLMs can generate reliably.
- A deterministic IR that decouples authoring from rendering.
- A plugin-driven rendering runtime that turns IR into interactive UIs.

## 3. Core Abstractions

### 3.1 Block

The atomic renderable unit. Every piece of content in Glyph JS is a Block — a paragraph of text, a graph, a table, a chart. Blocks are identified, typed, and carry their own data payload.

### 3.2 Component

A parameterized, interactive Block with a schema. Components define their accepted props via Zod schemas (with auto-generated JSON Schema for external consumers). Examples: `ui:graph`, `ui:table`, `ui:chart`.

### 3.3 Reference

A typed link between Blocks enabling cross-navigation and relational semantics. References allow one Block to point to another (e.g., a table row linking to a graph node), enabling explorable, interconnected documents.

### 3.4 Patch

An incremental IR update. Patches describe additions, modifications, and deletions against an existing IR document. They are the foundation for live/whiteboard sessions where an LLM iteratively builds a visualization.

## 4. Architecture

### 4.1 Package Structure

Glyph JS is organized as a multi-package monorepo with independently versioned and publishable packages:

| Package | Description |
|---|---|
| `@glyphjs/parser` | Markdown parser built on unified/remark. Extends remark with plugins for `ui:` fenced block syntax. Outputs a Glyph AST. |
| `@glyphjs/ir` | IR specification, types, and utilities. Defines the JSON IR schema, validation, diffing, and patch operations. |
| `@glyphjs/compiler` | Compiles Glyph AST into IR. Resolves references, validates component schemas, produces deterministic output. |
| `@glyphjs/runtime` | React-based rendering runtime. Consumes IR and renders interactive UI. Provides layout, theming, animation orchestration, and plugin registration. |
| `@glyphjs/components` | Built-in component library (graph, table, chart, relation, timeline, callout, tabs, steps). |
| `@glyphjs/schemas` | Zod schemas for all built-in components with JSON Schema generation. Shared validation layer. |
| `apps/docs` | Astro Starlight documentation site with interactive playground. Deployed to GitHub Pages. |

### 4.2 Data Flow

```
Markdown (annotated)
       |
       v
  @glyphjs/parser        — remark + custom plugins
       |
       v
   Glyph AST             — extended MDAST
       |
       v
  @glyphjs/compiler      — AST → IR compilation
       |
       v
   IR (JSON)              — deterministic, versioned
       |
       v
  @glyphjs/runtime        — React rendering engine
       |
       v
  Interactive UI           — D3, Dagre, React components
```

## 5. Markdown Authoring Model

### 5.1 Syntax

Extensions are expressed via fenced code blocks with a `ui:` prefix:

````markdown
# System Architecture

This diagram shows the main services and their dependencies.

```ui:graph
type: dag
nodes:
  - id: api
    label: API Gateway
  - id: auth
    label: Auth Service
  - id: db
    label: PostgreSQL
edges:
  - from: api
    to: auth
  - from: auth
    to: db
layout: top-down
```

The API Gateway routes all incoming requests through the Auth Service
before they reach the database.
````

### 5.2 Fenced Block Payload

- Payloads are **YAML** inside fenced blocks.
- Each payload is validated against its component's **Zod schema** at compile time.
- Validation errors produce clear diagnostics with line/column references back to the source Markdown.

### 5.3 Design Principles

- **LLM-friendly**: YAML in fenced blocks is a format LLMs generate reliably. No custom syntax beyond standard Markdown + fenced blocks.
- **Diffable**: Markdown with YAML blocks produces clean Git diffs.
- **Repository-native**: Source files are plain `.md` files that render meaningfully even in GitHub/GitLab Markdown viewers (as code blocks).

## 6. Intermediate Representation (IR)

### 6.1 Structure

The IR is a JSON document with the following top-level shape:

```typescript
interface GlyphIR {
  version: string;             // IR spec version (semver)
  id: string;                  // Document ID
  metadata: DocumentMetadata;  // Title, author, created, etc.
  blocks: Block[];             // Ordered list of content blocks
  references: Reference[];     // Cross-block links
  layout: LayoutHints;         // Global layout configuration
}

interface Block {
  id: string;                  // Unique block identifier
  type: string;                // Block type (text, ui:graph, ui:table, ...)
  data: unknown;               // Type-specific payload (validated by schema)
  position: SourcePosition;    // Source Markdown location
  children?: Block[];          // Nested blocks (for tabs, steps, etc.)
}
```

### 6.2 Properties

- **Deterministic**: The same Markdown input always produces the same IR output. No randomness, no environment-dependent behavior.
- **Versioned**: IR documents carry a spec version. The runtime can detect and migrate older IR formats.
- **Forward-compatible**: Unknown block types are preserved (not dropped), enabling graceful degradation.
- **Patch-friendly**: The IR structure supports JSON Patch (RFC 6902) operations for incremental updates.

## 7. Rendering Runtime

### 7.1 Technology

- **React-only** for v1. Other framework adapters (Vue, Svelte, Web Components) are out of scope.
- **D3.js** for graph rendering, animations, and low-level SVG/Canvas control.
- **Dagre** for DAG and hierarchical graph layout.
- Standard charts (line, bar, area, OHLC) rendered via D3.js directly.

### 7.2 Component Registry

The runtime exposes a component registry where built-in and custom components are registered:

```typescript
import { createGlyphRuntime } from '@glyphjs/runtime';
import { graphComponent, tableComponent } from '@glyphjs/components';

const runtime = createGlyphRuntime({
  components: [graphComponent, tableComponent, /* ... */],
  theme: 'light',
});
```

### 7.3 Theming and Layout

- CSS-variable-based theming system.
- Layout engine handles block positioning, spacing, and responsive behavior.
- Animation orchestration for transitions between states (e.g., when a graph is patched).

### 7.4 Plugin System

Third-party components can be registered as plugins:

```typescript
runtime.registerComponent({
  type: 'ui:custom-widget',
  schema: customWidgetSchema,       // Zod schema
  render: CustomWidgetComponent,    // React component
});
```

## 8. Built-in Components (v1)

All 8 components from the concept document are in scope for v1:

| Component | Type | Description |
|---|---|---|
| **Graph** | `ui:graph` | DAGs, flowcharts, mind maps, relational diagrams. D3 + Dagre rendering. |
| **Table** | `ui:table` | Sortable, filterable, aggregatable data tables. |
| **Chart** | `ui:chart` | Line, bar, area, and financial OHLC charts. D3-based. |
| **Relation** | `ui:relation` | Entity-relationship diagrams via declarative YAML. |
| **Timeline** | `ui:timeline` | Event sequences and system evolution visualizations. |
| **Callout** | `ui:callout` | Highlighted info/warning/error blocks for narrative structuring. |
| **Tabs** | `ui:tabs` | Tabbed content containers for organizing related blocks. |
| **Steps** | `ui:steps` | Sequential step-by-step guides with progress indication. |

### 8.1 Graph and Relation Abstraction

A unified relational abstraction underpins both `ui:graph` and `ui:relation`:

```typescript
interface RelationalModel {
  nodes: Node[];
  edges: Edge[];
  types?: TypeDefinition[];    // Node/edge type constraints
  layout: LayoutSemantic;      // top-down, left-right, force, radial
}
```

Specific diagram types (ER diagrams, mind maps, architecture diagrams) derive from this base by constraining schemas — e.g., ER diagrams require `entity` and `relationship` node types with `cardinality` on edges.

## 9. Schema System

### 9.1 Dual Schema Approach

Schemas are authored in **Zod** for TypeScript DX and runtime validation. **JSON Schema** is auto-generated for:

- External consumers and tooling.
- LLM prompt engineering (embedding schemas in system prompts).
- Documentation generation.

### 9.2 Example

```typescript
// @glyphjs/schemas/src/graph.ts
import { z } from 'zod';

export const graphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string().optional(),
  style: z.record(z.string()).optional(),
});

export const graphSchema = z.object({
  type: z.enum(['dag', 'flowchart', 'mindmap', 'force']),
  nodes: z.array(graphNodeSchema),
  edges: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string().optional(),
  })),
  layout: z.enum(['top-down', 'left-right', 'radial', 'force']).optional(),
});
```

## 10. MCP Integration (Spec Only — v1)

### 10.1 Overview

The MCP (Model Context Protocol) integration defines how LLMs interact with Glyph JS documents programmatically during live sessions. **v1 specifies the interface; implementation is deferred to v2.**

### 10.2 Proposed MCP Tools

| Tool | Description |
|---|---|
| `glyph_create_document` | Create a new IR document with metadata. |
| `glyph_add_block` | Add a block (graph, table, etc.) to a document. |
| `glyph_update_block` | Modify an existing block's data or properties. |
| `glyph_remove_block` | Remove a block from a document. |
| `glyph_add_node` | Add a node to a graph/relation block. |
| `glyph_add_edge` | Add an edge between nodes in a graph/relation block. |
| `glyph_link_entities` | Create a reference between two blocks. |
| `glyph_patch` | Apply an arbitrary IR patch (JSON Patch format). |
| `glyph_commit` | Serialize current IR state back to canonical Markdown. |

### 10.3 Session Model

- LLMs operate on IR documents via patches.
- Each session maintains an IR document state.
- Sessions can be committed back into Markdown source files.
- Patches are logged for auditability and undo support.

## 11. Storage and Versioning

- **Markdown is the source of truth** and lives in Git.
- **IR is derived and ephemeral** — generated at compile time, not committed to the repository.
- During live/whiteboard sessions, IR state is transient. A `glyph_commit` operation serializes it back to canonical Markdown.
- `.glyph/` directory (gitignored) stores compiled IR cache and session state locally.

## 12. Documentation Site and Demo Playground

### 12.1 Overview

Glyph JS ships a documentation site and interactive playground hosted on **GitHub Pages**. The site serves as the primary entry point for developers, providing guides, API references, live component demos, and a full Markdown-to-UI playground.

### 12.2 Technology

| Concern | Choice |
|---|---|
| Framework | **Astro Starlight** — static-first docs framework with MDX support and built-in search, sidebar, and navigation. |
| React embedding | Astro Islands — Glyph JS components render as interactive React islands inside static doc pages. |
| Playground editor | **CodeMirror 6** — lightweight, extensible, with custom syntax highlighting for `ui:` fenced blocks. |
| Hosting | **GitHub Pages** — deployed from a `gh-pages` branch via GitHub Actions on every push to `main`. |
| Package location | `apps/docs` in the monorepo. |

### 12.3 Site Structure

```
glyphjs.github.io/
├── /                        # Landing page — project overview, hero demo, install snippet
├── /getting-started/        # Installation, first document, quick tutorial
├── /authoring-guide/        # Markdown syntax, YAML payloads, fenced block reference
├── /components/             # Component reference (one page per component)
│   ├── /graph/              # ui:graph — variants, props, live examples
│   ├── /table/              # ui:table — sorting, filtering, aggregation
│   ├── /chart/              # ui:chart — line, bar, area, OHLC
│   ├── /relation/           # ui:relation — ER diagrams, cardinality
│   ├── /timeline/           # ui:timeline — event sequences
│   ├── /callout/            # ui:callout — info, warning, error
│   ├── /tabs/               # ui:tabs — tabbed containers
│   └── /steps/              # ui:steps — step-by-step guides
├── /ir-spec/                # IR JSON specification, versioning, patch format
├── /plugin-api/             # Plugin system, custom component registration, schema authoring
├── /theming/                # Theme customization, CSS variables, light/dark mode
├── /gallery/                # Real-world examples — architecture docs, ML pipelines, financial models
└── /playground/             # Interactive Markdown → UI playground
```

### 12.4 Live Component Examples

Every component reference page includes **live, editable examples** embedded directly in the docs:

- Each example shows a Glyph Markdown snippet in a CodeMirror editor.
- The output renders below (or beside) the editor as a live Glyph UI via an Astro React island.
- Users can edit the Markdown and see the rendered output update in real-time.
- Examples are sourced from `.md` fixture files in `apps/docs/examples/`, keeping content separate from page layout.

```
apps/docs/examples/
  ├── graph-dag.md
  ├── graph-mindmap.md
  ├── table-sortable.md
  ├── chart-ohlc.md
  ├── relation-er.md
  └── ...
```

### 12.5 Playground

The `/playground` page is a standalone, full-screen split-pane environment:

- **Left pane**: CodeMirror 6 editor with:
  - Syntax highlighting for standard Markdown.
  - Custom highlighting for `ui:` fenced blocks and YAML payloads.
  - Autocomplete suggestions for component types and common YAML keys.
  - Real-time validation diagnostics (red underlines for schema errors).
- **Right pane**: Live Glyph rendering — the full `@glyphjs/parser` → `@glyphjs/compiler` → `@glyphjs/runtime` pipeline runs in the browser on every keystroke (debounced).
- **Toolbar**: Theme toggle (light/dark), share via URL (Markdown encoded in URL hash), export IR JSON, and a preset dropdown with example documents.
- The playground imports the Glyph JS packages directly — it is a real consumer of the library, not a mock.

### 12.6 Gallery

The `/gallery` section showcases real-world usage patterns:

- **System architecture documentation** — microservices, data pipelines, cloud infrastructure.
- **LLM-assisted design reviews** — annotated architecture diagrams with callouts.
- **ML pipeline visualization** — DAGs with training/inference steps, metrics tables.
- **Financial models** — OHLC charts, aggregated tables, timeline events.
- **Interactive onboarding docs** — tabbed walkthroughs with step-by-step guides.

Each gallery entry is a full Glyph Markdown document rendered as an interactive page, with a "View Source" toggle to show the underlying Markdown.

### 12.7 Deployment

- **Build**: `pnpm --filter docs build` produces a static site in `apps/docs/dist/`.
- **CI/CD**: A GitHub Actions workflow builds the docs on every push to `main` and deploys to the `gh-pages` branch.
- **Preview**: PR preview deployments via GitHub Actions artifacts or a deploy preview service (optional).
- **Versioning**: The docs site tracks the latest release. Versioned docs (v1, v2) can be added later via Starlight's built-in versioning support.

```yaml
# .github/workflows/docs.yml (simplified)
name: Deploy Docs
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter docs build
      - uses: actions/deploy-pages@v4
        with:
          artifact_path: apps/docs/dist
```

## 13. Testing Strategy

Each package has a distinct testing approach matched to its nature. The goal is deterministic, fast tests at each layer boundary, with Playwright covering the visual/interactive surface.

### 12.1 Test Tooling

| Tool | Purpose |
|---|---|
| **Vitest** | Unit and integration tests across all packages. Fast, native ESM, Turborepo-compatible. |
| **fast-check** | Property-based testing for IR patch/diff operations. Generates random valid IRs to find edge cases. |
| **Playwright** | Visual regression and interaction testing for rendered components. Runs against Storybook. |
| **Storybook** | Component development harness. Each component has stories for every variant. Doubles as docs and Playwright target. |
| **React Testing Library** | Lightweight DOM assertions for runtime logic (registry, theming, layout) without a full browser. |

### 12.2 Per-Package Testing

#### `@glyphjs/schemas`

- **Unit tests (Vitest)**: Validate that each schema accepts valid payloads and rejects invalid ones.
- **Dual validation conformance**: Every test fixture is validated against both the Zod schema and the auto-generated JSON Schema. Both must produce identical accept/reject results. This catches drift between the two representations.

```typescript
// Example: dual validation test
import { graphSchema } from '@glyphjs/schemas';
import { zodToJsonSchema } from 'zod-to-json-schema';
import Ajv from 'ajv';

const ajv = new Ajv();
const jsonSchema = zodToJsonSchema(graphSchema);
const validate = ajv.compile(jsonSchema);

for (const fixture of validFixtures) {
  expect(graphSchema.safeParse(fixture).success).toBe(true);
  expect(validate(fixture)).toBe(true);
}

for (const fixture of invalidFixtures) {
  expect(graphSchema.safeParse(fixture).success).toBe(false);
  expect(validate(fixture)).toBe(false);
}
```

#### `@glyphjs/parser`

- **Golden file tests**: Markdown fixture files (`.md`) paired with expected AST output (`.ast.json`). Each fixture exercises a specific syntax feature (plain Markdown, `ui:graph`, `ui:table`, nested blocks, etc.).
- Test runner diffs actual AST output against the golden file. Failures show exactly what changed.
- Golden files are checked into the repository and reviewed in PRs like code.

```
packages/parser/test/fixtures/
  ├── basic-text.md
  ├── basic-text.ast.json
  ├── graph-dag.md
  ├── graph-dag.ast.json
  ├── mixed-content.md
  ├── mixed-content.ast.json
  └── ...
```

#### `@glyphjs/ir`

- **Unit tests (Vitest)**: Validation, serialization, and type utilities.
- **Property-based tests (fast-check)**: Generate random valid IR documents and patches, then assert invariants:
  - `apply(diff(a, b), a) === b` (diff+apply roundtrip)
  - `apply(patch, doc)` always produces a valid IR document
  - Patch composition is associative
  - Empty patch is identity

```typescript
import fc from 'fast-check';
import { arbitraryIR, arbitraryPatch, applyPatch, diffIR } from './test-utils';

test('diff/apply roundtrip', () => {
  fc.assert(fc.property(arbitraryIR(), arbitraryIR(), (a, b) => {
    const patch = diffIR(a, b);
    const result = applyPatch(a, patch);
    expect(result).toEqual(b);
  }));
});
```

#### `@glyphjs/compiler`

- **Golden file tests**: Markdown input (`.md`) paired with expected IR output (`.ir.json`). Tests the full parse+compile pipeline.
- Covers all 8 component types, edge cases (empty documents, invalid YAML, unknown block types), and reference resolution.
- Determinism test: compile the same input twice and assert identical output.

```
packages/compiler/test/fixtures/
  ├── full-document.md
  ├── full-document.ir.json
  ├── graph-all-layouts.md
  ├── graph-all-layouts.ir.json
  ├── error-invalid-yaml.md
  ├── error-invalid-yaml.diagnostics.json
  └── ...
```

#### `@glyphjs/runtime`

- **React Testing Library**: Test component registry, plugin registration, theming context, layout engine, and error boundaries without a browser.
- Asserts that the correct React component is resolved for each block type, that theme CSS variables propagate, and that unknown block types render gracefully.

#### `@glyphjs/components`

- **Storybook**: Every component has stories covering all variants and edge cases (empty data, large datasets, various layouts). Storybook serves as both development harness and documentation.
- **Playwright visual regression**: Screenshot tests run against Storybook stories. Captures pixel-level rendering of graphs, charts, tables, etc. Baseline images checked into the repo. Failures produce diff images for review.
- **Playwright interaction tests**: Test user interactions — click graph nodes, sort table columns, switch tabs, hover for tooltips, drag timelines. Asserts on DOM state after interaction.

```typescript
// Example: Playwright interaction test
test('table sorts by column on header click', async ({ page }) => {
  await page.goto('/storybook/iframe.html?id=table--default');
  await page.click('th:has-text("Name")');
  const firstCell = await page.textContent('tbody tr:first-child td:first-child');
  expect(firstCell).toBe('Alice'); // alphabetically first
});
```

### 12.3 End-to-End Pipeline Tests

Full integration tests that exercise the entire Markdown → UI pipeline:

1. Feed a Markdown string containing `ui:` blocks into `@glyphjs/parser`.
2. Compile the AST to IR via `@glyphjs/compiler`.
3. Render the IR in a browser using `@glyphjs/runtime` + `@glyphjs/components`.
4. Assert on the resulting DOM via Playwright — block structure, rendered SVG elements, interactive behavior.

These tests run in CI against a minimal Vite app that mounts the Glyph runtime. They validate that the contracts between all layers hold in practice, not just in isolation.

```
packages/e2e/
  ├── fixtures/
  │   ├── architecture-doc.md      # Full document with multiple component types
  │   ├── graph-interaction.md     # Graph with clickable nodes
  │   └── ...
  └── tests/
      ├── full-pipeline.spec.ts
      ├── graph-rendering.spec.ts
      └── ...
```

### 12.4 CI Integration

- **Vitest** (unit + golden file + property-based): Runs on every PR. Fast — targets < 30s.
- **Playwright** (visual + interaction + E2E): Runs on every PR. Storybook is built, then Playwright runs against the static build.
- **Visual regression baselines**: Stored in the repo. Updated via `npx playwright test --update-snapshots` and reviewed in PRs.
- **Turborepo caching**: Test tasks are cached per-package. Only re-run when source or fixtures change.

## 14. Build Tooling and Infrastructure

| Concern | Choice |
|---|---|
| Language | TypeScript (strict mode) |
| Package manager | pnpm (workspaces) |
| Build orchestration | Turborepo |
| Bundler | tsup (esbuild-based) |
| Unit / integration tests | Vitest |
| Property-based tests | fast-check |
| Visual / interaction tests | Playwright |
| Component harness | Storybook |
| Component unit tests | React Testing Library |
| Linting | ESLint + Prettier |
| Documentation | Astro Starlight |
| Playground editor | CodeMirror 6 |
| Docs hosting | GitHub Pages |
| CI | GitHub Actions |

## 15. Implementation Milestones

### Phase 1: Foundation (Alpha)

- Initialize monorepo with pnpm workspaces + Turborepo.
- Define IR type system and JSON schema (`@glyphjs/ir`).
- Define Zod schemas for all 8 components (`@glyphjs/schemas`).
- Implement remark plugin for `ui:` fenced block parsing (`@glyphjs/parser`).
- Implement AST-to-IR compiler (`@glyphjs/compiler`).
- Set up Vitest with golden file test infrastructure.
- Golden file tests for parser (Markdown → AST) and compiler (Markdown → IR) for all component types.
- Dual validation conformance tests for all schemas (Zod + JSON Schema).
- Property-based tests for IR patch/diff operations with fast-check.

### Phase 2: Rendering (Beta)

- Implement React rendering runtime (`@glyphjs/runtime`).
- Implement component registry and plugin system.
- Build all 8 components with D3 + Dagre (`@glyphjs/components`).
- Theming system (light/dark, CSS variables).
- Layout engine for block positioning and responsive behavior.
- Set up Storybook with stories for all component variants.
- React Testing Library tests for runtime logic (registry, theming, layout).
- Set up Playwright with visual regression against Storybook.
- Playwright interaction tests for all interactive components.
- Demo app: load a Markdown file and render it as interactive UI.

### Phase 3: Polish (v1.0)

- Animation orchestration for state transitions.
- Cross-block references and navigation.
- Error diagnostics with source-mapped Markdown locations.
- End-to-end pipeline tests (Markdown → browser DOM via Playwright).
- CI pipeline: Vitest + Playwright on every PR, Turborepo caching.
- **Docs site**: Astro Starlight setup, Getting Started, Authoring Guide, Component Reference (all 8 components with live examples).
- **Playground**: CodeMirror 6 editor with split-pane live rendering, URL sharing, preset examples.
- **Gallery**: Real-world example documents (architecture, ML pipelines, financial models).
- **Deployment**: GitHub Actions workflow deploying to GitHub Pages on every push to `main`.
- IR Spec and Plugin API reference pages.
- Theming documentation.
- npm publish pipeline for all packages.
- MCP tool interface specification finalized (no server implementation).

### Phase 4: Live Sessions (v2.0 — Future)

- MCP server implementation.
- Whiteboard mode with real-time IR patching.
- Bidirectional Markdown <-> IR normalization.
- Collaborative multi-user sessions.
- Export to PDF/Slides.
- Domain-specific component packs.

## 16. Open Questions

- **Streaming compilation**: Should the compiler support streaming Markdown input (for rendering as an LLM generates tokens)?
- **Markdown round-tripping**: How strict should IR-to-Markdown serialization be? Exact reproduction vs. semantic equivalence?
- **Component sandboxing**: Should third-party plugin components run in an iframe sandbox for security?
- **Accessibility**: What WCAG compliance level should the rendering runtime target?

---

*This RFC is based on the initial concept document (`markdown_ui_rfc.pdf`) and captures all architectural decisions for the Glyph JS v1 implementation.*
