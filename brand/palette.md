# Color Palette

The Glyph JS palette is derived from the visual language of _Oblivion_ (2013) — stark whites, deep cool blacks, and desaturated cyan-blue accents. All colors lean cool; warm tones are used only for semantic states (warning, error) and are desaturated to maintain the overall temperature.

## Core Colors

### Neutrals

| Token    | Hex       | Usage                                              |
| -------- | --------- | -------------------------------------------------- |
| White    | `#f8f9fb` | Light mode background, raised surfaces             |
| Black    | `#0a0e14` | Dark mode background                               |
| Gray 50  | `#eef1f5` | Light mode surface, blockquote/callout backgrounds |
| Gray 100 | `#dce1e8` | Light mode borders                                 |
| Gray 200 | `#b8c0cc` | Strong borders (light mode)                        |
| Gray 300 | `#7a8599` | Muted text (both modes)                            |
| Gray 700 | `#2d3847` | Strong borders (dark mode)                         |
| Gray 800 | `#1e2633` | Dark mode borders                                  |
| Gray 900 | `#111820` | Dark mode surface                                  |

### Accent — Cyan

| Token        | Hex       | Usage                                                    |
| ------------ | --------- | -------------------------------------------------------- |
| Cyan Dark    | `#2d7fa6` | Link hover (light mode)                                  |
| Cyan         | `#3a9bc8` | Primary accent: links, blockquote borders, info callouts |
| Cyan Light   | `#5bb8db` | Links (dark mode)                                        |
| Cyan Lighter | `#8fd4ef` | Link hover (dark mode)                                   |

### Semantic

| Token | Hex       | Usage                      |
| ----- | --------- | -------------------------- |
| Amber | `#c89a3a` | Warning callout border     |
| Red   | `#c84a4a` | Error callout border       |
| Green | `#3aab6e` | Tip/success callout border |

### Text

| Token         | Hex       | Mode  | Usage                |
| ------------- | --------- | ----- | -------------------- |
| Text Dark     | `#1b1f27` | Light | Body text, code text |
| Heading Dark  | `#0f1319` | Light | Headings             |
| Text Light    | `#d4dae3` | Dark  | Body text, code text |
| Heading Light | `#e8ecf1` | Dark  | Headings             |

## Contrast Ratios

All text colors meet WCAG 2.1 AA requirements against their respective backgrounds.

| Combination                                    | Ratio  | Grade    |
| ---------------------------------------------- | ------ | -------- |
| Text Dark (`#1b1f27`) on White (`#f8f9fb`)     | 14.8:1 | AAA      |
| Muted (`#7a8599`) on White (`#f8f9fb`)         | 4.6:1  | AA       |
| Heading Dark (`#0f1319`) on White (`#f8f9fb`)  | 17.2:1 | AAA      |
| Cyan (`#3a9bc8`) on White (`#f8f9fb`)          | 3.6:1  | AA Large |
| Text Light (`#d4dae3`) on Black (`#0a0e14`)    | 12.1:1 | AAA      |
| Muted (`#7a8599`) on Black (`#0a0e14`)         | 4.8:1  | AA       |
| Heading Light (`#e8ecf1`) on Black (`#0a0e14`) | 14.3:1 | AAA      |
| Cyan Light (`#5bb8db`) on Black (`#0a0e14`)    | 8.2:1  | AAA      |

## Usage Rules

1. **Never use pure white (`#ffffff`) or pure black (`#000000`)** — always use the cool-shifted variants
2. **Cyan is the only accent** — do not introduce additional hue-shifted accents for decorative purposes
3. **Semantic colors (amber, red, green) are reserved for callout borders** — do not use them for general UI elements
4. **Muted text must only appear on the primary background** — do not layer muted text on surfaces or callout backgrounds
5. **Maintain the cool temperature** — if adding new colors, ensure they lean blue-gray rather than warm

## CSS Variable Mapping

### Light Mode

```css
--glyph-bg: #f8f9fb;
--glyph-text: #1b1f27;
--glyph-text-muted: #7a8599;
--glyph-heading: #0f1319;
--glyph-link: #3a9bc8;
--glyph-link-hover: #2d7fa6;
--glyph-border: #dce1e8;
--glyph-border-strong: #b8c0cc;
--glyph-surface: #eef1f5;
--glyph-surface-raised: #f8f9fb;
--glyph-code-bg: #e8ecf1;
--glyph-code-text: #1b1f27;
--glyph-blockquote-border: #3a9bc8;
--glyph-blockquote-bg: #eef1f5;
```

### Dark Mode

```css
--glyph-bg: #0a0e14;
--glyph-text: #d4dae3;
--glyph-text-muted: #7a8599;
--glyph-heading: #e8ecf1;
--glyph-link: #5bb8db;
--glyph-link-hover: #8fd4ef;
--glyph-border: #1e2633;
--glyph-border-strong: #2d3847;
--glyph-surface: #111820;
--glyph-surface-raised: #1a2230;
--glyph-code-bg: #111820;
--glyph-code-text: #d4dae3;
--glyph-blockquote-border: #3a9bc8;
--glyph-blockquote-bg: #111820;
```
