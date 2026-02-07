# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2026-02-07

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
