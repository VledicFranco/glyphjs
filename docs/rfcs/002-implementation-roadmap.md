# RFC-002: Glyph JS — Implementation Roadmap

- **Status:** Draft
- **Authors:** VledicFranco
- **Created:** 2026-02-01
- **Depends on:** RFC-001

---

## Overview

This document breaks down RFC-001 into actionable GitHub issues organized by phase. Each issue is scoped to be a single PR or a small set of related PRs. Dependencies between issues are explicit — an issue cannot start until its blockers are resolved.

### Labels

Issues use the following label scheme:

| Label | Description |
|---|---|
| `phase:alpha` | Phase 1 — Foundation |
| `phase:beta` | Phase 2 — Rendering |
| `phase:v1` | Phase 3 — Polish |
| `phase:v2` | Phase 4 — Future |
| `pkg:types` | `@glyphjs/types` |
| `pkg:schemas` | `@glyphjs/schemas` |
| `pkg:parser` | `@glyphjs/parser` |
| `pkg:compiler` | `@glyphjs/compiler` |
| `pkg:ir` | `@glyphjs/ir` |
| `pkg:runtime` | `@glyphjs/runtime` |
| `pkg:components` | `@glyphjs/components` |
| `app:docs` | `apps/docs` |
| `infra` | Build tooling, CI, repo config |
| `testing` | Test infrastructure and test suites |
| `a11y` | Accessibility |

---

## Phase 1: Foundation (Alpha)

### Milestone: `alpha`

Goal: Monorepo scaffolding, complete type system, parser, compiler, and all compilation-layer tests pass. The full Markdown → IR pipeline works end-to-end in Node.js.

---

### P1-01: Initialize monorepo with pnpm workspaces and Turborepo

**Labels:** `phase:alpha`, `infra`
**Blocked by:** —
**Blocks:** Everything else

**Scope:**
- Initialize `pnpm-workspace.yaml` with `packages/*` and `apps/*` globs.
- Add root `turbo.json` with `build`, `test`, `lint`, `typecheck` pipelines.
- Add root `tsconfig.json` (base config) with strict mode, ES2022 target, ESM module.
- Add root `.gitignore` (node_modules, dist, .glyph, .turbo, coverage).
- Add root `package.json` with workspace scripts.
- Add `.npmrc` with `shamefully-hoist=false`.
- Add ESLint flat config + Prettier config at root.
- Create empty package scaffolds for all 7 packages (package.json, tsconfig.json, src/index.ts).
- Verify `pnpm install`, `pnpm build`, `pnpm lint`, `pnpm typecheck` all pass.

**Acceptance criteria:**
- `pnpm build` succeeds across all packages with Turborepo caching.
- `pnpm lint` and `pnpm typecheck` pass on the empty scaffolds.
- Each package has correct `name`, `version`, `main`, `types`, and `exports` fields.

---

### P1-02: Set up tsup build configuration for all packages

**Labels:** `phase:alpha`, `infra`
**Blocked by:** P1-01
**Blocks:** P1-03

**Scope:**
- Add `tsup.config.ts` to each package.
- Configure dual-format builds (ESM + CJS) per RFC Section 15.1.
- `@glyphjs/types` is type-only — emits `.d.ts` files only (no JS output).
- All other packages emit `dist/index.mjs`, `dist/index.cjs`, and `dist/index.d.ts`.
- Configure `package.json` `exports` field for each package with proper subpath exports.
- Add `turbo.json` build dependency graph matching RFC Section 4.2.

**Acceptance criteria:**
- `pnpm build` produces correct ESM, CJS, and `.d.ts` outputs for every package.
- Turborepo builds packages in dependency order.
- `@glyphjs/types` emits only type declarations.

---

### P1-03: Implement `@glyphjs/types` — shared type definitions

**Labels:** `phase:alpha`, `pkg:types`
**Blocked by:** P1-02
**Blocks:** P1-04, P1-05, P1-06, P1-07, P1-08

**Scope:**
Implement all types from RFC Sections 6.1, 10.1, and 7.5:
- `GlyphIR`, `DocumentMetadata`, `Block`, `BlockType`
- `Reference`, `ReferenceType`
- `SourcePosition` (unist-compatible)
- `LayoutHints`, `LayoutSemantic`
- `Diagnostic`, `DiagnosticSource`, `CompilationResult`
- `GlyphComponentDefinition<T>`, `GlyphComponentProps<T>`
- `GlyphThemeContext`
- `IRMigration`
- Glyph AST node types (extending MDAST): `GlyphRoot`, `GlyphUIBlock` (fenced ui: blocks with parsed YAML data)
- `Patch` type (JSON Patch RFC 6902 wrapper)

**Acceptance criteria:**
- All types compile with `strict: true`.
- Zero runtime dependencies — `@glyphjs/types` is purely `.d.ts` files.
- Each type has JSDoc comments matching the RFC descriptions.

---

### P1-04: Implement `@glyphjs/schemas` — Zod schemas for all 8 components

**Labels:** `phase:alpha`, `pkg:schemas`
**Blocked by:** P1-03
**Blocks:** P1-06, P1-07, P1-10

