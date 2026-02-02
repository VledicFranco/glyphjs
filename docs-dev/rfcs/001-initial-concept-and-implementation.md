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

An incremental IR update expressed as a sequence of block-level operations (add, update, remove, move). Patches are the foundation for live/whiteboard sessions where an LLM iteratively builds a visualization.

## 4. Architecture

### 4.1 Package Structure

Glyph JS is organized as a multi-package monorepo with independently versioned and publishable packages:

| Package               | Description                                                                                                                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@glyphjs/types`      | Shared TypeScript type definitions used across all packages. Defines the Glyph AST (extended MDAST), IR interfaces, diagnostic types, patch format, and plugin contracts. Zero-dependency, type-only package.               |
| `@glyphjs/schemas`    | Zod schemas for all built-in components with JSON Schema generation. Shared validation layer. Depends on `types` + `zod`.                                                                                                   |
| `@glyphjs/parser`     | Markdown parser built on unified/remark. Extends remark with plugins for `ui:` fenced block syntax. Outputs a Glyph AST. Depends on `types` + `unified/remark`. Does **not** validate schemas — that is the compiler's job. |
| `@glyphjs/ir`         | IR utilities: validation, diffing, patching, migration, block ID generation. Depends on `types`.                                                                                                                            |
| `@glyphjs/compiler`   | Compiles Glyph AST into IR. Resolves references, validates component schemas, produces deterministic output. Emits structured diagnostics on errors. Depends on `types`, `schemas`, `parser`, `ir`.                         |
| `@glyphjs/runtime`    | React-based rendering runtime. Consumes IR and renders interactive UI. Provides layout, theming, animation orchestration, and plugin registration. Depends on `types`, `schemas`, `react`.                                  |
| `@glyphjs/components` | Built-in component library (graph, table, chart, relation, timeline, callout, tabs, steps). Lazy-loaded per component type. Depends on `types`, `schemas`, `runtime`, `d3`, `dagre`.                                        |
| `apps/docs`           | Astro Starlight documentation site with interactive playground. Deployed to GitHub Pages.                                                                                                                                   |

### 4.2 Package Dependency Graph

```
@glyphjs/types               ← zero-dependency, type-only (leaf)
  ├── @glyphjs/schemas        ← types + zod
  ├── @glyphjs/parser         ← types + unified/remark (no schema dep)
  ├── @glyphjs/ir             ← types only
  └── @glyphjs/compiler       ← types + schemas + parser + ir
        (combines all above)

@glyphjs/runtime              ← types + schemas + react
  └── @glyphjs/components     ← types + schemas + runtime + d3 + dagre
```

Note: `@glyphjs/parser` does **not** depend on `@glyphjs/schemas`. The parser handles syntax only (Markdown → AST). Schema validation of YAML payloads happens in `@glyphjs/compiler`.

### 4.3 Data Flow

```
Markdown (annotated)
       |
       v
  @glyphjs/parser        — remark + custom plugins
       |
       v
   Glyph AST             — extended MDAST (see Section 5.6)
       |
       v
  @glyphjs/compiler      — AST → IR compilation (uses schemas + ir)
       |
       v
   IR (JSON)              — deterministic, versioned (see Section 6)
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
- Each payload is validated against its component's **Zod schema** at compile time (by `@glyphjs/compiler`, not the parser).
- Validation errors produce clear diagnostics with line/column references back to the source Markdown.

### 5.3 Design Principles

- **LLM-friendly**: YAML in fenced blocks is a format LLMs generate reliably. No custom syntax beyond standard Markdown + fenced blocks.
- **Diffable**: Markdown with YAML blocks produces clean Git diffs.
- **Repository-native**: Source files are plain `.md` files that render meaningfully even in GitHub/GitLab Markdown viewers (as code blocks).

### 5.4 Reference Syntax

References between blocks are declared in two ways:

**1. Inside `ui:` block YAML via a `refs` field:**

````markdown
```ui:table
columns: [Name, Role, Team]
rows:
  - [Alice, Engineer, Platform]
  - [Bob, Designer, Product]
refs:
  - target: architecture-graph
    type: data-source
    label: "See architecture diagram"
```
````

The `refs` array is a reserved top-level YAML key processed by the compiler. It is stripped from the component `data` before schema validation. `target` is a user-assigned block ID (see below).

**2. Explicit block IDs via a `glyph-id` YAML key:**

````markdown
```ui:graph
glyph-id: architecture-graph
type: dag
nodes: [...]
```
````

When `glyph-id` is present, it overrides the auto-generated block ID, enabling stable references between blocks. The compiler validates uniqueness.

**3. Standard Markdown link references (future):**

The syntax `[text](#glyph:block-id)` is reserved for inline cross-block navigation in standard Markdown paragraphs. The compiler resolves these into `Reference` objects.

### 5.5 Container Block Nesting (Tabs and Steps)

