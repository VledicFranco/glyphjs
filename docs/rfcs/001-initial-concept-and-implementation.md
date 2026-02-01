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
| `@glyphjs/types` | Shared TypeScript type definitions used across all packages. Defines the Glyph AST (extended MDAST), IR interfaces, diagnostic types, and plugin contracts. Zero-dependency, type-only package. |
| `@glyphjs/parser` | Markdown parser built on unified/remark. Extends remark with plugins for `ui:` fenced block syntax. Outputs a Glyph AST. |
| `@glyphjs/ir` | IR utilities: validation, diffing, patching, migration. Operates on types defined in `@glyphjs/types`. |
| `@glyphjs/compiler` | Compiles Glyph AST into IR. Resolves references, validates component schemas, produces deterministic output. Emits structured diagnostics on errors. |
| `@glyphjs/runtime` | React-based rendering runtime. Consumes IR and renders interactive UI. Provides layout, theming, animation orchestration, and plugin registration. |
| `@glyphjs/components` | Built-in component library (graph, table, chart, relation, timeline, callout, tabs, steps). Lazy-loaded per component type. |
| `@glyphjs/schemas` | Zod schemas for all built-in components with JSON Schema generation. Shared validation layer. |
| `apps/docs` | Astro Starlight documentation site with interactive playground. Deployed to GitHub Pages. |

### 4.2 Package Dependency Graph

```
@glyphjs/types          ← zero-dependency, type-only
    ↑
@glyphjs/schemas        ← depends on types + zod
    ↑
@glyphjs/parser         ← depends on types + unified/remark
    ↑
@glyphjs/compiler       ← depends on types, schemas, parser
    ↑
@glyphjs/ir             ← depends on types (validation, patching, migration)

@glyphjs/runtime        ← depends on types, schemas, react
    ↑
@glyphjs/components     ← depends on types, runtime, d3, dagre
```

### 4.3 Data Flow

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

The IR is a JSON document with the following top-level shape. All types are defined in `@glyphjs/types`.

```typescript
// ─── Document Root ───────────────────────────────────────────

interface GlyphIR {
  version: string;             // IR spec version (semver, e.g. "1.0.0")
  id: string;                  // Document ID (deterministic, see 6.2)
  metadata: DocumentMetadata;
  blocks: Block[];             // Ordered list of content blocks
  references: Reference[];     // Cross-block links
  layout: LayoutHints;         // Global layout configuration
}

// ─── Document Metadata ───────────────────────────────────────

interface DocumentMetadata {
  title?: string;              // Extracted from first h1 heading, or explicit
  description?: string;        // Extracted from first paragraph, or explicit
  authors?: string[];
  createdAt?: string;          // ISO 8601
  sourceFile?: string;         // Relative path to the source .md file
  tags?: string[];
}

// ─── Block ───────────────────────────────────────────────────

interface Block {
  id: string;                  // Deterministic block ID (see 6.2)
  type: BlockType;             // Discriminated union tag
  data: unknown;               // Type-specific payload (validated by schema)
  position: SourcePosition;    // Source Markdown location
  children?: Block[];          // Nested blocks (for tabs, steps, etc.)
  metadata?: Record<string, unknown>; // Extensible metadata (plugins, custom data)
}

// All block types — standard Markdown types + ui: component types
type BlockType =
  // Standard Markdown blocks
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'code'
  | 'blockquote'
  | 'thematic-break'
  | 'image'
  | 'html'
  // Glyph UI component blocks
  | 'ui:graph'
  | 'ui:table'
  | 'ui:chart'
  | 'ui:relation'
  | 'ui:timeline'
  | 'ui:callout'
  | 'ui:tabs'
  | 'ui:steps'
  // Extensible — plugins register additional types
  | `ui:${string}`;

// ─── Reference ───────────────────────────────────────────────

interface Reference {
  id: string;                  // Reference ID
  type: ReferenceType;         // Semantic relationship type
  sourceBlockId: string;       // Block originating the reference
  targetBlockId: string;       // Block being referenced
  sourceAnchor?: string;       // Sub-element within source (e.g. node ID, row key)
  targetAnchor?: string;       // Sub-element within target
  label?: string;              // Human-readable description
  bidirectional?: boolean;     // Whether navigation works both ways (default: false)
}

type ReferenceType =
  | 'navigates-to'             // Click source to scroll/focus target
  | 'details'                  // Source is a summary, target has details
  | 'depends-on'               // Dependency relationship (graphs, steps)
  | 'data-source'              // Target provides data rendered by source
  | `custom:${string}`;        // Plugin-defined reference types

// ─── Source Position ─────────────────────────────────────────

// Compatible with unist Position from the unified/remark ecosystem
interface SourcePosition {
  start: { line: number; column: number; offset?: number };
  end: { line: number; column: number; offset?: number };
}

// ─── Layout ──────────────────────────────────────────────────

interface LayoutHints {
  mode: 'document' | 'dashboard' | 'presentation';
  columns?: number;            // Grid columns (dashboard mode)
  maxWidth?: string;           // CSS max-width value (document mode)
  spacing?: 'compact' | 'normal' | 'relaxed';
}

// Layout semantics for graph/relation components
type LayoutSemantic = 'top-down' | 'left-right' | 'bottom-up' | 'radial' | 'force';
```

