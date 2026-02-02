# Contributing to Glyph JS

Thank you for your interest in contributing to Glyph JS!

## Development Setup

1. **Prerequisites:** Node.js >= 18, pnpm 9.x
2. **Clone and install:**
   ```bash
   git clone https://github.com/VledicFranco/glyphjs.git
   cd glyphjs
   pnpm install
   ```
3. **Build all packages:**
   ```bash
   pnpm build
   ```
4. **Run tests:**
   ```bash
   pnpm test
   ```

## Project Structure

```
packages/
  types/       Type definitions shared across all packages
  schemas/     Zod schemas for UI component validation
  parser/      Markdown → AST parser (remark plugin)
  ir/          Intermediate representation (IR) utilities
  compiler/    AST → IR compiler pipeline
  runtime/     React runtime (GlyphDocument, theming, layout)
  components/  8 UI components (Callout, Tabs, Steps, etc.)
apps/
  demo/        Vite demo application
  docs/        Astro/Starlight documentation site
```

## Making Changes

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `pnpm test`
4. Ensure types check: `pnpm typecheck`
5. Ensure linting passes: `pnpm lint`
6. Submit a pull request

## Code Style

- TypeScript strict mode is enforced
- ESLint + Prettier for formatting
- No `any` types (enforced by ESLint)
- Pre-commit hooks run lint-staged automatically

## Testing

- Unit tests: Vitest
- Component tests: React Testing Library
- E2E tests: Playwright
- Property-based tests: fast-check (IR package)
- Accessibility: jest-axe + axe-core

## Commit Messages

Use clear, descriptive commit messages. No specific format is enforced,
but prefer imperative mood (e.g., "Add feature" not "Added feature").