**Scope:**
Implement Zod schemas as specified in RFC Section 9:
- `graphSchema` — nodes, edges, type (dag/flowchart/mindmap/force), layout
- `tableSchema` — columns, rows, sortable, filterable, aggregatable
- `chartSchema` — type (line/bar/area/ohlc), series, axes, labels
- `relationSchema` — entities, relationships, cardinality, layout
- `timelineSchema` — events, date format, orientation
- `calloutSchema` — type (info/warning/error/tip), title, content
- `tabsSchema` — tabs array with label + content
- `stepsSchema` — steps array with title, description, status
- Shared sub-schemas: `RelationalModel`, `graphNodeSchema`, `graphEdgeSchema`
- JSON Schema generation via `zod-to-json-schema` with a `generateAllSchemas()` export
- `index.ts` barrel export for all schemas

**Acceptance criteria:**
- Every schema parses valid YAML payloads and rejects invalid ones.
- `generateAllSchemas()` produces valid JSON Schema for each component.
- All schemas have TypeScript type inference (`z.infer<typeof graphSchema>`).

---

### P1-05: Implement `@glyphjs/ir` — IR validation, diffing, patching, migration

**Labels:** `phase:alpha`, `pkg:ir`
**Blocked by:** P1-03
**Blocks:** P1-07, P1-12

**Scope:**
- `validate(ir: unknown): ir is GlyphIR` — validates raw JSON against the IR structure.
- `diffIR(a: GlyphIR, b: GlyphIR): Patch[]` — computes JSON Patch operations between two IR documents.
- `applyPatch(ir: GlyphIR, patches: Patch[]): GlyphIR` — applies patches to an IR document.
- `migrateIR(ir: GlyphIR, targetVersion: string): GlyphIR` — version migration pipeline (RFC Section 6.4).
- Migration registry with `registerMigration()` and `findMigrationPath()`.
- Block ID generation utility: `generateBlockId(docId, index, type, content): string` (RFC Section 6.2).
- IR factory helpers: `createDocument()`, `createBlock()`, `createReference()`.

**Acceptance criteria:**
- `diffIR` and `applyPatch` satisfy the roundtrip invariant: `applyPatch(a, diffIR(a, b)) === b`.
- `generateBlockId` is deterministic: same inputs always produce the same ID.
- `validate` correctly rejects malformed IR.

---

### P1-06: Implement `@glyphjs/parser` — remark plugin for `ui:` fenced blocks

**Labels:** `phase:alpha`, `pkg:parser`
**Blocked by:** P1-03, P1-04
**Blocks:** P1-07

**Scope:**
- Implement `remarkGlyph` remark plugin.
- The plugin hooks into remark's fenced code block processing.
- Fenced blocks with a language tag starting with `ui:` are parsed as `GlyphUIBlock` AST nodes.
- The YAML payload inside `ui:` blocks is parsed (using `yaml` package) and attached to the AST node as `data`.
- If YAML parsing fails, the node is preserved with `parseError: true` and a `Diagnostic` is emitted.
- Standard Markdown nodes (headings, paragraphs, lists, etc.) pass through unchanged.
- Export `parseGlyphMarkdown(markdown: string): { ast: GlyphRoot, diagnostics: Diagnostic[] }`.
- Source positions are tracked on every node (unist-compatible `SourcePosition`).

**Acceptance criteria:**
- Standard Markdown parses identically to stock remark.
- `ui:graph`, `ui:table`, etc. are parsed into `GlyphUIBlock` nodes with YAML data.
- Invalid YAML produces diagnostics but doesn't crash the parser.
- Source positions are accurate for all nodes.

---

### P1-07: Implement `@glyphjs/compiler` — AST-to-IR compilation

**Labels:** `phase:alpha`, `pkg:compiler`
**Blocked by:** P1-03, P1-04, P1-05, P1-06
**Blocks:** P1-11

**Scope:**
- `compile(markdown: string): CompilationResult` — full pipeline: parse → validate schemas → generate IDs → resolve references → emit IR.
- Map standard MDAST nodes to IR `Block` types (heading, paragraph, list, code, blockquote, image, thematic-break, html).
- Map `GlyphUIBlock` AST nodes to IR `Block` types (`ui:graph`, `ui:table`, etc.).
- Validate each `ui:` block's data against its Zod schema from `@glyphjs/schemas`. Emit diagnostics on validation failure.
- Generate deterministic block IDs via `@glyphjs/ir` `generateBlockId()`.
- Extract `DocumentMetadata` from the first heading and frontmatter.
- Resolve `LayoutHints` from document-level frontmatter (or defaults).
- Implement collect-all-errors strategy (RFC Section 10.2): IR is always produced, even with errors.
- Handle inline formatting: preserve MDAST `PhrasingContent` tree in block `data`.

**Acceptance criteria:**
- Same Markdown input always produces identical IR (byte-for-byte JSON comparison).
- All 8 `ui:` component types compile correctly.
- Standard Markdown compiles to the correct block types.
- Schema validation errors are reported as diagnostics with source positions.
- Invalid YAML blocks are preserved with error diagnostics.
- Unknown `ui:` types are preserved with info diagnostics.