`ui:tabs` and `ui:steps` are container components that contain child blocks. Since Markdown fenced blocks cannot nest, children are expressed using **section delimiters** within the YAML payload. Each child's content is Markdown that the compiler re-parses:

````markdown
```ui:tabs
tabs:
  - label: Overview
    content: |
      This is the **overview** tab with standard Markdown.

      It can contain multiple paragraphs and inline formatting.
  - label: Details
    content: |
      Detailed technical information goes here.

      - Bullet point one
      - Bullet point two
```
````

For `ui:steps`:

````markdown
```ui:steps
steps:
  - title: Install dependencies
    status: completed
    content: |
      Run `pnpm install` to install all packages.
  - title: Configure the project
    status: active
    content: |
      Edit `glyph.config.ts` to set up your theme.
  - title: Build and deploy
    status: pending
    content: |
      Run `pnpm build` and deploy to your hosting provider.
```
````

The `content` fields contain Markdown strings. The compiler parses each `content` field recursively, producing child `Block[]` entries in the IR. This allows tabs and steps to contain rich Markdown (paragraphs, lists, code blocks) but not nested `ui:` components in v1. Nested `ui:` components inside containers are deferred to v2.

### 5.6 Glyph AST (Extended MDAST)

The parser outputs a **Glyph AST** — an extension of the standard MDAST (Markdown Abstract Syntax Tree) from the unified/remark ecosystem. All standard MDAST node types pass through unchanged. The extension adds one new node type:

```typescript
// Defined in @glyphjs/types

/** Standard MDAST root with Glyph extensions */
interface GlyphRoot extends MdastRoot {
  children: (MdastContent | GlyphUIBlock)[];
}

/** A ui: fenced block parsed from Markdown */
interface GlyphUIBlock {
  type: 'glyphUIBlock';
  componentType: string; // e.g. "graph", "table" (without "ui:" prefix)
  rawYaml: string; // Original YAML source text
  parsedData: Record<string, unknown> | null; // Parsed YAML (null if YAML parsing failed)
  yamlError?: string; // YAML parse error message (if any)
  glyphId?: string; // User-assigned ID (from glyph-id field)
  refs?: RawRef[]; // Raw ref declarations (from refs field)
  position: UnistPosition; // Source location (unist-compatible)
}

interface RawRef {
  target: string; // Target block glyph-id
  type?: string; // Reference type
  label?: string; // Human-readable label
  sourceAnchor?: string;
  targetAnchor?: string;
  bidirectional?: boolean;
}
```

The AST is the **contract between `@glyphjs/parser` and `@glyphjs/compiler`**. The parser produces it; the compiler consumes it. Neither package depends on the other — they share only the types from `@glyphjs/types`.

### 5.7 Frontmatter

Glyph Markdown files support YAML frontmatter for document-level configuration:

```markdown
---
glyph-id: my-document
title: System Architecture
layout:
  mode: document
  spacing: relaxed
---

# System Architecture

...
```

The compiler extracts frontmatter into `DocumentMetadata` and `LayoutHints`. If no frontmatter is present, metadata is inferred from document content (title from first `h1`, etc.).

## 6. Intermediate Representation (IR)

### 6.1 Structure

The IR is a JSON document. All types are defined in `@glyphjs/types`.

```typescript
// ─── Document Root ───────────────────────────────────────────

interface GlyphIR {
  version: string; // IR spec version (semver, e.g. "1.0.0")
  id: string; // Document ID (see 6.2)
  metadata: DocumentMetadata;
  blocks: Block[]; // Ordered list of content blocks
  references: Reference[]; // Cross-block links
  layout: LayoutHints; // Global layout configuration
}

// ─── Document Metadata ───────────────────────────────────────

interface DocumentMetadata {
  title?: string; // From frontmatter, or first h1 heading
  description?: string; // From frontmatter, or first paragraph
  authors?: string[];
  createdAt?: string; // ISO 8601
  sourceFile?: string; // Relative path to source .md file (if applicable)
  tags?: string[];
}

// ─── Block ───────────────────────────────────────────────────

interface Block {
  id: string; // Deterministic or user-assigned block ID (see 6.2)
  type: BlockType; // Discriminated union tag
  data: BlockData; // Type-specific payload (see 6.3)
  position: SourcePosition; // Source Markdown location
  children?: Block[]; // Nested blocks (for tabs, steps)
  diagnostics?: Diagnostic[]; // Errors/warnings specific to this block
  metadata?: Record<string, unknown>; // Extensible metadata
}

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
  // Extensible
  | `ui:${string}`;

// ─── Reference ───────────────────────────────────────────────

interface Reference {
  id: string; // Auto-generated reference ID
  type: ReferenceType;
  sourceBlockId: string;
  targetBlockId: string;
  sourceAnchor?: string; // Sub-element within source (e.g. node ID, row key)
  targetAnchor?: string;
  label?: string;
  bidirectional?: boolean; // Default: false
  unresolved?: boolean; // True if targetBlockId was not found during compilation
}

type ReferenceType = 'navigates-to' | 'details' | 'depends-on' | 'data-source' | `custom:${string}`;

// ─── Source Position ─────────────────────────────────────────

// Compatible with unist Position
interface SourcePosition {
  start: { line: number; column: number; offset?: number };
  end: { line: number; column: number; offset?: number };
}

// ─── Layout ──────────────────────────────────────────────────

interface LayoutHints {
  mode: 'document' | 'dashboard' | 'presentation';
  columns?: number;
  maxWidth?: string;
  spacing?: 'compact' | 'normal' | 'relaxed';
  blockLayout?: Record<string, BlockLayoutOverride>; // Per-block layout by block ID
}

interface BlockLayoutOverride {
  gridColumn?: string; // CSS grid-column value
  gridRow?: string; // CSS grid-row value
  span?: number; // Column span in dashboard mode
}

type LayoutSemantic = 'top-down' | 'left-right' | 'bottom-up' | 'radial' | 'force';
```

