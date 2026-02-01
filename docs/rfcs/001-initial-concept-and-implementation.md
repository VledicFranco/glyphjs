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

## 12. Build Tooling and Infrastructure

| Concern | Choice |
|---|---|
| Language | TypeScript (strict mode) |
| Package manager | pnpm (workspaces) |
| Build orchestration | Turborepo |
| Bundler | tsup (esbuild-based) |
| Testing | Vitest |
| Linting | ESLint + Prettier |
| CI | GitHub Actions |

## 13. Implementation Milestones

### Phase 1: Foundation (Alpha)

- Initialize monorepo with pnpm workspaces + Turborepo.
- Define IR type system and JSON schema (`@glyphjs/ir`).
- Define Zod schemas for all 8 components (`@glyphjs/schemas`).
- Implement remark plugin for `ui:` fenced block parsing (`@glyphjs/parser`).
- Implement AST-to-IR compiler (`@glyphjs/compiler`).
- End-to-end test: Markdown string → IR JSON for all component types.

### Phase 2: Rendering (Beta)

- Implement React rendering runtime (`@glyphjs/runtime`).
- Implement component registry and plugin system.
- Build all 8 components with D3 + Dagre (`@glyphjs/components`).
- Theming system (light/dark, CSS variables).
- Layout engine for block positioning and responsive behavior.
- Demo app: load a Markdown file and render it as interactive UI.

### Phase 3: Polish (v1.0)

- Animation orchestration for state transitions.
- Cross-block references and navigation.
- Error diagnostics with source-mapped Markdown locations.
- Documentation site and component gallery.
- npm publish pipeline for all packages.
- MCP tool interface specification finalized (no server implementation).

### Phase 4: Live Sessions (v2.0 — Future)

- MCP server implementation.
- Whiteboard mode with real-time IR patching.
- Bidirectional Markdown <-> IR normalization.
- Collaborative multi-user sessions.
- Export to PDF/Slides.
- Domain-specific component packs.

## 14. Open Questions

- **Streaming compilation**: Should the compiler support streaming Markdown input (for rendering as an LLM generates tokens)?
- **Markdown round-tripping**: How strict should IR-to-Markdown serialization be? Exact reproduction vs. semantic equivalence?
- **Component sandboxing**: Should third-party plugin components run in an iframe sandbox for security?
- **Accessibility**: What WCAG compliance level should the rendering runtime target?

---

*This RFC is based on the initial concept document (`markdown_ui_rfc.pdf`) and captures all architectural decisions for the Glyph JS v1 implementation.*