---

### P1-08: Set up Vitest and golden file test infrastructure

**Labels:** `phase:alpha`, `testing`, `infra`
**Blocked by:** P1-03
**Blocks:** P1-09, P1-10, P1-11, P1-12

**Scope:**
- Add Vitest to root `devDependencies`.
- Configure Vitest in `turbo.json` (`test` task depends on `build`).
- Create a shared test utility for golden file testing:
  - `loadFixture(dir, name)` — reads `.md` input and `.ast.json` / `.ir.json` expected output.
  - `assertMatchesGolden(actual, expectedPath)` — deep-equal comparison with helpful diff on failure.
  - `updateGolden(actual, path)` — writes new golden file (for `--update-goldens` flag).
- Add `vitest.config.ts` to each package.
- Verify `pnpm test` runs across all packages via Turborepo.

**Acceptance criteria:**
- `pnpm test` discovers and runs tests in all packages.
- Golden file infrastructure loads fixtures and produces readable diffs on mismatch.
- Turborepo caches test results per package.

---

### P1-09: Golden file tests for `@glyphjs/parser`

**Labels:** `phase:alpha`, `testing`, `pkg:parser`
**Blocked by:** P1-06, P1-08

**Scope:**
Create fixture pairs in `packages/parser/test/fixtures/`:
- `basic-text.md` / `.ast.json` — plain paragraphs, headings, lists
- `headings-and-lists.md` / `.ast.json` — nested lists, multiple heading levels
- `code-blocks.md` / `.ast.json` — standard fenced code blocks (non-ui)
- `graph-dag.md` / `.ast.json` — `ui:graph` with DAG layout
- `graph-mindmap.md` / `.ast.json` — `ui:graph` with mindmap type
- `table-basic.md` / `.ast.json` — `ui:table` with columns and rows
- `chart-line.md` / `.ast.json` — `ui:chart` with line series
- `relation-er.md` / `.ast.json` — `ui:relation` with entities
- `timeline-events.md` / `.ast.json` — `ui:timeline`
- `callout-variants.md` / `.ast.json` — `ui:callout` (info, warning, error)
- `tabs-nested.md` / `.ast.json` — `ui:tabs` with nested content
- `steps-guide.md` / `.ast.json` — `ui:steps`
- `mixed-content.md` / `.ast.json` — document mixing standard Markdown and multiple `ui:` blocks
- `error-invalid-yaml.md` / `.ast.json` — malformed YAML inside a `ui:` block
- `error-unclosed-fence.md` / `.ast.json` — unclosed fenced block

**Acceptance criteria:**
- All fixtures produce matching AST output.
- Error cases produce diagnostics and don't crash.

---

### P1-10: Dual validation conformance tests for `@glyphjs/schemas`

**Labels:** `phase:alpha`, `testing`, `pkg:schemas`
**Blocked by:** P1-04, P1-08

**Scope:**
For each of the 8 component schemas, create:
- 3+ valid fixture payloads (minimal, typical, maximal).
- 3+ invalid fixture payloads (missing required fields, wrong types, extra disallowed fields).
- Test that both Zod and auto-generated JSON Schema produce identical accept/reject results on every fixture.
- Use `ajv` for JSON Schema validation.

**Acceptance criteria:**
- Every schema has at least 6 test fixtures (3 valid, 3 invalid).
- Zod and JSON Schema agree on every fixture.
- No false positives or negatives.

---

### P1-11: Golden file tests for `@glyphjs/compiler`

**Labels:** `phase:alpha`, `testing`, `pkg:compiler`
**Blocked by:** P1-07, P1-08

**Scope:**
Create fixture pairs in `packages/compiler/test/fixtures/`:
- `full-document.md` / `.ir.json` — document with heading, paragraphs, and a `ui:graph`
- `all-components.md` / `.ir.json` — one of each `ui:` component type
- `graph-all-layouts.md` / `.ir.json` — graph with each layout variant
- `table-with-aggregation.md` / `.ir.json` — table with sort/filter/aggregate config
- `chart-ohlc.md` / `.ir.json` — financial OHLC chart
- `relation-er-complex.md` / `.ir.json` — ER diagram with multiple entities and relationships
- `metadata-extraction.md` / `.ir.json` — verifies title, description extracted from headings/paragraphs
- `error-invalid-yaml.md` / `.ir.json` + `.diagnostics.json` — YAML parse error
- `error-schema-violation.md` / `.ir.json` + `.diagnostics.json` — valid YAML, invalid schema
- `error-unknown-type.md` / `.ir.json` + `.diagnostics.json` — unknown `ui:xyz` type
- `determinism.test.ts` — compile same input twice, assert identical output (byte-for-byte)

**Acceptance criteria:**
- All fixtures produce matching IR output.
- Diagnostics fixtures match expected errors/warnings.
- Determinism test passes.

---

### P1-12: Property-based tests for `@glyphjs/ir`

**Labels:** `phase:alpha`, `testing`, `pkg:ir`
**Blocked by:** P1-05, P1-08

