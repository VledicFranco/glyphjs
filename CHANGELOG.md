# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial monorepo setup with 7 packages
- 8 UI components: Callout, Tabs, Steps, Table, Graph, Relation, Chart, Timeline
- Compiler pipeline: markdown → AST → IR → React components
- Zod-based schema validation for all components
- Theming system with light/dark modes
- Animation, navigation, and diagnostics systems
- SSR support
- Storybook stories for all components
- Astro/Starlight documentation site
- Playground for live editing
- GitHub Actions CI/CD (lint, test, e2e, a11y, bundle size, docs deploy, npm publish)
