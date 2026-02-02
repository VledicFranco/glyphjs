# Glyph JS Brand

Design system and visual language for Glyph JS, inspired by the interface design of _Oblivion_ (2013, dir. Joseph Kosinski, UI design by GMUNK).

## Design Principles

- **Stark contrast** — Near-white backgrounds with sharp dark text; near-black dark mode with bright cool text
- **Cool temperature** — Desaturated cyan-blue as the primary accent; no warm tones
- **Geometric precision** — Angular shapes, thin 1-2px borders, minimal border-radius (2-4px)
- **Functional minimalism** — Every element serves a purpose; no decorative flourishes
- **Layered transparency** — Surfaces distinguished by subtle opacity shifts rather than heavy shadows
- **Monospaced data** — Technical data in monospace; UI text in geometric sans-serif

## File Index

| File                             | Description                                                      |
| -------------------------------- | ---------------------------------------------------------------- |
| [palette.md](./palette.md)       | Full color palette with hex values, contrast ratios, usage rules |
| [typography.md](./typography.md) | Font stacks, size scale, weight usage, line heights              |
| [spacing.md](./spacing.md)       | Spacing scale philosophy, border-radius rules                    |
| [components.md](./components.md) | Component-specific styling guidelines                            |
| [logo-usage.md](./logo-usage.md) | Logo specifications, clear space, minimum sizes, misuse examples |
| [dark-mode.md](./dark-mode.md)   | Dark mode strategy, color mapping rules, contrast requirements   |

## Quick Reference

### Primary Accent

`#3a9bc8` — Desaturated cyan-blue, drawn from the Skytower interface panels and drone HUD overlays.

### Backgrounds

| Mode  | Background | Surface   | Raised    |
| ----- | ---------- | --------- | --------- |
| Light | `#f8f9fb`  | `#eef1f5` | `#f8f9fb` |
| Dark  | `#0a0e14`  | `#111820` | `#1a2230` |

### Text

| Mode  | Body      | Muted     | Heading   |
| ----- | --------- | --------- | --------- |
| Light | `#1b1f27` | `#7a8599` | `#0f1319` |
| Dark  | `#d4dae3` | `#7a8599` | `#e8ecf1` |

## Package

The `@glyphjs/brand` package (`packages/brand/`) exports SVG logos and palette constants for programmatic use. See [logo-usage.md](./logo-usage.md) for visual specifications.