**Scope:**
Using `fast-check`:
- Implement `arbitraryGlyphIR()` — generates random valid IR documents.
- Implement `arbitraryPatch()` — generates random valid patches for a given IR.
- Property: `applyPatch(a, diffIR(a, b)) deep-equals b` (diff/apply roundtrip).
- Property: `applyPatch(doc, patch)` always produces a valid IR (passes `validate()`).
- Property: `applyPatch(doc, [])` is identity (empty patch).
- Property: `generateBlockId` is deterministic (same inputs → same output across runs).
- Unit tests for `migrateIR` with mock migration functions.
- Unit tests for `validate` with valid and invalid IR samples.

**Acceptance criteria:**
- Property tests run 100+ iterations each without failure.
- Migration tests cover single-step and multi-step version jumps.
- Edge cases: empty documents, documents with 0 blocks, deeply nested children.

---

### P1-13: Set up GitHub Actions CI pipeline

**Labels:** `phase:alpha`, `infra`
**Blocked by:** P1-08
**Blocks:** —

**Scope:**
- `.github/workflows/ci.yml`:
  - Trigger on push to `main` and on PRs.
  - Matrix: Node 20, latest pnpm.
  - Steps: checkout, pnpm install, typecheck, lint, build, test.
  - Turborepo remote caching (optional — can add later).
- `.github/workflows/docs.yml` (stub — real deployment in Phase 3):
  - Trigger on push to `main`.
  - Build docs (will fail gracefully until `apps/docs` exists).

**Acceptance criteria:**
- CI passes on the `main` branch.
- PRs get status checks for typecheck, lint, build, and test.

---

## Phase 2: Rendering (Beta)

### Milestone: `beta`

Goal: The full pipeline works end-to-end in the browser. All 8 components render interactively. Storybook and Playwright visual testing are operational.

---

### P2-01: Implement `@glyphjs/runtime` — core rendering engine

**Labels:** `phase:beta`, `pkg:runtime`
**Blocked by:** P1-03 (types)
**Blocks:** P2-02, P2-03, P2-04, P2-05

**Scope:**
- `<GlyphDocument ir={ir} />` — top-level React component that renders an IR document.
- Block renderer: iterates over `ir.blocks`, resolves each block's type to a renderer (base renderer or registered component), wraps each in an Error Boundary.
- Component registry: `createGlyphRuntime({ components, overrides, onDiagnostic })`.
- Base renderers for standard Markdown block types (RFC Section 7.2):
  - `GlyphHeading` — `<h1>`–`<h6>` with id-based anchor links
  - `GlyphParagraph` — `<p>` with inline formatting (bold, italic, code, links)
  - `GlyphList` — `<ul>`/`<ol>` with nested list support
  - `GlyphCodeBlock` — syntax-highlighted code (shiki)
  - `GlyphBlockquote` — styled `<blockquote>`
  - `GlyphImage` — `<img>` with caption and lazy loading
  - `GlyphThematicBreak` — `<hr>`
  - `GlyphRawHtml` — sanitized HTML passthrough (DOMPurify)
- Inline formatting renderer: recursive tree of `PhrasingContent` nodes.
- Unknown block type fallback: placeholder showing type and raw data.
- `onDiagnostic` callback for runtime errors.
- `React.Suspense` boundary for lazy-loaded components.

**Acceptance criteria:**
- `<GlyphDocument>` renders a compiled IR document with all standard Markdown blocks.
- Unknown `ui:` types render fallback placeholders, not crashes.
- Error in one block doesn't take down other blocks.

---

### P2-02: Implement theming system

**Labels:** `phase:beta`, `pkg:runtime`
**Blocked by:** P2-01
**Blocks:** P2-05

**Scope:**
- `GlyphThemeProvider` React context with `light` and `dark` built-in themes.
- CSS variables injected on the Glyph root container element (RFC Section 7.4).
- Full `--glyph-*` variable namespace as specified in the RFC.
- `useGlyphTheme()` hook for components to access theme context.
- Custom theme support: user passes a partial theme that overrides specific variables.
- Plugin theme defaults: `themeDefaults` from `GlyphComponentDefinition` are merged.
- `prefers-color-scheme` media query auto-detection (with manual override).

**Acceptance criteria:**
- Light and dark themes apply correct CSS variables.
- Custom themes override specific variables without losing defaults.
- `useGlyphTheme()` provides the current theme to components.

---

### P2-03: Implement layout engine

**Labels:** `phase:beta`, `pkg:runtime`
**Blocked by:** P2-01

**Scope:**
- Layout engine interprets `LayoutHints` from the IR:
  - `document` mode: single-column, max-width, vertical flow.
  - `dashboard` mode: CSS grid with configurable columns.
  - `presentation` mode: full-viewport blocks, one at a time.
- Block spacing: `compact`, `normal`, `relaxed` mapped to CSS variables.
- Responsive breakpoints: dashboard collapses to single column on narrow viewports.
- Block container component with layout-aware sizing.

**Acceptance criteria:**
- All 3 layout modes render correctly.
- Responsive collapse works at defined breakpoints.
- Spacing settings are visually distinct.

---

### P2-04: Implement plugin registration system