### 6.2 Block ID and Document ID Generation

**Document ID** is derived deterministically:

1. If the frontmatter contains `glyph-id: <value>`, that value is the document ID.
2. If the compiler is given a file path, the document ID is the **relative file path** normalized to forward slashes (e.g., `docs/architecture.md`).
3. If neither is available (e.g., string input in the playground), the document ID is a SHA-256 hash of the full Markdown content (first 16 hex characters), prefixed with `doc-`.

**Block IDs** are determined as follows:

1. If the block has a user-assigned `glyph-id` (Section 5.4), that is used directly. The compiler validates uniqueness within the document.
2. Otherwise, block IDs are **content-addressed**:

```
block_id = "b-" + truncatedSHA256(document_id + block_type + content_fingerprint)
```

- `content_fingerprint`: SHA-256 of the block's raw source content.
- The hash is truncated to 12 hex characters, producing IDs like `"b-a3f8c2e10b4d"`.
- `block_index` is intentionally **not** included — this ensures IDs are stable when blocks are inserted or reordered above, which is critical for patch and reference stability.

**Collision handling:** If two blocks in the same document produce the same content-addressed ID (identical type + content), a numeric suffix is appended: `b-a3f8c2e10b4d-1`, `b-a3f8c2e10b4d-2`.

### 6.3 Standard Block Data Shapes

Each standard Markdown block type has a defined `data` shape. These types are defined in `@glyphjs/types`:

```typescript
// ─── Standard Markdown Block Data ────────────────────────────

interface HeadingData {
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[]; // Inline content (text, bold, italic, code, links)
}

interface ParagraphData {
  children: InlineNode[];
}

interface ListData {
  ordered: boolean;
  start?: number; // Start number for ordered lists
  items: ListItemData[];
}

interface ListItemData {
  children: InlineNode[];
  subList?: ListData; // Nested list
}

interface CodeData {
  language?: string;
  value: string; // Raw code text
  meta?: string; // Code fence meta string
}

interface BlockquoteData {
  children: InlineNode[];
}

interface ImageData {
  src: string;
  alt?: string;
  title?: string;
}

interface ThematicBreakData {} // No data — just a horizontal rule

interface HtmlData {
  value: string; // Raw HTML string (sanitized at render time)
}

// ─── Inline Nodes (PhrasingContent) ──────────────────────────

type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'emphasis'; children: InlineNode[] }
  | { type: 'delete'; children: InlineNode[] } // Strikethrough
  | { type: 'inlineCode'; value: string }
  | { type: 'link'; url: string; title?: string; children: InlineNode[] }
  | { type: 'image'; src: string; alt?: string; title?: string }
  | { type: 'break' }; // Hard line break

// ─── Type-safe BlockData union ───────────────────────────────

type BlockData =
  | HeadingData
  | ParagraphData
  | ListData
  | CodeData
  | BlockquoteData
  | ImageData
  | ThematicBreakData
  | HtmlData
  | Record<string, unknown>; // ui: component data (validated by Zod schema)
```

For `ui:` component blocks, the `data` field contains the parsed YAML payload after the `glyph-id` and `refs` keys have been stripped. The shape is validated by the component's Zod schema.

### 6.4 Properties

- **Deterministic**: The same Markdown input always produces the same IR output.
- **Versioned**: IR documents carry a spec version. The runtime can detect and migrate older IR formats (see 6.6).
- **Forward-compatible**: Unknown block types are preserved (not dropped).
- **Patch-friendly**: The IR supports a block-level patch format (see 6.5).

**Empty document handling:** An empty Markdown file (or whitespace only) produces a valid `GlyphIR` with `blocks: []`, `references: []`, `metadata: {}`, and default `LayoutHints` (`{ mode: 'document', spacing: 'normal' }`).

### 6.5 Patch Format

