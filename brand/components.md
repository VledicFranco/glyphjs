# Component Styling Guidelines

Styling guidelines for Glyph JS components, following the Oblivion design language.

## Callouts

Callouts use a left-border accent with a tinted background. The border is 2px wide using the semantic color; the background is a very subtle tint of that color.

| Variant | Border    | Background (Light) | Background (Dark) |
| ------- | --------- | ------------------ | ----------------- |
| Info    | `#3a9bc8` | `#e8f4fa`          | `#0e1a26`         |
| Warning | `#c89a3a` | `#faf4e8`          | `#1a1608`         |
| Error   | `#c84a4a` | `#faeaea`          | `#1f0e0e`         |
| Tip     | `#3aab6e` | `#e8f5ee`          | `#0e1f12`         |

### Callout Rules

- Left border only (2px), no top/right/bottom border
- Border radius: `--glyph-radius-md` on right side only
- Padding: `--glyph-spacing-md`
- Text color inherits from body text, not the accent color
- Icons are optional and use the border color

## Blockquotes

- Left border: 2px solid `--glyph-blockquote-border` (cyan accent)
- Background: `--glyph-blockquote-bg` (surface color)
- Padding: `--glyph-spacing-md`
- Text: Body text color, italic
- No border radius

## Tables

- Header row: `--glyph-surface` background, `font-weight: 600`
- Borders: 1px `--glyph-border` between all cells
- Cell padding: `--glyph-spacing-sm` horizontal, `--glyph-spacing-xs` vertical
- No alternating row colors — use borders for row distinction
- Border radius: `--glyph-radius-md` on outer corners only

### Table Data

Numeric data in tables should use `font-variant-numeric: tabular-nums` and right-align. Text data left-aligns.

## Code Blocks

- Background: `--glyph-code-bg`
- Text: `--glyph-code-text`
- Font: `--glyph-font-mono`
- Padding: `--glyph-spacing-md`
- Border: 1px `--glyph-border`
- Border radius: `--glyph-radius-md`
- Line numbers: muted text color, right-aligned, separated by a 1px border

### Inline Code

- Background: `--glyph-code-bg`
- Padding: 0.125em 0.25em
- Border radius: `--glyph-radius-sm`
- Font size: 0.875em (relative to parent)

## Charts & Graphs

- Primary data series: `--glyph-link` (cyan)
- Grid lines: `--glyph-border` at 0.5 opacity
- Axis labels: `--glyph-text-muted`, monospace
- Data labels: `--glyph-text`, regular weight
- Background: transparent (inherits from container)

### Multi-series Colors

When multiple data series are needed, derive from the cyan accent:

| Series | Color     | Description  |
| ------ | --------- | ------------ |
| 1      | `#3a9bc8` | Primary cyan |
| 2      | `#2d7fa6` | Dark cyan    |
| 3      | `#5bb8db` | Light cyan   |
| 4      | `#7a8599` | Muted gray   |

Avoid using semantic colors (amber, red, green) for chart series unless the data has semantic meaning (e.g., profit/loss).

## Links

- Color: `--glyph-link`
- Hover: `--glyph-link-hover`
- No underline by default; underline on hover
- No visited state color change
- Focus: 2px outline using `--glyph-link` with 2px offset

## Focus States

- Outline: 2px solid `--glyph-link` (cyan accent)
- Outline offset: 2px
- No box shadow focus rings
- Consistent across all interactive elements
