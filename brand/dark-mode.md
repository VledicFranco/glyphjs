# Dark Mode Strategy

The Glyph JS dark mode inverts the luminance hierarchy while preserving the cool temperature and cyan accent identity of the Oblivion design system.

## Core Principle

Dark mode is not a simple inversion. Instead, it maps each light-mode color to a dark-mode counterpart that maintains the same semantic role and relative contrast relationships.

## Color Mapping

### Backgrounds & Surfaces

| Role       | Light     | Dark      | Rule                                            |
| ---------- | --------- | --------- | ----------------------------------------------- |
| Background | `#f8f9fb` | `#0a0e14` | Luminance inversion, cool temperature preserved |
| Surface    | `#eef1f5` | `#111820` | Slightly lighter than background                |
| Raised     | `#f8f9fb` | `#1a2230` | Distinct from surface                           |

In light mode, surfaces are darker than the background. In dark mode, surfaces are lighter than the background. The raised surface provides a third layer for elevated elements.

### Text

| Role    | Light     | Dark      | Rule                                 |
| ------- | --------- | --------- | ------------------------------------ |
| Body    | `#1b1f27` | `#d4dae3` | Not pure white — preserves cool tone |
| Muted   | `#7a8599` | `#7a8599` | Same value in both modes             |
| Heading | `#0f1319` | `#e8ecf1` | Maximum contrast for headings        |

Muted text uses the same hex value in both modes. This is intentional — `#7a8599` has sufficient contrast against both the light background (4.6:1) and the dark background (4.8:1).

### Accents

| Role              | Light     | Dark      | Rule                                                 |
| ----------------- | --------- | --------- | ---------------------------------------------------- |
| Link              | `#3a9bc8` | `#5bb8db` | Lighter cyan needed for dark backgrounds             |
| Link hover        | `#2d7fa6` | `#8fd4ef` | Direction reverses: darker on light, lighter on dark |
| Blockquote border | `#3a9bc8` | `#3a9bc8` | Same — sufficient contrast in both modes             |

### Borders

| Role     | Light     | Dark      | Rule                           |
| -------- | --------- | --------- | ------------------------------ |
| Standard | `#dce1e8` | `#1e2633` | Subtle, low-contrast separator |
| Strong   | `#b8c0cc` | `#2d3847` | More visible separator         |

### Callouts

Callout backgrounds in dark mode are very deep tints of the accent color. The border colors remain the same in both modes.

| Variant | Light BG  | Dark BG   | Border (both) |
| ------- | --------- | --------- | ------------- |
| Info    | `#e8f4fa` | `#0e1a26` | `#3a9bc8`     |
| Warning | `#faf4e8` | `#1a1608` | `#c89a3a`     |
| Error   | `#faeaea` | `#1f0e0e` | `#c84a4a`     |
| Tip     | `#e8f5ee` | `#0e1f12` | `#3aab6e`     |

## Contrast Requirements

All text/background combinations must meet WCAG 2.1 AA:

- **Body text:** minimum 4.5:1 contrast ratio
- **Heading text:** minimum 4.5:1 contrast ratio
- **Muted text:** minimum 4.5:1 contrast ratio
- **Link text:** minimum 3:1 contrast ratio (underlined links) or 4.5:1 (non-underlined)

## Transition

When switching between modes, apply CSS transitions to background and color properties:

```css
transition:
  background-color 0.2s ease,
  color 0.2s ease,
  border-color 0.2s ease;
```

Do not transition `box-shadow` (we don't use shadows) or `opacity`.

## Implementation

Mode-independent values (spacing, font stacks, border radii) are identical in both themes. Only color values change between modes. This is enforced by the `GlyphTheme` type — both themes must provide the same set of CSS variable keys.

## Rules

1. **Never use `prefers-color-scheme` media queries directly** — theme selection is managed by the runtime, not CSS
2. **Do not add mode-specific spacing or layout** — only colors change between modes
3. **Test both modes** — every component must be visually verified in both light and dark modes
4. **Preserve relative contrast** — if element A is more prominent than element B in light mode, it must remain more prominent in dark mode