### 6.2 Block ID Generation

Block IDs must be **deterministic** — the same Markdown input always produces the same IDs. The generation strategy uses a content-addressing scheme:

```
block_id = hash(document_id + block_index + block_type + content_fingerprint)
```

- `document_id`: Derived from the source file path (or an explicit `id` frontmatter field).
- `block_index`: Zero-based position of the block in document order (depth-first).
- `block_type`: The `BlockType` string.
- `content_fingerprint`: A hash of the block's raw source content (before compilation).
- `hash`: Truncated SHA-256 (first 12 hex characters), producing IDs like `"b-a3f8c2e10b4d"`.

This ensures:
- **Determinism**: Same input → same IDs, always.
- **Stability under edits**: Inserting a block above changes that block's `block_index`, but the content fingerprint provides a secondary signal for diffing and patch rebasing.
- **Uniqueness**: Hash collisions within a single document are negligible at 12 hex characters.

### 6.3 Properties

- **Deterministic**: The same Markdown input always produces the same IR output. No randomness, no environment-dependent behavior.
- **Versioned**: IR documents carry a spec version. The runtime can detect and migrate older IR formats (see 6.4).
- **Forward-compatible**: Unknown block types are preserved (not dropped), enabling graceful degradation.
- **Patch-friendly**: The IR structure supports JSON Patch (RFC 6902) operations for incremental updates.

### 6.4 IR Version Migration

When the runtime encounters an IR document with an older version, it applies a migration pipeline:

```typescript
// @glyphjs/ir — migration registry
interface IRMigration {
  from: string;   // Source version (semver)
  to: string;     // Target version (semver)
  migrate: (ir: GlyphIR) => GlyphIR;
}

// Migrations are registered in order and composed into a pipeline
const migrations: IRMigration[] = [
  { from: '0.1.0', to: '0.2.0', migrate: migrateV01toV02 },
  { from: '0.2.0', to: '1.0.0', migrate: migrateV02toV10 },
];

// Runtime applies all migrations sequentially
function migrateIR(ir: GlyphIR, targetVersion: string): GlyphIR {
  let current = ir;
  for (const migration of findMigrationPath(ir.version, targetVersion)) {
    current = migration.migrate(current);
  }
  return { ...current, version: targetVersion };
}
```

- Migrations are pure functions: input IR → output IR.
- The migration registry lives in `@glyphjs/ir`.
- Unknown future versions produce a clear error (no silent downgrades).

## 7. Rendering Runtime

### 7.1 Technology

- **React-only** for v1. Other framework adapters (Vue, Svelte, Web Components) are out of scope.
- **D3.js** for graph rendering, animations, and low-level SVG/Canvas control.
- **Dagre** for DAG and hierarchical graph layout.
- Standard charts (line, bar, area, OHLC) rendered via D3.js directly.

### 7.2 Standard Markdown Rendering

Standard Markdown blocks (`heading`, `paragraph`, `list`, `code`, `blockquote`, `image`, `thematic-break`, `html`) are rendered by a set of built-in base renderers in `@glyphjs/runtime`. These are **not** plugins — they ship with the runtime and cannot be unregistered.

