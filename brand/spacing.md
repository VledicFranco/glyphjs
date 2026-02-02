# Spacing & Border Radius

The Glyph JS spacing system follows a deliberate, constrained scale. Border radii are minimal — angular shapes are a defining characteristic of the Oblivion aesthetic.

## Spacing Scale

The spacing scale uses a base of `0.25rem` (4px) with a doubling progression.

| Token                | Value   | Pixels | Usage                                  |
| -------------------- | ------- | ------ | -------------------------------------- |
| `--glyph-spacing-xs` | 0.25rem | 4px    | Inline gaps, icon padding              |
| `--glyph-spacing-sm` | 0.5rem  | 8px    | Tight element spacing, cell padding    |
| `--glyph-spacing-md` | 1rem    | 16px   | Standard content spacing, card padding |
| `--glyph-spacing-lg` | 1.5rem  | 24px   | Section spacing, group margins         |
| `--glyph-spacing-xl` | 2rem    | 32px   | Major section breaks, page margins     |

## Spacing Rules

1. **Use the scale** — do not use arbitrary spacing values. All spacing should map to a scale token.
2. **Vertical rhythm matters** — maintain consistent vertical spacing between block elements. Use `--glyph-spacing-md` as the baseline between paragraphs and similar blocks.
3. **Tighter is better** — when in doubt, use the smaller spacing value. Dense, information-rich layouts are preferred over airy ones.
4. **Margins collapse, padding doesn't** — prefer `margin-bottom` for vertical element spacing and `padding` for internal container spacing.

## Border Radius

Border radii are intentionally tight, producing angular, geometric shapes rather than rounded ones.

| Token               | Value     | Pixels | Usage                     |
| ------------------- | --------- | ------ | ------------------------- |
| `--glyph-radius-sm` | 0.125rem  | 2px    | Inline code, small badges |
| `--glyph-radius-md` | 0.1875rem | 3px    | Buttons, inputs, cards    |
| `--glyph-radius-lg` | 0.25rem   | 4px    | Modals, large containers  |

### Radius Rules

1. **Never use fully rounded corners** (`border-radius: 50%` or `9999px`) for rectangular UI elements
2. **Pill shapes are not used** — buttons and tags use `--glyph-radius-md`
3. **Circles are acceptable only for avatars and status indicators**
4. **0px radius is acceptable** for table cells, dividers, and full-width elements

## Borders

Borders follow the Oblivion principle of thin, precise lines.

| Property      | Value                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------- |
| Width         | 1px (standard), 2px (emphasis only)                                                         |
| Style         | `solid` only — no dashed, dotted, or double borders                                         |
| Color (light) | `--glyph-border` (`#dce1e8`) for standard, `--glyph-border-strong` (`#b8c0cc`) for emphasis |
| Color (dark)  | `--glyph-border` (`#1e2633`) for standard, `--glyph-border-strong` (`#2d3847`) for emphasis |

### Border Rules

1. **1px is the default** — 2px borders are reserved for focus rings and active states
2. **Borders are structural, not decorative** — use them to delineate regions, not to add visual interest
3. **No box shadows** — surface hierarchy is achieved through background color shifts, not elevation shadows
4. **Accent-colored borders** (`--glyph-link`) are reserved for blockquotes and callout left-edges