Patches are **block-level operations**, not raw JSON Patch (RFC 6902). This higher-level abstraction maps directly to how LLMs and MCP tools think about document modifications.

```typescript
// Defined in @glyphjs/types

type GlyphPatch = GlyphPatchOperation[];

type GlyphPatchOperation =
  | { op: 'addBlock'; block: Block; afterBlockId?: string }
  | { op: 'removeBlock'; blockId: string }
  | { op: 'updateBlock'; blockId: string; data: Partial<Block> }
  | { op: 'moveBlock'; blockId: string; afterBlockId?: string }
  | { op: 'addReference'; reference: Reference }
  | { op: 'removeReference'; referenceId: string }
  | { op: 'updateMetadata'; metadata: Partial<DocumentMetadata> }
  | { op: 'updateLayout'; layout: Partial<LayoutHints> };
```

`@glyphjs/ir` provides:

```typescript
function diffIR(before: GlyphIR, after: GlyphIR): GlyphPatch;
function applyPatch(ir: GlyphIR, patch: GlyphPatch): GlyphIR;
function composePatch(a: GlyphPatch, b: GlyphPatch): GlyphPatch;
```

Invariants:

- `applyPatch(a, diffIR(a, b))` deep-equals `b`.
- `applyPatch(ir, [])` returns `ir` unchanged (identity).
- `composePatch` is associative: `compose(compose(a, b), c)` equals `compose(a, compose(b, c))`.

### 6.6 IR Version Migration

When the runtime encounters an IR document with an older version, it applies a migration pipeline:

```typescript
interface IRMigration {
  from: string;
  to: string;
  migrate: (ir: GlyphIR) => GlyphIR;
}

function migrateIR(ir: GlyphIR, targetVersion: string): GlyphIR;
```

Migrations are pure functions registered in `@glyphjs/ir`. Unknown future versions produce a clear error.

## 7. Rendering Runtime

### 7.1 Technology

- **React-only** for v1. Other framework adapters are out of scope.
- **D3.js** for graph rendering, animations, and low-level SVG/Canvas control.
- **Dagre** for DAG and hierarchical graph layout.
- **DOMPurify** for sanitizing raw HTML blocks at render time (prevents XSS).

### 7.2 Runtime Public API

The runtime's public surface is a React component and a configuration factory:

```typescript
// ─── Configuration ───────────────────────────────────────────

interface GlyphRuntimeConfig {
  /** UI components to register (from @glyphjs/components or plugins) */
  components?: GlyphComponentDefinition[];

  /** Override built-in base renderers for standard Markdown blocks */
  overrides?: Partial<Record<string, React.ComponentType<BlockProps>>>;

  /** Theme: 'light', 'dark', or a custom theme object */
  theme?: 'light' | 'dark' | GlyphTheme;

  /** Callback for diagnostics emitted during rendering */
  onDiagnostic?: (diagnostic: Diagnostic) => void;

  /** Callback when a block-to-block reference is navigated */
  onNavigate?: (ref: Reference, targetBlock: Block) => void;
}

// ─── Factory ─────────────────────────────────────────────────

function createGlyphRuntime(config: GlyphRuntimeConfig): GlyphRuntime;

interface GlyphRuntime {
  /** React component — renders an IR document */
  GlyphDocument: React.FC<{ ir: GlyphIR; className?: string }>;

  /** Register additional components after creation */
  registerComponent(definition: GlyphComponentDefinition): void;

  /** Update theme at runtime */
  setTheme(theme: 'light' | 'dark' | GlyphTheme): void;
}

// ─── Usage ───────────────────────────────────────────────────

const runtime = createGlyphRuntime({
  components: [graphComponent, tableComponent, calloutComponent],
  theme: 'light',
  onDiagnostic: (d) => console.warn(`[glyph] ${d.message}`),
});

function App() {
  return <runtime.GlyphDocument ir={compiledIR} />;
}
```

`registerComponent` can be called before or after the first render. Components registered after mount trigger a re-render of any blocks matching the newly registered type.

### 7.3 Standard Markdown Rendering

Standard Markdown blocks are rendered by built-in base renderers that ship with the runtime (not plugins):

| Block Type       | Renderer             | Notes                                          |
| ---------------- | -------------------- | ---------------------------------------------- |
| `heading`        | `GlyphHeading`       | `<h1>`–`<h6>` with id-based anchor links       |
| `paragraph`      | `GlyphParagraph`     | `<p>` with recursive inline formatting         |
| `list`           | `GlyphList`          | `<ul>`/`<ol>` with nested list support         |
| `code`           | `GlyphCodeBlock`     | Syntax-highlighted via shiki                   |
| `blockquote`     | `GlyphBlockquote`    | Styled `<blockquote>`                          |
| `image`          | `GlyphImage`         | `<figure>` with `<img>`, caption, lazy loading |
| `thematic-break` | `GlyphThematicBreak` | `<hr>`                                         |
| `html`           | `GlyphRawHtml`       | Sanitized via DOMPurify at render time         |