```typescript
// Built-in renderers — always available, no registration needed
const baseRenderers: Record<string, React.FC<BlockProps>> = {
  'heading':        GlyphHeading,       // <h1>–<h6> with anchor links
  'paragraph':      GlyphParagraph,     // <p> with inline formatting (bold, italic, code, links)
  'list':           GlyphList,          // <ul>/<ol> with nested list support
  'code':           GlyphCodeBlock,     // Syntax-highlighted code block (shiki or prism)
  'blockquote':     GlyphBlockquote,    // Styled <blockquote>
  'image':          GlyphImage,         // <img> with optional caption and lazy loading
  'thematic-break': GlyphThematicBreak, // <hr>
  'html':           GlyphRawHtml,       // Sanitized raw HTML passthrough
};
```

Inline formatting (bold, italic, strikethrough, inline code, links) is preserved in the block's `data` field as a tree of inline nodes, following the MDAST `PhrasingContent` model. The runtime renders these recursively within each block.

Base renderers respect the theming system (CSS variables) and can be **overridden** (but not removed) via the runtime configuration:

```typescript
const runtime = createGlyphRuntime({
  components: [graphComponent, tableComponent],
  overrides: {
    'heading': CustomHeading,  // Replace the default heading renderer
  },
});
```

### 7.3 Component Registry

The runtime exposes a component registry where built-in and custom components are registered:

```typescript
import { createGlyphRuntime } from '@glyphjs/runtime';
import { graphComponent, tableComponent } from '@glyphjs/components';

const runtime = createGlyphRuntime({
  components: [graphComponent, tableComponent, /* ... */],
  theme: 'light',
});
```

### 7.4 Theming and Layout

- CSS-variable-based theming system.
- Layout engine handles block positioning, spacing, and responsive behavior.
- Animation orchestration for transitions between states (e.g., when a graph is patched).

#### Theme Variable Namespace

All Glyph CSS variables are prefixed with `--glyph-` to avoid collisions:

```css
:root {
  /* Surface */
  --glyph-bg-primary: #ffffff;
  --glyph-bg-secondary: #f8f9fa;
  --glyph-bg-surface: #ffffff;

  /* Text */
  --glyph-text-primary: #1a1a2e;
  --glyph-text-secondary: #6b7280;
  --glyph-text-muted: #9ca3af;

  /* Accent */
  --glyph-accent: #3b82f6;
  --glyph-accent-hover: #2563eb;

  /* Borders & Spacing */
  --glyph-border-color: #e5e7eb;
  --glyph-radius: 8px;
  --glyph-spacing-unit: 4px;

  /* Component-specific (examples) */
  --glyph-graph-node-fill: #e0e7ff;
  --glyph-graph-edge-stroke: #94a3b8;
  --glyph-callout-info-bg: #eff6ff;
  --glyph-callout-warning-bg: #fffbeb;
  --glyph-callout-error-bg: #fef2f2;
}
```

Themes are applied by setting these variables on the Glyph root container. Light/dark themes are built-in. Custom themes override specific variables.

Components access the theme via a React context hook:

```typescript
const { theme, resolveVar } = useGlyphTheme();
```

### 7.5 Plugin System

Third-party components can be registered as plugins. The plugin contract defines the full interface a component must implement:

```typescript
// ─── Plugin Component Contract ───────────────────────────────

interface GlyphComponentDefinition<T = unknown> {
  /** Unique block type identifier (must start with "ui:") */
  type: `ui:${string}`;

  /** Zod schema for validating the YAML payload */
  schema: ZodType<T>;

  /** React component that renders the block */
  render: React.ComponentType<GlyphComponentProps<T>>;

  /** Optional: component-specific CSS variable overrides */
  themeDefaults?: Record<string, string>;

  /** Optional: declare dependencies on other component types */
  dependencies?: string[];
}

// ─── Props passed to every plugin component ──────────────────

interface GlyphComponentProps<T = unknown> {
  /** Validated, typed payload from the YAML block */
  data: T;

  /** Block metadata (id, position, etc.) */
  block: Block;

  /** References where this block is the source */
  outgoingRefs: Reference[];

  /** References where this block is the target */
  incomingRefs: Reference[];

  /** Navigate to another block by reference */
  onNavigate: (ref: Reference) => void;

  /** Theme context */
  theme: GlyphThemeContext;

  /** Layout hints for this block's container */
  layout: LayoutHints;
}
```

