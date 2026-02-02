# CLAUDE.md

Project-specific instructions for Claude Code working on GlyphJS.

## Project overview

GlyphJS is a Markdown-to-interactive-UI rendering engine. Authors write Markdown with embedded `ui:` fenced code blocks (YAML data), and the pipeline compiles it to an IR that React renders as interactive components.

Pipeline: Markdown → Parser (remark) → AST → Compiler → IR (JSON) → Runtime (React) → UI

## Monorepo structure

pnpm workspaces with Turborepo. Two workspace roots: `packages/*` and `apps/*`.

### Packages (dependency order)

1. `@glyphjs/types` — Shared TypeScript types (IR, Block, Plugin, Runtime)
2. `@glyphjs/schemas` — Zod schemas for all UI components + registry
3. `@glyphjs/parser` — Remark plugin, parses `ui:*` code blocks from Markdown
4. `@glyphjs/ir` — IR utilities: validation, diffing, patching, migration
5. `@glyphjs/compiler` — End-to-end Markdown → IR compiler
6. `@glyphjs/runtime` — React rendering engine, theming, layout, plugin registry
7. `@glyphjs/components` — Built-in UI components (Callout, Chart, Graph, Relation, Table, Tabs, Steps, Timeline, Architecture)
8. `@glyphjs/brand` — Logo assets and palette constants

### Apps

- `apps/demo` — Vite demo app (port 5173)
- `apps/docs` — Astro/Starlight documentation site (port 4321)

## Key commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages (Turborepo)
pnpm test             # Unit tests (Vitest)
pnpm lint             # ESLint + Prettier check
pnpm typecheck        # TypeScript type check
pnpm size             # Bundle size check (size-limit)
npx playwright test   # E2E tests (auto-starts servers)
```

### Per-package commands

```bash
pnpm --filter @glyphjs/components test        # Unit tests for components
pnpm --filter @glyphjs/components storybook   # Storybook dev server (port 6006)
pnpm --filter @glyphjs/components build-storybook  # Static Storybook build
pnpm --filter @glyphjs/docs dev               # Docs dev server (port 4321)
pnpm --filter @glyphjs/docs build             # Docs production build
```

## Component theming convention

All components use CSS custom properties (`var(--glyph-*, fallback)`) for theming. Do NOT use `theme.isDark` or `theme.resolveVar()` — those are legacy patterns.

Theme variables are defined in:

- `packages/components/.storybook/preview.ts` — `LIGHT_THEME_VARS` and `DARK_THEME_VARS` maps
- Consumer apps set these variables on wrapper elements

When adding component-specific CSS variables, always add to BOTH theme maps to prevent dark-mode contrast issues.

## Adding new components

Follow the protocol in `docs-dev/component-lifecycle.md`. It covers all 6 phases:

1. Schema (Zod + registry)
2. Component + unit tests
3. Storybook stories + theme variables
4. Documentation + consumer registration
5. E2E tests
6. Validation checklist

A new component touches 9 new files and 8 modified files. See the file inventory in that document for the complete list.

## Testing stack

- **Unit**: Vitest + React Testing Library + jest-dom
- **E2E**: Playwright with 3 projects: `storybook` (port 6006), `demo` (port 5173), `docs` (port 4321)
- **Accessibility**: Storybook addon-a11y + axe-core
- **Helpers**: `createMockProps()` in `packages/components/src/__tests__/helpers.ts`, `mockProps()`/`mockBlock()` in `packages/components/src/__storybook__/data.ts`

## Dev documentation

Internal development documentation lives in `docs-dev/`:

- `docs-dev/component-lifecycle.md` — Protocol for adding new components
- `docs-dev/rfcs/` — Design RFCs
- `docs-dev/accessibility.md` — WCAG 2.1 AA compliance notes

## Code style

- TypeScript strict mode, no `any` (enforced by ESLint)
- ESLint + Prettier, enforced via lint-staged pre-commit hooks
- All imports use `.js` extensions (ESM)
- Commit messages: imperative mood, conventional-commit prefixes (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`)
