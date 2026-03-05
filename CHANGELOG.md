# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Named bundled themes for CLI**: `--theme <name>` on `render`, `export`, and `serve` now resolves to a bundled YAML theme shipped with the CLI. Pass `--theme one-dark`, `--theme github-light`, `--theme nord`, etc. directly — no file path needed. `--theme-file` still takes precedence if both flags are supplied.
- **`glyphjs themes` command**: Lists all bundled themes available for the `--theme` flag and prints usage examples.

### Fixed

- **DOMPurify SSR crash**: `GlyphRawHtml` now checks for `DOMPurify.sanitize` availability before calling it. HTML comments in a document no longer crash `glyphjs serve` under Node.js SSR.
- **Relation accessibility table**: Attribute `name` and relationship `label` fields (`string | InlineNode[]`) were rendered as `[object Object]` in the hidden screen-reader table. They are now converted via `inlineToText()`.
- **warmcraft theme**: Added `--glyph-palette-color-1..10` overrides with warm earthy tones so charts and graph nodes render in warmcraft colours instead of the default teal/purple palette.

## [0.8.0] - 2026-03-03

### Added

- **Two-tier theme system**: Reduced required CSS variables from ~155 to 53 semantic tokens (`GlyphThemeVarKey`). Component-specific variables are now optional CSS-only overrides that cascade from the Tier 1 tokens via built-in fallback chains — no TypeScript required. Breaking for theme authors: drop the ~100 removed component-specific vars and add the 4 new `--glyph-color-*` state vars.
- **Semantic state tokens**: `--glyph-color-success`, `--glyph-color-warning`, `--glyph-color-error`, `--glyph-color-info` — a universal palette for state-bearing components (KPI, Kanban, Steps, Comparison, Quiz, Callout, Form).
- **Shared palette**: `--glyph-palette-color-1..10` replaces the old `--glyph-chart-color-N` and `--glyph-timeline-color-N` variables. One palette drives charts, timelines, infographics, architecture diagrams, and graph groups.
- **`--glyph-radius-xs`**: Extra-small border radius token (0.25rem).
- **Obsidian plugin** (`@glyphjs/obsidian-plugin`): Renders all 29 `ui:*` component types natively in Obsidian notes (Reading View + Live Preview). Automatically maps Obsidian theme CSS vars to GlyphJS Tier 1 tokens. Includes a Settings tab with debug logging. Distributable via BRAT.
- **`glyphjs lint` command**: Validates `ui:` blocks in a Markdown file and reports diagnostics. Supports `--format json` for structured output suitable for LLM tool loops, `--strict` to promote warnings to errors, and `--quiet` for exit-code-only use in scripts. Exit 0 = clean, 1 = errors, 2 = unreadable input.
- **`glyphjs schemas` command**: Outputs JSON Schema for any component type. Use `glyphjs schemas chart` for a single type, `--all` to dump all 28 schemas as a JSON object, or `--list` to enumerate available types. Enables LLM-assisted authoring and offline schema validation.
- **E2E test coverage expansion**: Full Playwright test coverage for Obsidian plugin Live Preview, lint command edge cases, and schema validation flows.

### Changed

- `GlyphThemeVars` type now contains exactly 53 required keys (was ~155). Custom themes must be updated.
- `--glyph-chart-color-1..10` renamed to `--glyph-palette-color-1..10`.
- Dynamic CSS var templates in Kpi, Callout, Comparison, and Kanban components replaced with static color maps keyed by sentiment/type. The old vars remain valid CSS overrides; TypeScript no longer requires them.

### Removed

- ~100 component-specific CSS variables removed from `GlyphThemeVarKey` (still work as optional CSS overrides): all `--glyph-callout-*-bg/border`, `--glyph-kanban-*`, `--glyph-steps-*`, `--glyph-kpi-*`, `--glyph-comparison-*`, `--glyph-chart-bullish/bearish`, `--glyph-timeline-*`, `--glyph-relation-*`, `--glyph-infographic-*`, `--glyph-table-*`, `--glyph-poll-*`, `--glyph-rating-star-empty/hover`, `--glyph-slider-*`, `--glyph-annotate-*`, `--glyph-form-error`, `--glyph-grid`, `--glyph-edge-color`, `--glyph-node-*`, `--glyph-icon-*`, `--glyph-blockquote-*`, `--glyph-codediff-gutter-bg`.
- Dropped entirely (no longer valid CSS overrides): `--glyph-shadow-glow`, `--glyph-text-shadow`, `--glyph-backdrop`, `--glyph-gradient-accent`.