Registration:

```typescript
runtime.registerComponent({
  type: 'ui:custom-widget',
  schema: customWidgetSchema,
  render: CustomWidgetComponent,
  themeDefaults: {
    '--glyph-custom-widget-bg': '#f0f0f0',
  },
});
```

Unknown block types (not registered in the component registry and not a standard Markdown type) render a fallback placeholder showing the block type and raw data, rather than crashing. This enables forward compatibility when documents contain components from plugins that aren't installed.

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

## 10. Error Model and Diagnostics

### 10.1 Diagnostic Type

All errors, warnings, and informational messages across the pipeline use a unified `Diagnostic` type defined in `@glyphjs/types`:

```typescript
interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  code: string;                // Machine-readable code (e.g. "YAML_PARSE_ERROR", "SCHEMA_VALIDATION")
  message: string;             // Human-readable description
  position?: SourcePosition;   // Location in source Markdown (when available)
  source: DiagnosticSource;    // Which pipeline stage produced this
  details?: unknown;           // Structured details (e.g. Zod error paths, YAML parse context)
}

type DiagnosticSource = 'parser' | 'compiler' | 'schema' | 'runtime' | 'plugin';
```

### 10.2 Error Recovery Strategy

The compiler uses a **collect-all-errors** strategy rather than fail-fast:

