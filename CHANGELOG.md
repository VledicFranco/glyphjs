# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Markdown support in component text fields**: Enable inline markdown formatting (bold, italic, links, code, strikethrough) in component text fields by setting `markdown: true` in component YAML or using the `parseComponentMarkdown` compiler option. Supports 17 components including Callout, Card, Accordion, Steps, Timeline, Quiz, Poll, and more. (#74)
- `RichText` component in `@glyphjs/runtime` for rendering `string | InlineNode[]` union types
- `parseInlineMarkdown()` utility function in compiler for parsing markdown strings to InlineNode arrays
- Compiler option `parseComponentMarkdown` to enable markdown parsing globally for all components

### Changed

- Component data TypeScript interfaces now support `string | InlineNode[]` union types for text fields, enabling both plain strings and formatted content
- All 17 interactive component schemas now include optional `markdown: boolean` field (defaults to `false` for backward compatibility)

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