**Labels:** `phase:beta`, `pkg:runtime`
**Blocked by:** P2-01
**Blocks:** P2-05

**Scope:**
- `runtime.registerComponent(definition: GlyphComponentDefinition)` — adds a component to the registry.
- Validates that `definition.type` starts with `ui:`.
- Validates no duplicate type registrations (throws on conflict).
- `runtime.getComponent(type: string)` — looks up registered component.
- Dependency resolution: if a component declares `dependencies`, they must be registered first.
- Props wiring: the runtime passes `GlyphComponentProps<T>` to every registered component (data, block, refs, onNavigate, theme, layout).

**Acceptance criteria:**
- Custom components register and render correctly.
- Duplicate registration throws a clear error.
- Dependency validation catches missing dependencies.
- `GlyphComponentProps` are correctly wired to each component.

---

### P2-05: Implement `ui:callout` component

**Labels:** `phase:beta`, `pkg:components`
**Blocked by:** P2-01, P2-02, P2-04
**Blocks:** P2-13

**Scope:**
- Render info, warning, error, and tip callout variants.
- Semantic HTML: `<aside>` with appropriate `role` and ARIA attributes.
- Styled with `--glyph-callout-*` CSS variables.
- Supports title and Markdown content body.
- Keyboard accessible (focusable).
- `React.lazy` dynamic import wrapper.

**Acceptance criteria:**
- All 4 variants render with correct styling and icons.
- Accessible: screen reader announces callout type.
- Lazy-loaded: does not increase core runtime bundle.

---

### P2-06: Implement `ui:tabs` component

**Labels:** `phase:beta`, `pkg:components`
**Blocked by:** P2-01, P2-02, P2-04
**Blocks:** P2-13