Base renderers can be **overridden** (but not removed) via `config.overrides`. HTML sanitization uses DOMPurify with a strict allowlist (no `<script>`, `<iframe>`, event handlers, or `javascript:` URLs). Sanitization occurs at **render time** in the runtime, not at compile time — the IR stores the raw HTML.

### 7.4 Theming and Layout

```typescript
// ─── Theme Types ─────────────────────────────────────────────

interface GlyphTheme {
  name: string;
  variables: Record<string, string>; // CSS variable key → value
}

interface GlyphThemeContext {
  /** Current theme name */
  name: string;
  /** Resolve a CSS variable value from the current theme */
  resolveVar: (varName: string) => string;
  /** Whether the current theme is dark */
  isDark: boolean;
}

function useGlyphTheme(): GlyphThemeContext;
```

All CSS variables are prefixed with `--glyph-` to avoid collisions. Light and dark themes are built-in. Custom themes extend or override specific variables. Components access theme via `useGlyphTheme()`.

The layout engine interprets `LayoutHints`:

- **`document` mode**: Single-column, max-width, vertical flow.
- **`dashboard` mode**: CSS grid with configurable columns. Per-block placement via `LayoutHints.blockLayout`.
- **`presentation` mode**: Full-viewport blocks, one at a time.

SSR support: The runtime renders structural HTML server-side. D3-based components render a placeholder `<div>` with dimensions during SSR and hydrate on the client.

### 7.5 Plugin System

```typescript
interface GlyphComponentDefinition<T = unknown> {
  type: `ui:${string}`;
  schema: ZodType<T>;
  render: React.ComponentType<GlyphComponentProps<T>>;
  themeDefaults?: Record<string, string>;
  dependencies?: string[];
}

interface GlyphComponentProps<T = unknown> {
  data: T;
  block: Block;
  outgoingRefs: Reference[];
  incomingRefs: Reference[];
  onNavigate: (ref: Reference) => void;
  theme: GlyphThemeContext;
  layout: LayoutHints;
}
```

Unknown block types render a fallback placeholder showing the block type and raw data.

## 8. Built-in Components (v1)

All 8 components from the concept document are in scope for v1:

| Component    | Type          | Description                                                      |
| ------------ | ------------- | ---------------------------------------------------------------- |
| **Graph**    | `ui:graph`    | DAGs, flowcharts, mind maps, relational diagrams. D3 + Dagre.    |
| **Table**    | `ui:table`    | Sortable, filterable, aggregatable data tables.                  |
| **Chart**    | `ui:chart`    | Line, bar, area, and financial OHLC charts. D3-based.            |
| **Relation** | `ui:relation` | Entity-relationship diagrams via declarative YAML.               |
| **Timeline** | `ui:timeline` | Event sequences and system evolution visualizations.             |
| **Callout**  | `ui:callout`  | Highlighted info/warning/error blocks for narrative structuring. |
| **Tabs**     | `ui:tabs`     | Tabbed content containers (children via content fields).         |
| **Steps**    | `ui:steps`    | Sequential step-by-step guides with progress indication.         |

### 8.1 Graph and Relation Abstraction

A unified relational abstraction underpins `ui:graph` and `ui:relation`:

```typescript
// Shared types in @glyphjs/types

interface GraphNode {
  id: string;
  label: string;
  type?: string; // Semantic type (e.g. "service", "database", "entity")
  style?: Record<string, string>; // CSS-like style overrides
  group?: string; // Grouping/clustering key
}

interface GraphEdge {
  from: string; // Source node ID
  to: string; // Target node ID
  label?: string;
  type?: string; // Semantic type (e.g. "depends-on", "has-many")
  cardinality?: '1:1' | '1:N' | 'N:1' | 'N:M'; // For ER diagrams
  style?: Record<string, string>;
}
```

`ui:relation` constrains the graph schema by requiring `cardinality` on edges and treating nodes as entities with attributes.

## 9. Schema System

### 9.1 Dual Schema Approach

Schemas are authored in **Zod** for TypeScript DX and runtime validation. **JSON Schema** is auto-generated for external consumers, LLM prompts, and documentation.

### 9.2 Component Schemas

All 8 component schemas are defined in `@glyphjs/schemas`. Key schemas:

```typescript
// ─── Graph ───────────────────────────────────────────────────

export const graphSchema = z.object({
  type: z.enum(['dag', 'flowchart', 'mindmap', 'force']),
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      type: z.string().optional(),
      style: z.record(z.string()).optional(),
      group: z.string().optional(),
    }),
  ),
  edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: z.string().optional(),
      type: z.string().optional(),
      style: z.record(z.string()).optional(),
    }),
  ),
  layout: z.enum(['top-down', 'left-right', 'bottom-up', 'radial', 'force']).optional(),
});

// ─── Table ───────────────────────────────────────────────────

export const tableSchema = z.object({
  columns: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      sortable: z.boolean().optional(),
      filterable: z.boolean().optional(),
      type: z.enum(['string', 'number', 'date', 'boolean']).optional(),
    }),
  ),
  rows: z.array(z.record(z.unknown())),
  aggregation: z
    .array(
      z.object({
        column: z.string(),
        function: z.enum(['sum', 'avg', 'count', 'min', 'max']),
      }),
    )
    .optional(),
});

// ─── Chart ───────────────────────────────────────────────────

export const chartSchema = z.object({
  type: z.enum(['line', 'bar', 'area', 'ohlc']),
  series: z.array(
    z.object({
      name: z.string(),
      data: z.array(z.record(z.union([z.number(), z.string()]))),
    }),
  ),
  xAxis: z.object({ key: z.string(), label: z.string().optional() }).optional(),
  yAxis: z.object({ key: z.string(), label: z.string().optional() }).optional(),
  legend: z.boolean().optional(),
});

// ─── Relation (ER Diagram) ───────────────────────────────────

export const relationSchema = z.object({
  entities: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      attributes: z
        .array(
          z.object({
            name: z.string(),
            type: z.string(),
            primaryKey: z.boolean().optional(),
          }),
        )
        .optional(),
    }),
  ),
  relationships: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: z.string().optional(),
      cardinality: z.enum(['1:1', '1:N', 'N:1', 'N:M']),
    }),
  ),
  layout: z.enum(['top-down', 'left-right']).optional(),
});

// ─── Timeline ────────────────────────────────────────────────

export const timelineSchema = z.object({
  events: z.array(
    z.object({
      date: z.string(),
      title: z.string(),
      description: z.string().optional(),
      type: z.string().optional(),
    }),
  ),
  orientation: z.enum(['vertical', 'horizontal']).optional(),
});

// ─── Callout ─────────────────────────────────────────────────

export const calloutSchema = z.object({
  type: z.enum(['info', 'warning', 'error', 'tip']),
  title: z.string().optional(),
  content: z.string(), // Markdown content (re-parsed by compiler)
});

// ─── Tabs ────────────────────────────────────────────────────

export const tabsSchema = z.object({
  tabs: z.array(
    z.object({
      label: z.string(),
      content: z.string(), // Markdown content (re-parsed by compiler)
    }),
  ),
});

// ─── Steps ───────────────────────────────────────────────────

export const stepsSchema = z.object({
  steps: z.array(
    z.object({
      title: z.string(),
      status: z.enum(['pending', 'active', 'completed']).optional(),
      content: z.string(), // Markdown content (re-parsed by compiler)
    }),
  ),
});
```

Note: the `graph.layout` enum now includes `bottom-up` to match the `LayoutSemantic` type.

## 10. Error Model and Diagnostics

### 10.1 Diagnostic Type

```typescript
interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  position?: SourcePosition;
  source: DiagnosticSource;
  details?: unknown;
}

type DiagnosticSource = 'parser' | 'compiler' | 'schema' | 'runtime' | 'plugin';

interface CompilationResult {
  ir: GlyphIR;
  diagnostics: Diagnostic[];
  hasErrors: boolean; // Shorthand: diagnostics.some(d => d.severity === 'error')
}
```

### 10.2 Error Recovery Strategy

The compiler uses a **collect-all-errors** strategy:

1. **Parser errors**: Recovered; broken sections become error blocks in the AST.
2. **YAML parse errors**: Block preserved with raw source text; `diagnostics` array on the Block contains the error.
3. **Schema validation errors**: Block preserved with original data; `diagnostics` on the Block contain Zod error paths.
4. **Reference resolution errors**: Warning diagnostic; Reference preserved with `unresolved: true`.
5. **Unknown block types**: Info diagnostic; block preserved as-is.

IR is **always** produced, even with errors.

### 10.3 Runtime Error Boundaries

Each block is wrapped in a React Error Boundary. Errors in one block do not crash others. Errors are surfaced via `onDiagnostic` in the runtime config.

## 11. MCP Integration (Spec Only — v1)

### 11.1 Overview

The MCP integration defines how LLMs interact with Glyph JS documents. **v1 specifies the interface; implementation is deferred to v2.**

### 11.2 Proposed MCP Tools

| Tool                    | Description                              |
| ----------------------- | ---------------------------------------- |
| `glyph_create_document` | Create a new IR document with metadata.  |
| `glyph_add_block`       | Add a block to a document.               |
| `glyph_update_block`    | Modify an existing block's data.         |
| `glyph_remove_block`    | Remove a block.                          |
| `glyph_add_node`        | Add a node to a graph/relation block.    |
| `glyph_add_edge`        | Add an edge between nodes.               |
| `glyph_link_entities`   | Create a reference between blocks.       |
| `glyph_patch`           | Apply a `GlyphPatch` (Section 6.5).      |
| `glyph_commit`          | Serialize IR back to canonical Markdown. |

