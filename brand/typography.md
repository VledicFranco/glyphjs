# Typography

Typography in Glyph JS follows the Oblivion principle of geometric precision. Body and heading text use a geometric sans-serif; technical data and code use a monospace stack.

## Font Stacks

### Body & Headings

```css
--glyph-font-body: 'Inter', 'Helvetica Neue', system-ui, sans-serif;
--glyph-font-heading: 'Inter', 'Helvetica Neue', system-ui, sans-serif;
```

Inter is the primary typeface — a geometric sans-serif designed for screen readability. Helvetica Neue serves as the first fallback, maintaining the geometric character. System-ui provides the final fallback.

Headings use the same family but at heavier weights, creating hierarchy through weight contrast rather than typeface changes.

### Monospace

```css
--glyph-font-mono: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
```

Code blocks, inline code, and technical data displays use the monospace stack. Cascadia Code and Fira Code are preferred for their legibility and ligature support.

## Size Scale

The type scale uses a 1.25 ratio (Major Third) anchored at 1rem (16px).

| Level | Size     | Weight | Line Height | Usage                    |
| ----- | -------- | ------ | ----------- | ------------------------ |
| `h1`  | 2.441rem | 700    | 1.2         | Page titles              |
| `h2`  | 1.953rem | 700    | 1.25        | Section headings         |
| `h3`  | 1.563rem | 600    | 1.3         | Subsection headings      |
| `h4`  | 1.25rem  | 600    | 1.35        | Minor headings           |
| `h5`  | 1rem     | 600    | 1.4         | Label headings           |
| `h6`  | 0.875rem | 600    | 1.4         | Small label headings     |
| Body  | 1rem     | 400    | 1.6         | Paragraphs, lists        |
| Small | 0.875rem | 400    | 1.5         | Captions, metadata       |
| Code  | 0.875rem | 400    | 1.6         | Inline code, code blocks |

## Weight Usage

| Weight   | Value | Usage                                 |
| -------- | ----- | ------------------------------------- |
| Regular  | 400   | Body text, code, descriptions         |
| Medium   | 500   | Emphasized inline text, table headers |
| Semibold | 600   | h3-h6 headings, labels                |
| Bold     | 700   | h1-h2 headings                        |

Do not use weights lighter than 400 (Regular). The Oblivion aesthetic favors thin strokes, but at body sizes, lighter weights reduce readability.

## Line Heights

- **Headings (h1-h2):** 1.2-1.25 — Tight line height for visual density
- **Subheadings (h3-h6):** 1.3-1.4 — Slightly more open
- **Body text:** 1.6 — Generous line height for readability in long-form content
- **Code blocks:** 1.6 — Matching body text for visual harmony

## Letter Spacing

| Element         | Letter Spacing |
| --------------- | -------------- |
| h1-h2           | -0.02em        |
| h3-h6           | -0.01em        |
| Body            | 0 (normal)     |
| Code            | 0 (normal)     |
| All-caps labels | 0.05em         |

Headings use slight negative tracking to increase visual density, consistent with the Oblivion interface style where headings appear tightly composed.

## Rules

1. **Never use decorative or script typefaces** — maintain the geometric, functional character
2. **Do not mix sans-serif families** within a single document
3. **Monospace is reserved for code and data** — do not use monospace for UI labels or navigation
4. **Heading hierarchy must be sequential** — do not skip heading levels
5. **All-caps is acceptable only for short labels** (2-3 words maximum), always with increased letter spacing