**Scope:**
- Tabbed container with tab labels and switchable content panels.
- ARIA: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`.
- Keyboard: arrow keys switch tabs, Enter/Space activates.
- Content panels render nested blocks (child blocks from IR).
- `React.lazy` wrapper.

**Acceptance criteria:**
- Tab switching works via click and keyboard.
- Correct ARIA roles and relationships.
- Only active panel is visible; others are hidden but preserved in DOM.

---

### P2-07: Implement `ui:steps` component

**Labels:** `phase:beta`, `pkg:components`
**Blocked by:** P2-01, P2-02, P2-04
**Blocks:** P2-13

**Scope:**
- Sequential step-by-step guide with progress indication.
- Semantic HTML: `<ol>` with `<li>` for each step.
- Each step has title, description, and status (pending/active/completed).
- Visual progress bar or step indicator.
- Keyboard navigable.
- `React.lazy` wrapper.

**Acceptance criteria:**
- Steps render with correct visual states.
- Progress indicator reflects step statuses.
- Accessible step navigation.

---

### P2-08: Implement `ui:table` component

**Labels:** `phase:beta`, `pkg:components`
**Blocked by:** P2-01, P2-02, P2-04
**Blocks:** P2-13

**Scope:**
- Render data tables from schema-validated payloads.
- Sortable columns: click header to toggle ascending/descending.
- Filterable: text filter input per column (or global).
- Aggregation: sum/avg/count/min/max footer row.
- Semantic HTML: `<table>`, `<thead>`, `<tbody>`, `<tfoot>`.
- Keyboard: cell navigation with arrow keys.
- `React.lazy` wrapper.

**Acceptance criteria:**
- Tables render with correct data.
- Sorting, filtering, and aggregation work interactively.
- ARIA sort indicators on headers.
- Keyboard cell navigation.

---

### P2-09: Implement `ui:graph` component

**Labels:** `phase:beta`, `pkg:components`
**Blocked by:** P2-01, P2-02, P2-04
**Blocks:** P2-13

**Scope:**
- Render DAGs, flowcharts, mind maps, and force-directed graphs.
- D3.js for SVG rendering and interaction.
- Dagre for hierarchical (top-down, left-right) layout.
- D3-force for force-directed layout.
- Node rendering: label, optional type icon, configurable style.
- Edge rendering: directed arrows, optional labels.
- Interactions: hover highlights connected nodes, click selects node.
- Keyboard: arrow keys traverse nodes, Enter selects.
- Screen reader: hidden data table fallback with node/edge list.
- `React.lazy` wrapper (D3 + Dagre loaded here).

**Acceptance criteria:**
- All 4 graph types (dag, flowchart, mindmap, force) render correctly.
- Dagre layout produces proper hierarchical positioning.
- Interactive: hover and click work.
- Accessible: keyboard traversal and screen reader fallback.

---

### P2-10: Implement `ui:relation` component

**Labels:** `phase:beta`, `pkg:components`
**Blocked by:** P2-09 (shares relational abstraction)
**Blocks:** P2-13

**Scope:**
- Entity-relationship diagrams built on the shared `RelationalModel` (RFC Section 8.1).
- Constrains graph schema: nodes must have entity types, edges have cardinality.
- ER-specific rendering: entity boxes with attributes, relationship diamonds/labels.
- Cardinality labels on edges (1:1, 1:N, M:N).
- Reuses D3 + Dagre from `ui:graph`.
- `React.lazy` wrapper.

**Acceptance criteria:**
- ER diagrams render with entities, relationships, and cardinality.
- Layout is clean and readable.
- Shares rendering infrastructure with `ui:graph`.

---

### P2-11: Implement `ui:chart` component

**Labels:** `phase:beta`, `pkg:components`
**Blocked by:** P2-01, P2-02, P2-04
**Blocks:** P2-13

**Scope:**
- Line, bar, area, and OHLC chart types.
- D3.js for rendering (scales, axes, data bindings).
- Configurable axes, labels, legends.
- Hover tooltip showing data values.
- Responsive: chart resizes with container.
- Screen reader: hidden data table fallback.
- `React.lazy` wrapper.

**Acceptance criteria:**
- All 4 chart types render correctly.
- Tooltips show on hover.
- Charts resize responsively.
- Accessible fallback table.

---

### P2-12: Implement `ui:timeline` component

**Labels:** `phase:beta`, `pkg:components`
**Blocked by:** P2-01, P2-02, P2-04
**Blocks:** P2-13

**Scope:**
- Event sequences on a vertical or horizontal timeline.
- Each event: date/time, title, description.
- D3.js for layout and optional zoom/pan.
- Visual connectors between events.
- Keyboard navigable (arrow keys between events).
- `React.lazy` wrapper.

**Acceptance criteria:**
- Timeline renders events in chronological order.
- Both vertical and horizontal orientations work.
- Keyboard navigation between events.

---

### P2-13: Set up Storybook with stories for all components

**Labels:** `phase:beta`, `testing`, `pkg:components`
**Blocked by:** P2-05, P2-06, P2-07, P2-08, P2-09, P2-10, P2-11, P2-12

**Scope:**
- Initialize Storybook in `packages/components`.
- Add `@storybook/addon-a11y` for accessibility checks.
- Create stories for each component:
  - **Callout**: info, warning, error, tip variants.
  - **Tabs**: 2 tabs, 5 tabs, nested content.
  - **Steps**: 3 steps, in-progress state, completed state.
  - **Table**: basic, sortable, filterable, with aggregation, large dataset (100+ rows).
  - **Graph**: DAG, flowchart, mindmap, force-directed, large graph (50+ nodes).
  - **Relation**: simple ER, complex ER with multiple entities.
  - **Chart**: line, bar, area, OHLC, multi-series.
  - **Timeline**: few events, many events, horizontal.
- Each story uses realistic data payloads.

**Acceptance criteria:**
- Storybook builds as a static site (`build-storybook`).
- All stories render without errors.
- Accessibility addon reports no critical violations.

---

### P2-14: React Testing Library tests for `@glyphjs/runtime`

**Labels:** `phase:beta`, `testing`, `pkg:runtime`
**Blocked by:** P2-01, P2-02, P2-03, P2-04

**Scope:**
- Component registry tests: register, lookup, duplicate detection, dependency validation.
- Theming tests: light/dark switch, custom theme override, CSS variable presence.
- Layout tests: document/dashboard/presentation modes render correct structure.
- Error boundary tests: component throw renders fallback, `onDiagnostic` fires.
- Unknown type tests: unregistered `ui:` type renders placeholder.
- Base renderer tests: each standard Markdown block type renders correct HTML.

**Acceptance criteria:**
- All runtime logic paths have test coverage.
- Tests run without a browser (jsdom).

---

### P2-15: Set up Playwright and visual regression tests

**Labels:** `phase:beta`, `testing`, `pkg:components`
**Blocked by:** P2-13

**Scope:**
- Add Playwright to the monorepo.
- Configure Playwright to run against Storybook static build.
- Visual regression tests: screenshot each story, save baselines.
- Interaction tests:
  - Table: click header to sort, verify row order.
  - Tabs: click tab, verify panel switch.
  - Graph: hover node, verify highlight.
  - Chart: hover data point, verify tooltip.
  - Timeline: keyboard navigate between events.
- Update CI workflow to build Storybook then run Playwright.

**Acceptance criteria:**
- Playwright captures baselines for all stories.
- Interaction tests pass.
- CI runs Playwright on every PR.

---

### P2-16: Demo app — Markdown file to interactive UI

**Labels:** `phase:beta`, `infra`
**Blocked by:** P2-01, P2-05 through P2-12

**Scope:**
- Create `apps/demo` — minimal Vite + React app.
- Loads a sample Glyph Markdown file.
- Runs the full pipeline: parse → compile → render.
- Displays the rendered interactive UI.
- Serves as a manual integration test and development tool.

**Acceptance criteria:**
- `pnpm --filter demo dev` starts a local dev server.
- A sample Markdown file with multiple `ui:` blocks renders correctly.

---

## Phase 3: Polish (v1.0)

### Milestone: `v1.0`

Goal: Production-ready release. Animation, cross-references, documentation site, playground, CI/CD for publishing.

---

### P3-01: Animation orchestration

**Labels:** `phase:v1`, `pkg:runtime`, `pkg:components`
**Blocked by:** P2-01, P2-09, P2-11, P2-12

**Scope:**
- Define animation API for block state transitions.
- Implement `prefers-reduced-motion` respect (RFC Section 17.1).
- Graph: animate node/edge additions and removals (D3 transitions).
- Chart: animate data updates (interpolated transitions).
- Timeline: smooth scroll/zoom animations.
- Layout: animate block reordering.

---

### P3-02: Cross-block references and navigation

**Labels:** `phase:v1`, `pkg:runtime`
**Blocked by:** P2-01, P2-04

**Scope:**
- Implement `onNavigate(ref: Reference)` handler.
- Scroll-to-block: smooth scroll to target block on reference click.
- Focus management: move focus to target block with `aria-live` announcement (RFC Section 17.1).
- Visual highlight on target block after navigation.
- Back-navigation support (browser history or internal stack).
- Wire `outgoingRefs` and `incomingRefs` into component props.

---

### P3-03: Error diagnostics with source-mapped locations

**Labels:** `phase:v1`, `pkg:compiler`, `pkg:runtime`
**Blocked by:** P1-07, P2-01

**Scope:**
- Compiler: ensure all diagnostics include accurate `SourcePosition` pointing to the source Markdown.
- Runtime: when rendering a block with diagnostics, display an error overlay with:
  - Severity icon (error/warning/info).
  - Message text.
  - Source location (`line:column`).
  - For schema errors: Zod error path (e.g. "nodes[2].label is required").
- Dev mode: click diagnostic to copy source location.

---

### P3-04: End-to-end pipeline tests (Playwright)

**Labels:** `phase:v1`, `testing`
**Blocked by:** P2-15, P2-16

**Scope:**
- Create `packages/e2e/` with Playwright tests.
- Fixtures: `.md` files with various component combinations.
- Tests:
  - Full pipeline: Markdown string → rendered DOM (assert block structure).
  - Graph rendering: assert SVG nodes/edges are present.
  - Table interaction: sort and filter through the pipeline.
  - Error rendering: invalid Markdown still renders partial UI.
  - Mixed document: standard Markdown + multiple `ui:` blocks.
- Runs against `apps/demo` or a dedicated test Vite app.

---

### P3-05: CI pipeline finalization

**Labels:** `phase:v1`, `infra`
**Blocked by:** P1-13, P2-15, P3-04

**Scope:**
- Finalize `.github/workflows/ci.yml`:
  - Typecheck → Lint → Build → Unit tests (Vitest) → Build Storybook → Visual/interaction tests (Playwright) → E2E tests (Playwright).
  - Turborepo remote caching.
  - Artifact upload for Playwright failure screenshots.
- Add branch protection rules for `main`: require CI pass.

---

### P3-06: Documentation site — Astro Starlight setup

**Labels:** `phase:v1`, `app:docs`
**Blocked by:** P1-01
**Blocks:** P3-07, P3-08, P3-09, P3-10, P3-11

**Scope:**
- Initialize `apps/docs` with Astro Starlight.
- Configure Astro React integration for embedding Glyph components as islands.
- Set up sidebar navigation matching RFC Section 13.3 site structure.
- Landing page with project overview, hero demo, install snippet.
- Configure built-in Starlight search.

---

### P3-07: Docs — Getting Started guide

**Labels:** `phase:v1`, `app:docs`
**Blocked by:** P3-06

**Scope:**
- Installation instructions (pnpm/npm/yarn).
- "First Document" tutorial: write a Markdown file with a `ui:graph`, compile it, render it.
- Quick tutorial covering the core workflow.

---

### P3-08: Docs — Authoring Guide

**Labels:** `phase:v1`, `app:docs`
**Blocked by:** P3-06

**Scope:**
- Complete Markdown syntax reference.
- YAML payload format and conventions.
- Fenced block reference for all `ui:` types.
- Tips for LLM-friendly authoring.

---

### P3-09: Docs — Component Reference (8 pages with live examples)

**Labels:** `phase:v1`, `app:docs`
**Blocked by:** P3-06, P3-12 (playground/editor component for live examples)

**Scope:**
- One page per component: graph, table, chart, relation, timeline, callout, tabs, steps.
- Each page: description, full YAML schema reference, 3+ live editable examples.
- Live examples use CodeMirror editor + Glyph runtime as Astro React islands.
- Example fixture files in `apps/docs/examples/`.

---

### P3-10: Docs — IR Spec, Plugin API, and Theming pages

**Labels:** `phase:v1`, `app:docs`
**Blocked by:** P3-06

**Scope:**
- IR Spec page: JSON structure, block types, references, versioning, patch format.
- Plugin API page: `GlyphComponentDefinition`, `GlyphComponentProps`, registration, theming contract.
- Theming page: CSS variable reference, custom themes, light/dark, `prefers-color-scheme`.

---

### P3-11: Docs — Gallery

**Labels:** `phase:v1`, `app:docs`
**Blocked by:** P3-06, P3-09

**Scope:**
- 5+ gallery entries with real-world examples:
  - System architecture documentation.
  - ML pipeline visualization.
  - Financial model (OHLC charts + tables).
  - Interactive onboarding guide (steps + tabs + callouts).
  - LLM-assisted design review (graphs + callouts).
- Each entry: rendered Glyph UI + "View Source" toggle.

---

### P3-12: Playground — CodeMirror split-pane editor

**Labels:** `phase:v1`, `app:docs`
**Blocked by:** P3-06, P2-01 (runtime)

**Scope:**
- `/playground` page in `apps/docs`.
- Left pane: CodeMirror 6 editor with:
  - Markdown syntax highlighting.
  - Custom highlighting for `ui:` fenced blocks and YAML.
  - Autocomplete for component types.
  - Real-time validation diagnostics (red underlines).
- Right pane: live Glyph rendering (full pipeline in-browser).
- Toolbar: theme toggle, share via URL hash, export IR JSON, preset selector.
- Debounced re-compilation on keystroke.

---

### P3-13: GitHub Pages deployment workflow

**Labels:** `phase:v1`, `infra`, `app:docs`
**Blocked by:** P3-06

**Scope:**
- `.github/workflows/docs.yml` as specified in RFC Section 13.7.
- Build `apps/docs` and deploy to `gh-pages` branch.
- Trigger on push to `main`.

---

### P3-14: npm publish pipeline

**Labels:** `phase:v1`, `infra`
**Blocked by:** P1-01

**Scope:**
- Changesets or manual versioning strategy.
- `.github/workflows/publish.yml`:
  - Trigger on version tags or changeset merge.
  - Build all packages.
  - Publish to npm with `--access public`.
  - Scoped under `@glyphjs/`.
- `CHANGELOG.md` generation.

---

### P3-15: MCP tool interface specification

**Labels:** `phase:v1`, `pkg:types`
**Blocked by:** P1-03

**Scope:**
- Define MCP tool interfaces in `@glyphjs/types` (RFC Section 11.2).
- Type definitions only (no server implementation).
- Input/output types for all 9 MCP tools.
- Session model types.
- Export from `@glyphjs/types/mcp`.

---

---

## Phase 4: Live Sessions (v2.0 — Future)

Issues for Phase 4 are listed here for completeness but should not be created until v1.0 ships.

### P4-01: MCP server implementation
### P4-02: Whiteboard mode with real-time IR patching
### P4-03: Bidirectional Markdown ↔ IR normalization
### P4-04: Collaborative multi-user sessions
### P4-05: Export to PDF/Slides
### P4-06: Domain-specific component packs

---

## Dependency Graph Summary

```
P1-01 (monorepo init)
  └─ P1-02 (tsup builds)
       └─ P1-03 (types) ──────────────────────────────────────────────┐
            ├─ P1-04 (schemas) ───────────────────────┐               │
            │    ├─ P1-06 (parser) ──┐                 │               │
            │    │    └─ P1-07 (compiler) ─────────────┤               │
            │    └─ P1-10 (schema tests)               │               │
            ├─ P1-05 (ir) ───────────────────┐         │               │
            │    └─ P1-12 (ir prop tests)    │         │               │
            └─ P1-08 (vitest infra) ─────────┤         │               │
                 ├─ P1-09 (parser tests)     │         │               │
                 ├─ P1-10 (schema tests)     │         │               │
                 ├─ P1-11 (compiler tests)   │         │               │
                 ├─ P1-12 (ir prop tests)    │         │               │
                 └─ P1-13 (CI)               │         │               │
                                             │         │               │