### 11.3 Session Model

- LLMs operate on IR via `GlyphPatch` operations.
- Sessions can be committed back into Markdown source files.
- Patches are logged for auditability and undo support.

## 12. Storage and Versioning

- **Markdown is the source of truth** and lives in Git.
- **IR is derived and ephemeral** — generated at compile time, not committed.
- `.glyph/` directory (gitignored) stores compiled IR cache and session state locally.

## 13. Documentation Site and Demo Playground

### 13.1 Overview

Glyph JS ships a documentation site and interactive playground hosted on **GitHub Pages**.

### 13.2 Technology

| Concern           | Choice                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Framework         | **Astro Starlight** — static-first docs framework with MDX and built-in search.          |
| React embedding   | Astro Islands — Glyph components render as interactive React islands.                    |
| Playground editor | **CodeMirror 6** — lightweight, extensible, custom syntax highlighting for `ui:` blocks. |
| Hosting           | **GitHub Pages** — deployed via GitHub Actions on push to `main`.                        |
| Package location  | `apps/docs` in the monorepo.                                                             |

### 13.3 Site Structure

```
glyphjs.github.io/
├── /                        # Landing page
├── /getting-started/        # Installation, first document, tutorial
├── /authoring-guide/        # Markdown syntax, YAML, fenced block reference
├── /components/             # Component reference (one page per component with live examples)
├── /ir-spec/                # IR JSON spec, versioning, patch format
├── /plugin-api/             # Plugin system, custom components, schema authoring
├── /theming/                # Theme customization, CSS variables
├── /gallery/                # Real-world examples
└── /playground/             # Interactive Markdown → UI playground
```

### 13.4 Playground

Split-pane CodeMirror editor (left) with live Glyph rendering (right). Full pipeline runs in-browser (debounced). Includes theme toggle, URL sharing, IR JSON export, and preset examples.

### 13.5 Deployment

GitHub Actions workflow builds `apps/docs` on push to `main` and deploys to `gh-pages` branch.

## 14. Testing Strategy

### 14.1 Test Tooling

| Tool                      | Purpose                                                               |
| ------------------------- | --------------------------------------------------------------------- |
| **Vitest**                | Unit and integration tests. Fast, native ESM, Turborepo-compatible.   |
| **fast-check**            | Property-based testing for IR patch/diff operations.                  |
| **Playwright**            | Visual regression and interaction testing against Storybook.          |
| **Storybook**             | Component development harness. Doubles as docs and Playwright target. |
| **React Testing Library** | DOM assertions for runtime logic without a full browser.              |

### 14.2 Per-Package Testing

- **`@glyphjs/schemas`**: Vitest unit tests + dual validation conformance (Zod + JSON Schema agree on every fixture).
- **`@glyphjs/parser`**: Golden file tests (`.md` → `.ast.json` fixtures).
- **`@glyphjs/ir`**: Unit tests + fast-check property-based tests (diff/apply roundtrip, patch composition associativity, identity, validation).
- **`@glyphjs/compiler`**: Golden file tests (`.md` → `.ir.json` fixtures), determinism test, error diagnostic fixtures.
- **`@glyphjs/runtime`**: React Testing Library tests for registry, theming, layout, error boundaries.
- **`@glyphjs/components`**: Storybook stories for all variants + Playwright visual regression + interaction tests + unit tests for component logic (D3 data transforms, sort/filter algorithms).

### 14.3 End-to-End Pipeline Tests

Full Markdown → rendered DOM tests via Playwright against a minimal Vite app.

### 14.4 CI Integration

- Vitest on every PR (unit + golden file + property-based).
- Playwright on every PR (visual + interaction + E2E).
- axe-core accessibility scan against Storybook static build.
- Bundle size tracking via `size-limit` with CI enforcement against budgets.
- Turborepo caching for all tasks.

## 15. Build Tooling and Infrastructure

| Concern                    | Choice                   |
| -------------------------- | ------------------------ |
| Language                   | TypeScript (strict mode) |
| Package manager            | pnpm (workspaces)        |
| Build orchestration        | Turborepo                |
| Bundler                    | tsup (esbuild-based)     |
| Unit / integration tests   | Vitest                   |
| Property-based tests       | fast-check               |
| Visual / interaction tests | Playwright               |
| Component harness          | Storybook                |
| Component unit tests       | React Testing Library    |
| Bundle size tracking       | size-limit               |
| Linting                    | ESLint + Prettier        |
| Documentation              | Astro Starlight          |
| Playground editor          | CodeMirror 6             |
| Docs hosting               | GitHub Pages             |
| CI                         | GitHub Actions           |

### 15.1 Target Environments