1. **Parser errors** (malformed Markdown, unclosed fenced blocks): The parser recovers and continues, marking broken sections as `error` blocks in the AST. All parse errors are collected.
2. **YAML parse errors** (invalid YAML inside a `ui:` block): The block is preserved with its raw source text and an error diagnostic. Other blocks compile normally.
3. **Schema validation errors** (YAML is valid but doesn't match the component schema): The block is preserved with an `invalidData` flag. The runtime renders a validation error overlay on that block. Zod error paths are included in the diagnostic `details`.
4. **Reference resolution errors** (reference to non-existent block ID): A warning diagnostic is emitted. The reference is preserved in the IR but marked as `unresolved`.
5. **Unknown block types** (a `ui:xyz` type with no registered schema): An info diagnostic is emitted. The block is preserved as-is for forward compatibility.

```typescript
interface CompilationResult {
  ir: GlyphIR;                 // IR is always produced (even with errors)
  diagnostics: Diagnostic[];   // All collected diagnostics
  hasErrors: boolean;          // Shorthand: any diagnostic with severity === 'error'
}
```

### 10.3 Runtime Error Boundaries

The rendering runtime wraps each block in a React Error Boundary. If a component throws during render:

- The error is caught and a fallback UI is displayed for that block (showing the error message and block type).
- Other blocks continue rendering normally.
- The error is surfaced via a `onDiagnostic` callback on the runtime instance.

```typescript
const runtime = createGlyphRuntime({
  components: [...],
  onDiagnostic: (diagnostic: Diagnostic) => {
    console.warn(`[glyph] ${diagnostic.severity}: ${diagnostic.message}`);
  },
});
```

## 11. MCP Integration (Spec Only — v1)

### 11.1 Overview

The MCP (Model Context Protocol) integration defines how LLMs interact with Glyph JS documents programmatically during live sessions. **v1 specifies the interface; implementation is deferred to v2.**

### 11.2 Proposed MCP Tools

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

### 11.3 Session Model

- LLMs operate on IR documents via patches.
- Each session maintains an IR document state.
- Sessions can be committed back into Markdown source files.
- Patches are logged for auditability and undo support.

## 12. Storage and Versioning

- **Markdown is the source of truth** and lives in Git.
- **IR is derived and ephemeral** — generated at compile time, not committed to the repository.
- During live/whiteboard sessions, IR state is transient. A `glyph_commit` operation serializes it back to canonical Markdown.
- `.glyph/` directory (gitignored) stores compiled IR cache and session state locally.

## 13. Documentation Site and Demo Playground

### 13.1 Overview

Glyph JS ships a documentation site and interactive playground hosted on **GitHub Pages**. The site serves as the primary entry point for developers, providing guides, API references, live component demos, and a full Markdown-to-UI playground.

### 13.2 Technology

| Concern | Choice |
|---|---|
| Framework | **Astro Starlight** — static-first docs framework with MDX support and built-in search, sidebar, and navigation. |
| React embedding | Astro Islands — Glyph JS components render as interactive React islands inside static doc pages. |
| Playground editor | **CodeMirror 6** — lightweight, extensible, with custom syntax highlighting for `ui:` fenced blocks. |
| Hosting | **GitHub Pages** — deployed from a `gh-pages` branch via GitHub Actions on every push to `main`. |
| Package location | `apps/docs` in the monorepo. |

### 13.3 Site Structure

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

### 13.4 Live Component Examples

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

### 13.5 Playground

The `/playground` page is a standalone, full-screen split-pane environment:

- **Left pane**: CodeMirror 6 editor with:
  - Syntax highlighting for standard Markdown.
  - Custom highlighting for `ui:` fenced blocks and YAML payloads.
  - Autocomplete suggestions for component types and common YAML keys.
  - Real-time validation diagnostics (red underlines for schema errors).
- **Right pane**: Live Glyph rendering — the full `@glyphjs/parser` → `@glyphjs/compiler` → `@glyphjs/runtime` pipeline runs in the browser on every keystroke (debounced).
- **Toolbar**: Theme toggle (light/dark), share via URL (Markdown encoded in URL hash), export IR JSON, and a preset dropdown with example documents.
- The playground imports the Glyph JS packages directly — it is a real consumer of the library, not a mock.

### 13.6 Gallery

The `/gallery` section showcases real-world usage patterns:

- **System architecture documentation** — microservices, data pipelines, cloud infrastructure.
- **LLM-assisted design reviews** — annotated architecture diagrams with callouts.
- **ML pipeline visualization** — DAGs with training/inference steps, metrics tables.
- **Financial models** — OHLC charts, aggregated tables, timeline events.
- **Interactive onboarding docs** — tabbed walkthroughs with step-by-step guides.

Each gallery entry is a full Glyph Markdown document rendered as an interactive page, with a "View Source" toggle to show the underlying Markdown.

### 13.7 Deployment

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

## 14. Testing Strategy

Each package has a distinct testing approach matched to its nature. The goal is deterministic, fast tests at each layer boundary, with Playwright covering the visual/interactive surface.

### 14.1 Test Tooling

| Tool | Purpose |
|---|---|
| **Vitest** | Unit and integration tests across all packages. Fast, native ESM, Turborepo-compatible. |
| **fast-check** | Property-based testing for IR patch/diff operations. Generates random valid IRs to find edge cases. |
| **Playwright** | Visual regression and interaction testing for rendered components. Runs against Storybook. |
| **Storybook** | Component development harness. Each component has stories for every variant. Doubles as docs and Playwright target. |
| **React Testing Library** | Lightweight DOM assertions for runtime logic (registry, theming, layout) without a full browser. |

### 14.2 Per-Package Testing

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

### 14.3 End-to-End Pipeline Tests

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

### 14.4 CI Integration

- **Vitest** (unit + golden file + property-based): Runs on every PR. Fast — targets < 30s.
- **Playwright** (visual + interaction + E2E): Runs on every PR. Storybook is built, then Playwright runs against the static build.
- **Visual regression baselines**: Stored in the repo. Updated via `npx playwright test --update-snapshots` and reviewed in PRs.
- **Turborepo caching**: Test tasks are cached per-package. Only re-run when source or fixtures change.

## 15. Build Tooling and Infrastructure

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

### 15.1 Target Environments

Each package has explicit environment targets:

| Package | Node.js | Browser | SSR |
|---|---|---|---|
| `@glyphjs/types` | Yes | Yes | N/A (type-only) |
| `@glyphjs/schemas` | Yes | Yes | N/A (validation) |
| `@glyphjs/parser` | Yes | Yes | N/A (pure transform) |
| `@glyphjs/compiler` | Yes | Yes | N/A (pure transform) |
| `@glyphjs/ir` | Yes | Yes | N/A (pure transform) |
| `@glyphjs/runtime` | No | Yes | Yes (React SSR) |
| `@glyphjs/components` | No | Yes | Partial (SSR renders placeholder, hydrates with D3) |

- `parser`, `compiler`, `ir`, and `schemas` are **universal** — they run in Node.js and browsers with no DOM dependency. This enables server-side compilation, CLI tools, and build-time pre-rendering.
- `runtime` and `components` require a DOM (React). They support React SSR: the runtime renders structural HTML server-side, and D3-based components hydrate on the client.
- All packages target **ES2022** and ship as **ESM** with CJS fallback via tsup dual-format builds.

### 15.2 Bundle Size and Lazy Loading

D3.js (~250KB minified) and Dagre (~80KB) are heavy. If a document only uses `ui:callout` and `ui:table`, users should not pay for graph rendering code.

**Strategy: per-component dynamic imports.**

Each component in `@glyphjs/components` is a separate entry point with its own dynamic import:

```typescript
// @glyphjs/components — each component is lazy-loaded
export const graphComponent: GlyphComponentDefinition = {
  type: 'ui:graph',
  schema: graphSchema,
  render: lazy(() => import('./graph/GraphRenderer')),  // D3 + Dagre loaded here
};

export const calloutComponent: GlyphComponentDefinition = {
  type: 'ui:callout',
  schema: calloutSchema,
  render: lazy(() => import('./callout/CalloutRenderer')), // No heavy deps
};
```

The runtime uses `React.lazy` + `Suspense` to load component code on demand. The import boundary ensures tree-shaking works — unused component subpaths are never bundled.

**Bundle budget targets** (gzipped):

| Package | Budget |
|---|---|
| `@glyphjs/parser` + `@glyphjs/compiler` | < 25KB |
| `@glyphjs/runtime` (core, no components) | < 15KB |
| `@glyphjs/components` — callout, tabs, steps | < 5KB each |
| `@glyphjs/components` — table | < 20KB |
| `@glyphjs/components` — graph, relation | < 80KB each (D3 + Dagre) |
| `@glyphjs/components` — chart | < 60KB (D3) |
| `@glyphjs/components` — timeline | < 40KB (D3) |

## 16. Implementation Milestones

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

## 17. Accessibility

Accessibility is a first-class design concern, not an afterthought. The rendering runtime and all built-in components must meet **WCAG 2.1 Level AA** compliance.

### 17.1 Component Requirements

Every component (built-in and plugin) must satisfy:

| Requirement | Description |
|---|---|
| **Semantic HTML** | Use appropriate HTML elements (`<table>`, `<nav>`, `<figure>`, `<h1>`–`<h6>`) instead of generic `<div>`s. |
| **ARIA attributes** | Provide `role`, `aria-label`, `aria-describedby`, and `aria-live` where needed. Interactive components must have `aria-expanded`, `aria-selected`, etc. |
| **Keyboard navigation** | All interactive elements must be focusable and operable via keyboard. Graphs must support arrow-key node traversal. Tables must support cell navigation. |
| **Color contrast** | All text must meet 4.5:1 contrast ratio (AA). The theming system validates contrast at build time. |
| **Screen reader support** | Graphs and charts must provide text alternatives — either via `aria-label` summaries or a visually hidden data table fallback. |
| **Focus management** | When navigating between blocks via references, focus moves to the target block with an `aria-live` announcement. |
| **Reduced motion** | Animations respect `prefers-reduced-motion`. When enabled, transitions are instant and D3 animations are disabled. |

### 17.2 Plugin Contract

The `GlyphComponentDefinition` (Section 7.5) does not enforce accessibility programmatically in v1, but the documentation and Storybook stories must demonstrate accessible patterns. Future versions may introduce an accessibility audit step in the plugin registration.

### 17.3 Testing

- Storybook accessibility addon (`@storybook/addon-a11y`) runs axe-core checks on every story.
- Playwright E2E tests include keyboard navigation assertions.
- CI runs axe-core against the Storybook static build.

## 18. Open Questions

- **Streaming compilation**: Should the compiler support streaming Markdown input (for rendering as an LLM generates tokens)?
- **Markdown round-tripping**: How strict should IR-to-Markdown serialization be? Exact reproduction vs. semantic equivalence?
- **Component sandboxing**: Should third-party plugin components run in an iframe sandbox for security?

---

*This RFC is based on the initial concept document (`markdown_ui_rfc.pdf`) and captures all architectural decisions for the Glyph JS v1 implementation.*