P2-01 (runtime core) ◄──────────────────────┘─────────┘───────────────┘
  ├─ P2-02 (theming)
  ├─ P2-03 (layout)
  ├─ P2-04 (plugin system)
  │    ├─ P2-05 (callout)  ─┐
  │    ├─ P2-06 (tabs)      │
  │    ├─ P2-07 (steps)     │
  │    ├─ P2-08 (table)     ├─ P2-13 (storybook) ─ P2-15 (playwright)
  │    ├─ P2-09 (graph) ────┤
  │    │    └─ P2-10 (rel)  │
  │    ├─ P2-11 (chart)     │
  │    └─ P2-12 (timeline) ─┘
  ├─ P2-14 (runtime tests)
  └─ P2-16 (demo app)

P3-01 (animation)          P3-06 (docs site setup)
P3-02 (cross-refs)           ├─ P3-07 (getting started)
P3-03 (error diagnostics)    ├─ P3-08 (authoring guide)
P3-04 (e2e tests)            ├─ P3-09 (component ref)
P3-05 (CI final)             ├─ P3-10 (IR/plugin/theme docs)
P3-13 (GH pages deploy)      ├─ P3-11 (gallery)
P3-14 (npm publish)          └─ P3-12 (playground)
P3-15 (MCP types)
```

---

## Issue Count Summary

| Phase | Issues | Focus |
|---|---|---|
| Phase 1: Alpha | 13 | Monorepo, types, schemas, parser, compiler, IR, tests, CI |
| Phase 2: Beta | 16 | Runtime, theming, layout, plugins, 8 components, Storybook, Playwright, demo |
| Phase 3: v1.0 | 15 | Animation, refs, diagnostics, E2E tests, docs site, playground, gallery, publishing |
| Phase 4: v2.0 | 6 | MCP server, whiteboard, collaboration, export (future) |
| **Total** | **50** | |