| Package               | Node.js | Browser | SSR                                         |
| --------------------- | ------- | ------- | ------------------------------------------- |
| `@glyphjs/types`      | Yes     | Yes     | N/A (type-only)                             |
| `@glyphjs/schemas`    | Yes     | Yes     | N/A (validation)                            |
| `@glyphjs/parser`     | Yes     | Yes     | N/A (pure transform)                        |
| `@glyphjs/compiler`   | Yes     | Yes     | N/A (pure transform)                        |
| `@glyphjs/ir`         | Yes     | Yes     | N/A (pure transform)                        |
| `@glyphjs/runtime`    | No      | Yes     | Yes (React SSR)                             |
| `@glyphjs/components` | No      | Yes     | Partial (SSR placeholder, client hydration) |

All packages target ES2022 and ship as ESM with CJS fallback via tsup.

### 15.2 Bundle Size and Lazy Loading

Per-component dynamic imports via `React.lazy` + `Suspense`. Bundle budgets (gzipped):

| Package                                                            | Budget                        |
| ------------------------------------------------------------------ | ----------------------------- |
| `@glyphjs/parser` + `@glyphjs/compiler` (excluding unified/remark) | < 15KB own code               |
| unified/remark (peer dependency)                                   | ~50KB (external, not bundled) |
| `@glyphjs/runtime` (core, no components)                           | < 15KB                        |
| `@glyphjs/components` — callout, tabs, steps                       | < 5KB each                    |
| `@glyphjs/components` — table                                      | < 20KB                        |
| `@glyphjs/components` — graph, relation                            | < 80KB each (D3 + Dagre)      |
| `@glyphjs/components` — chart                                      | < 60KB (D3)                   |
| `@glyphjs/components` — timeline                                   | < 40KB (D3)                   |

Note: unified/remark is a **peer dependency** of `@glyphjs/parser`, not bundled. The 15KB budget covers Glyph's own parser plugin code. In browser environments (e.g., the playground), unified/remark is loaded as a separate chunk.

## 16. Implementation Milestones

### Phase 1: Foundation (Alpha)

- Initialize monorepo with pnpm workspaces + Turborepo.
- Implement `@glyphjs/types` — all IR, AST, diagnostic, patch, and plugin contract types.
- Implement `@glyphjs/schemas` — Zod schemas for all 8 components.
- Implement `@glyphjs/parser` — remark plugin for `ui:` fenced blocks.
- Implement `@glyphjs/ir` — validation, diffing, patching, migration, block ID generation.
- Implement `@glyphjs/compiler` — AST-to-IR compilation.
- Set up Vitest, golden file tests, property-based tests, dual schema validation, CI.

### Phase 2: Rendering (Beta)

- Implement `@glyphjs/runtime` — rendering engine, base renderers, registry, theming, layout.
- Build all 8 components with D3 + Dagre.
- Set up Storybook, Playwright visual/interaction tests.
- Demo app.

### Phase 3: Polish (v1.0)

- Animation orchestration, cross-block references, error diagnostics overlay.
- E2E pipeline tests, CI finalization, bundle size enforcement, axe-core accessibility.
- Documentation site, playground, gallery, GitHub Pages deployment.
- npm publish pipeline.
- MCP tool interface types finalized.

### Phase 4: Live Sessions (v2.0 — Future)

- MCP server implementation, whiteboard mode, bidirectional Markdown↔IR, collaboration, PDF/Slides export, domain-specific component packs.

## 17. Accessibility

WCAG 2.1 Level AA compliance for all built-in components.

| Requirement               | Description                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Semantic HTML**         | Appropriate elements (`<table>`, `<nav>`, `<figure>`, `<h1>`–`<h6>`).                                  |
| **ARIA attributes**       | `role`, `aria-label`, `aria-describedby`, `aria-live`, `aria-expanded`, `aria-selected`.               |
| **Keyboard navigation**   | All interactive elements focusable and operable. Graphs: arrow-key traversal. Tables: cell navigation. |
| **Color contrast**        | 4.5:1 ratio (AA). Theming system validates contrast at build time.                                     |
| **Screen reader support** | Graphs/charts provide hidden data table fallbacks.                                                     |
| **Focus management**      | Reference navigation moves focus with `aria-live` announcement.                                        |
| **Reduced motion**        | Animations respect `prefers-reduced-motion`.                                                           |

Testing: `@storybook/addon-a11y` (axe-core per story), Playwright keyboard assertions, CI axe-core scan.

## 18. Open Questions

- **Streaming compilation**: Should the compiler support streaming Markdown input (for rendering as an LLM generates tokens)?
- **Markdown round-tripping**: How strict should IR-to-Markdown serialization be? Exact reproduction vs. semantic equivalence?
- **Component sandboxing**: Should third-party plugin components run in an iframe sandbox for security?
- **Nested `ui:` in containers**: Should v2 allow `ui:` blocks inside tab/step content fields?

---

_This RFC is based on the initial concept document (`markdown_ui_rfc.pdf`) and captures all architectural decisions for the Glyph JS v1 implementation._
