# Glyph JS — QA Analysis

**Date:** 2026-02-01
**Scope:** Full monorepo (7 packages, 2 apps, CI/CD, docs, tests)
**Test suite:** 285 passing tests (252 existing + 33 QA tests added)

---

## Table of Contents

1. [Test Coverage](#1-test-coverage)
2. [Security](#2-security)
3. [Dead Code & Cleanup](#3-dead-code--cleanup)
4. [Design Patterns](#4-design-patterns)
5. [Project Maintainability](#5-project-maintainability)
6. [Documentation Gaps](#6-documentation-gaps)
7. [CI/CD Issues](#7-cicd-issues)
8. [Staged Implementation Plan](#8-staged-implementation-plan)

---

## 1. Test Coverage

### Current Numbers

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Statements | 68.96% | 70% | FAIL |
| Branches | 56.00% | 70% | FAIL |
| Functions | 68.12% | 70% | FAIL |
| Lines | 68.96% | 70% | FAIL |

### Well-Tested Packages

| Package | Stmts | Branches | Functions |
|---------|-------|----------|-----------|
| @glyphjs/schemas | 92–100% | 90%+ | 100% |
| @glyphjs/parser | 91% | 85% | 90% |
| @glyphjs/ir | 77–100% | 65–100% | 75–100% |

### 23 Completely Untested Files

**Runtime (14 files — the biggest gap):**
- `packages/runtime/src/animation/use-animate.ts` — animation hooks
- `packages/runtime/src/animation/transitions.ts` — transition system
- `packages/runtime/src/animation/spring.ts` — spring physics
- `packages/runtime/src/navigation/ref-navigator.ts` — cross-reference navigation
- `packages/runtime/src/navigation/scroll-to-block.ts` — scroll behavior
- `packages/runtime/src/diagnostics/DiagnosticsOverlay.tsx` — error overlay
- `packages/runtime/src/diagnostics/use-diagnostics.ts` — diagnostics hooks
- `packages/runtime/src/renderers/GlyphRawHtml.tsx` — raw HTML renderer (security-critical)
- `packages/runtime/src/renderers/GlyphCodeBlock.tsx` — code block renderer
- `packages/runtime/src/renderers/GlyphBlockquote.tsx` — blockquote renderer
- `packages/runtime/src/renderers/GlyphImage.tsx` — image renderer
- `packages/runtime/src/renderers/GlyphThematicBreak.tsx` — thematic break renderer
- `packages/runtime/src/renderers/FallbackRenderer.tsx` — fallback renderer
- `packages/runtime/src/context.tsx` — runtime context provider

**Components (1 file):**
- `packages/components/src/graph/layout.ts` — graph layout algorithms (force-directed, tree, radial)

**Compiler (8 files — only tested indirectly via golden files):**
- `packages/compiler/src/ast-to-ir.ts` — AST-to-IR transformation
- `packages/compiler/src/containers.ts` — container block compilation
- `packages/compiler/src/data.ts` — data extraction
- `packages/compiler/src/helpers.ts` — compiler helper functions
- `packages/compiler/src/inline.ts` — inline content processing
- `packages/compiler/src/layout.ts` — layout compilation
- `packages/compiler/src/references.ts` — reference resolution
- `packages/compiler/src/frontmatter.ts` — frontmatter processing

### Missing Test Categories

- **Error case / negative testing:** ~10% estimated coverage across the codebase. Most schemas only test valid inputs. Compiler tests don't cover malformed markdown, corrupt YAML, missing fields, or boundary conditions.
- **Integration tests between packages:** No tests verify the full `parse → compile → render` pipeline at the package boundary level (the new QA E2E tests cover this, but more coverage is needed).
- **Accessibility tests:** `jest-axe` is installed but only used in a single `a11y-scan` CI job referencing Storybook. No component-level a11y assertions in unit tests.
- **Performance / regression tests:** No benchmarks, no render-time regression tests.

---

## 2. Security

### HIGH — Regex-Based HTML Sanitizer

**File:** `packages/runtime/src/renderers/GlyphRawHtml.tsx:11-31`

The `sanitizeHtml()` function uses regex to strip dangerous HTML. Regex-based sanitization is known to be bypassable via:
- Nested/malformed tags: `<scr<script>ipt>alert(1)</script>`
- Attribute encoding: `<img src=x onerror&#61;alert(1)>`
- SVG/MathML namespace escapes
- Data URIs beyond `javascript:` (e.g., `data:text/html,...`)

**Recommendation:** Replace with a proven sanitization library (DOMPurify or sanitize-html). If bundle size is a concern, at minimum add tests for known bypass vectors.

### MEDIUM — No CSP Headers in Demo/Docs

Neither the demo app nor the docs site set Content-Security-Policy headers. Since `GlyphRawHtml` renders user-provided HTML, CSP would serve as a defense-in-depth layer.

### LOW — 22 Type Casts in Production Code

Found 22 occurrences of `as unknown as` / `as Record<` across 13 files (mostly in the compiler for untyped AST data). These bypass TypeScript's type system and could mask bugs. Most are justified (interfacing with untyped remark/unified AST nodes), but each is a potential source of runtime errors.

---

## 3. Dead Code & Cleanup

### DELETE — MCP Types (334 lines, never imported)

**File:** `packages/types/src/mcp.ts`

This file defines 334 lines of MCP tool input/output interfaces (`MCPSession`, `MCPCreateDocumentInput`, `MCPAddBlockInput`, etc.). These types are:
- Exported from `@glyphjs/types`
- **Never imported anywhere** in the monorepo
- No MCP server implementation exists

**Action:** Delete the file and remove its export from `packages/types/src/index.ts`. If MCP support is planned for the future, it can be re-added when an implementation exists.

### DELETE — Duplicate Crypto Shims

**Files:**
- `apps/demo/src/crypto-shim.ts`
- `apps/docs/src/crypto-shim.ts`

These are ~95% identical. Both polyfill `crypto.randomUUID` for environments that lack it.

**Action:** Extract to a shared utility (e.g., `packages/runtime/src/utils/crypto-shim.ts`) or inline where used. Delete duplicates.

### CONSOLIDATE — 7 Duplicate Vitest Configs

**Files:** `packages/{types,schemas,parser,ir,compiler}/vitest.config.ts`

Five packages share an identical config:
```ts
export default defineConfig({
  test: { globals: true, passWithNoTests: true },
});
```

Two others (`runtime`, `components`) add `environment: 'jsdom'`.

**Action:** Create a shared `vitest.shared.ts` at the repo root and extend it in each package. This reduces 7 config files to 1 shared + 2 overrides.

### REVIEW — `packages/components/src/__mocks__/data.ts`

This file provides `mockBlock()`, `mockLayout()`, `mockTheme()`, `mockProps()` helpers. It is **only imported by Storybook `.stories.tsx` files**, not by any test file. Tests use `packages/components/src/__tests__/helpers.js` instead.

**Action:** The `__mocks__` directory name is misleading since it isn't used by any test framework's auto-mocking. Consider renaming to `__storybook__/data.ts` or moving the helpers into Storybook's config.

---

## 4. Design Patterns

### Inconsistent Error Handling

- **Compiler:** Returns `diagnostics[]` array with severity levels — good pattern.
- **Runtime:** `ErrorBoundary` catches React render crashes — good.
- **Components:** Silently swallow bad data (e.g., Timeline renders epoch dates for unparseable strings, Graph renders empty SVG for bad node data). No diagnostics surfaced to the user.

**Recommendation:** Components should validate props against their Zod schema at render time (in development mode) and emit warnings to a diagnostics channel.

### Large Single-File Components with Oversized Functions

Three component files are disproportionately large, and contain critically long functions:

| File | Total Lines | Longest Function | Function Lines |
|------|-------------|-----------------|----------------|
| `Chart.tsx` | 541 | `useEffect` (lines 101–454) | **354 lines** |
| `Relation.tsx` | 530 | `renderGraph` (lines 83–420) | **337 lines** |
| `Timeline.tsx` | 332 | render body | ~180 lines |

These combine data transformation, layout computation, and rendering in a single file and function. This makes them nearly impossible to test in isolation, and a single change can break unrelated chart types.

**Recommendation:** Extract data transformation and layout logic into separate files (e.g., `chart/layout.ts`, `relation/layout.ts`). The existing `graph/layout.ts` pattern is a good model. Break the Chart `useEffect` into `renderLine()`, `renderArea()`, `renderBar()`, `renderOHLC()`, `renderLegend()`. Break the Relation `renderGraph` into `computeLayout()`, `renderEntities()`, `renderRelationships()`. Add an ESLint `max-lines-per-function` rule to prevent regression.

### No Memoization in Heavy Components

`Graph`, `Chart`, `Relation`, and `Timeline` recompute layout on every render. For large datasets, this will cause performance issues.

**Recommendation:** Wrap layout computation in `useMemo` with appropriate dependency arrays.

### Plugin System Unused

The plugin system (`packages/runtime/src/plugins/`) defines a `GlyphPlugin` interface and plugin registry but no built-in plugins exist and the system is untested.

**Recommendation:** Either write at least one reference plugin with tests, or remove the plugin system until it's needed.

### Accessibility Gaps in Components

The project has a WCAG 2.1 AA compliance document (`docs/accessibility.md`) and generally good a11y practices (aria-labels on SVGs, visually-hidden fallback tables, proper roles), but several gaps exist:

- **Graph component:** Missing explicit `aria-label` — relies on browser default for `<svg>`
- **Tabs component:** No screen-reader announcement when active tab changes (no `aria-live` region)
- **Timeline component:** Hidden table items missing `role="listitem"`
- **GlyphRawHtml:** No `aria-live` region warning for dynamically injected content

**Recommendation:** Add `eslint-plugin-jsx-a11y` to the main ESLint config (currently only in Storybook). Add component-level `jest-axe` assertions in unit tests.

### Inconsistent Error Handling Across Packages

Three different error patterns are used without a clear boundary:
- **Compiler:** Returns `diagnostics[]` array with severity levels (recoverable)
- **IR migrate:** `throw new Error()` for version mismatches (fatal)
- **Runtime:** React `ErrorBoundary` wraps individual blocks (render recovery)

The boundary between "throw" and "return diagnostic" is not documented. Components silently swallow bad data instead of surfacing diagnostics.

**Recommendation:** Document the error handling contract: throws for programmer errors (invalid API usage), diagnostics for user-authored content errors, ErrorBoundary for render failures. Add dev-mode warnings when components receive data that fails schema validation.

---

## 5. Project Maintainability

### Missing Pre-Commit Hooks

No `husky`, `lint-staged`, or equivalent pre-commit hook setup. Developers can commit code that fails linting or type-checking.

**Action:** Add `husky` + `lint-staged` to run `eslint --fix` and `tsc --noEmit` on staged files.

### Incomplete Bundle Size Tracking

`.size-limit.json` only tracks 4 of 7 packages:
- Tracked: `parser`, `compiler`, `ir`, `schemas`
- **Missing:** `runtime`, `components`, `types`

The `runtime` (49.86 KB ESM) and `components` packages are the largest shipped bundles and the most likely to regress.

**Action:** Add `runtime` and `components` to `.size-limit.json`.

### No Dependency Version Pinning Strategy

`package.json` uses caret ranges (`^`) for all dependencies. For a library, this is standard, but no lock file audit or dependabot config was found.

**Action:** Add a `.github/dependabot.yml` config for automated dependency updates.

### TypeScript Strictness Gap

`exactOptionalPropertyTypes: false` in root `tsconfig.json`. This allows `undefined` to be passed for optional properties that should require explicit omission. Not critical, but reduces type safety.

---

## 6. Documentation Gaps

### Missing Project Files

| File | Status | Impact |
|------|--------|--------|
| `LICENSE` | Missing | Cannot determine legal usage terms |
| `CHANGELOG.md` | Missing | No release history |
| `CONTRIBUTING.md` | Missing | No contributor guidelines |
| `ARCHITECTURE.md` | Missing | No high-level design overview |

### Docs Site Content Gaps

The docs site (Astro/Starlight) has good coverage of components but is missing:
- **Architecture/internals page:** How the compiler pipeline works, IR format, block lifecycle
- **Plugin authoring guide:** The plugin system exists but has no documentation
- **MCP integration guide:** Referenced in Timeline examples but no actual guide exists
- **Migration/upgrade guide:** No versioning strategy documented
- **Troubleshooting page:** Common errors, debugging tips

### Inline Documentation

- Schemas are well-documented with JSDoc.
- Compiler internals have minimal comments — the 13-step pipeline in `compile.ts` would benefit from architectural documentation.
- Component props are not documented beyond TypeScript types.

---

## 7. CI/CD Issues

### a11y-scan Job May Be Broken

**File:** `.github/workflows/ci.yml`

The `a11y-scan` job runs `pnpm storybook:build` then `pnpm storybook:axe`. This depends on Storybook being properly configured and the axe scan finding the built Storybook. If the Storybook build output path doesn't match what the axe scan expects, the job silently passes.

**Action:** Verify the a11y-scan job works by running it locally. Add a smoke test that fails if zero components are scanned.

### No Branch Protection Rules Documented

The CI runs on `push` and `pull_request` but there's no evidence of branch protection rules requiring CI to pass before merge.

### Missing Artifact Caching

The CI workflow installs dependencies in every job without caching `node_modules` or the pnpm store. This increases CI run time.

**Action:** Add pnpm store caching to CI.

---

## 8. Staged Implementation Plan

### Stage 1 — Critical Fixes (Security + Coverage Gate)

**Priority:** Must-fix before any release.

| # | Task | Files | Impact |
|---|------|-------|--------|
| 1.1 | Replace regex HTML sanitizer with DOMPurify | `runtime/src/renderers/GlyphRawHtml.tsx` | Security |
| 1.2 | Add unit tests for GlyphRawHtml (including bypass vectors) | `runtime/src/__tests__/GlyphRawHtml.test.tsx` | Security |
| 1.3 | Add tests for all untested renderers (CodeBlock, Blockquote, Image, ThematicBreak, Fallback) | `runtime/src/__tests__/renderers/` | Coverage |
| 1.4 | Add tests for context.tsx | `runtime/src/__tests__/context.test.tsx` | Coverage |
| 1.5 | Add negative/error-case tests for all 8 schemas | `packages/schemas/src/__tests__/` | Coverage |
| 1.6 | Add compiler edge-case tests (malformed YAML, missing fields, invalid block types) | `packages/compiler/src/__tests__/` | Coverage |

**Exit criteria:** Coverage thresholds pass (70% on all metrics). No known XSS bypass vectors.

> **Note:** Compiler tests currently only exercise `compile()` indirectly through golden files. Stage 1.6 should add direct unit tests for `ast-to-ir.ts`, `containers.ts`, `data.ts`, `helpers.ts`, `inline.ts`, `layout.ts`, `references.ts`, and `frontmatter.ts`.

### Stage 2 — Dead Code & Cleanup

**Priority:** Reduce maintenance burden.

| # | Task | Files | Impact |
|---|------|-------|--------|
| 2.1 | Delete `packages/types/src/mcp.ts` and remove export | `types/src/mcp.ts`, `types/src/index.ts` | -334 lines |
| 2.2 | Deduplicate crypto shims into shared utility | `apps/demo/src/crypto-shim.ts`, `apps/docs/src/crypto-shim.ts` | -1 file |
| 2.3 | Create shared vitest config, extend in packages | `vitest.shared.ts`, 7 package configs | -~50 lines |
| 2.4 | Rename `__mocks__/data.ts` to `__storybook__/data.ts` | `components/src/__mocks__/` | Clarity |
| 2.5 | Add runtime + components to `.size-limit.json` | `.size-limit.json` | Monitoring |

**Exit criteria:** No dead code. All configs consolidated.

### Stage 3 — Maintainability Tooling

**Priority:** Prevent regressions.

| # | Task | Files | Impact |
|---|------|-------|--------|
| 3.1 | Add husky + lint-staged (eslint + tsc on staged files) | `package.json`, `.husky/` | Quality gate |
| 3.2 | Add LICENSE file (choose license) | `LICENSE` | Legal |
| 3.3 | Add CHANGELOG.md (even if empty with structure) | `CHANGELOG.md` | Release tracking |
| 3.4 | Add CONTRIBUTING.md | `CONTRIBUTING.md` | Contributor onboarding |
| 3.5 | Add `.github/dependabot.yml` | `.github/dependabot.yml` | Dependency freshness |
| 3.6 | Add pnpm store caching to CI | `.github/workflows/ci.yml` | CI speed |
| 3.7 | Verify and fix a11y-scan CI job | `.github/workflows/ci.yml` | a11y |

**Exit criteria:** Pre-commit hooks prevent bad commits. Project has standard OSS files.

### Stage 4 — Design Pattern Improvements

**Priority:** Long-term code health.

| # | Task | Files | Impact |
|---|------|-------|--------|
| 4.1 | Extract Chart layout logic to `chart/layout.ts` | `components/src/chart/` | Testability |
| 4.2 | Extract Relation layout logic to `relation/layout.ts` | `components/src/relation/` | Testability |
| 4.3 | Add `useMemo` to heavy layout computations in Graph, Chart, Relation, Timeline | 4 component files | Performance |
| 4.4 | Add dev-mode schema validation warnings in component renders | `runtime/src/BlockRenderer.tsx` | DX |
| 4.5 | Write tests for animation system (use-animate, transitions, spring) | `runtime/src/__tests__/animation/` | Coverage |
| 4.6 | Write tests for navigation system (ref-navigator, scroll-to-block) | `runtime/src/__tests__/navigation/` | Coverage |
| 4.7 | Write tests for diagnostics system (overlay, hook) | `runtime/src/__tests__/diagnostics/` | Coverage |
| 4.8 | Write tests for graph/layout.ts | `components/src/graph/__tests__/layout.test.ts` | Coverage |
| 4.9 | Add `eslint-plugin-jsx-a11y` to main ESLint config | `eslint.config.mjs` | Accessibility |
| 4.10 | Add `max-lines-per-function` ESLint rule (limit: 200) | `eslint.config.mjs` | Code quality |
| 4.11 | Fix Graph missing `aria-label`, Tabs missing `aria-live` on tab switch | `graph/Graph.tsx`, `tabs/Tabs.tsx` | Accessibility |
| 4.12 | Add component-level `jest-axe` assertions to unit tests | `components/src/*/__tests__/` | Accessibility |
| 4.13 | Document error handling contract (throw vs diagnostic vs ErrorBoundary) | `ARCHITECTURE.md` or inline | Clarity |

**Exit criteria:** All source files have direct test coverage. No component file exceeds 300 lines. No function exceeds 200 lines. All components pass axe audits.

### Stage 5 — Documentation & Polish

**Priority:** User experience.

| # | Task | Files | Impact |
|---|------|-------|--------|
| 5.1 | Add Architecture docs page (compiler pipeline, IR format, block lifecycle) | `apps/docs/src/content/docs/` | DX |
| 5.2 | Add Plugin authoring guide | `apps/docs/src/content/docs/` | DX |
| 5.3 | Add Troubleshooting page | `apps/docs/src/content/docs/` | DX |
| 5.4 | Add JSDoc to compiler internals (compile.ts pipeline steps) | `packages/compiler/src/` | Maintainability |
| 5.5 | Remove or implement plugin system (decide: keep or cut) | `packages/runtime/src/plugins/` | Clarity |
| 5.6 | Enable `exactOptionalPropertyTypes: true` in tsconfig | `tsconfig.json` | Type safety |

**Exit criteria:** Complete docs coverage. All architectural decisions documented.