## [0.7.1] - 2026-02-15

## [0.6.0] - 2026-02-07

### Added

- **Interaction modes for Architecture component**: Added zoom/pan interaction modes (modifier-key, click-to-activate, always) to Architecture component, completing the interaction modes feature across all diagram components
- `interactionMode` and `showZoomControls` schema fields for Architecture component
- Interactive overlay and zoom controls for Architecture diagrams
- Storybook stories demonstrating all three interaction modes for Architecture

### Changed

- All 4 diagram components (Graph, Flowchart, Relation, Architecture) now support consistent zoom/pan interaction modes with the same API

## [0.5.1] - 2026-02-07

### Fixed

- TypeScript compilation error with xmlns attribute in ForeignObjectText component

## [0.5.0] - 2026-02-07

### Added

- **Extended markdown support to 10 additional components**: Tabs, Kanban, Table, Chart, Equation, CodeDiff (standard components) and Graph, Relation, Flowchart, Sequence (diagram components)
- Total components with markdown support increased from 17 to 27 (68% coverage)
- `measureText` utility for dynamic text measurement in SVG diagrams
- `ForeignObjectText` component for rendering rich text in SVG contexts using foreignObject
- `inlineToText` utility for converting InlineNode[] to plain strings for SVG text elements
- Markdown support in diagram node labels, edges, and titles
- Dynamic node sizing in graph layouts based on label content
- Storybook examples demonstrating markdown in Tabs, Graph, Flowchart, and Sequence components

### Changed

- Graph, Relation, Flowchart, and Sequence components now support `string | InlineNode[]` union types for labels
- Chart component now supports markdown in axis labels and series names
- Table component now supports markdown in column labels
- Updated component documentation to reflect 27 components with markdown support

## [0.4.0] - 2026-02-06

### Added

- **Markdown support in component text fields**: Enable inline markdown formatting (bold, italic, links, code, strikethrough) in component text fields by setting `markdown: true` in component YAML or using the `parseComponentMarkdown` compiler option. Supports 17 components including Callout, Card, Accordion, Steps, Timeline, Quiz, Poll, and more. (#74)
- `RichText` component in `@glyphjs/runtime` for rendering `string | InlineNode[]` union types
- `parseInlineMarkdown()` utility function in compiler for parsing markdown strings to InlineNode arrays
- Compiler option `parseComponentMarkdown` to enable markdown parsing globally for all components
- **Configurable interaction modes for graph visualizations**: Add three interaction modes to prevent accidental zooming when scrolling past graphs: `modifier-key` (Alt+scroll to zoom), `click-to-activate` (click to enable zoom/pan), and `always` (traditional behavior). Includes button-driven zoom controls (+/-/reset) for all visualization components (Graph, Flowchart, Relation)
- `useZoomInteraction` hook for managing D3 zoom behavior with mode-specific filters
- `InteractionOverlay` component for visual feedback (tooltips, activation prompts)
- `ZoomControls` component with accessible button-driven zoom controls
- E2E tests for all interaction modes and zoom controls (30 tests total)

### Changed

- Component data TypeScript interfaces now support `string | InlineNode[]` union types for text fields, enabling both plain strings and formatted content
- All 17 interactive component schemas now include optional `markdown: boolean` field (defaults to `false` for backward compatibility)
- **BREAKING**: Default `interactionMode` for Graph, Flowchart, and Relation components changed from `'always'` to `'modifier-key'`. To restore old behavior, set `interactionMode: 'always'` in component data. See `docs-dev/MIGRATION-v0.4.md` for migration guide

## [0.1.0] - 2026-02-02

### Added

- Initial monorepo setup with 8 packages
- 8 UI components: Callout, Tabs, Steps, Table, Graph, Relation, Chart, Timeline
- Architecture component for interactive architecture diagrams
- Compiler pipeline: markdown → AST → IR → React components
- Zod-based schema validation for all components
- Theming system with light/dark modes
- Animation, navigation, and diagnostics systems
- SSR support
- Storybook stories for all components
- Astro/Starlight documentation site
- Playground for live editing
- GitHub Actions CI/CD (lint, test, e2e, a11y, bundle size, docs deploy, npm publish)
- Changesets for version management
