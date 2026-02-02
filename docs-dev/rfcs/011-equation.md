# RFC-011: Equation

- **Status:** Draft
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P9
- **Complexity:** M
- **Block type:** `ui:equation`

---

## 1. Summary

A mathematical equation renderer that takes LaTeX notation and renders publication-quality math, with optional step-by-step derivations.

## 2. Motivation

LLMs are increasingly used for math tutoring, scientific explanation, and technical documentation. LaTeX-formatted math in a code block is unreadable to most humans. A rendered equation component bridges this gap, displaying fractions, integrals, matrices, and symbols as properly typeset math.

## 3. Schema

### Single equation

````yaml
```ui:equation
expression: "E = mc^2"
label: Mass-energy equivalence
````

````

### Multi-step derivation

```yaml
```ui:equation
steps:
  - expression: "\\int_0^1 x^2 \\, dx"
    annotation: Evaluate the definite integral
  - expression: "= \\left[ \\frac{x^3}{3} \\right]_0^1"
    annotation: Apply the power rule
  - expression: "= \\frac{1}{3} - 0 = \\frac{1}{3}"
    annotation: Substitute bounds
````

````

### Zod schema

```typescript
const equationSchema = z.object({
  expression: z.string().optional(),
  label: z.string().optional(),
  steps: z.array(z.object({
    expression: z.string(),
    annotation: z.string().optional(),
  })).optional(),
}).refine(
  (data) => data.expression || (data.steps && data.steps.length > 0),
  { message: 'Either expression or steps must be provided' },
);
````

## 4. Visual design

### Single equation

- Centered display equation with rendered math.
- Optional label below in muted text.
- Numbered if part of a sequence (auto-increment within the document — stretch goal).

### Derivation steps

- Each step on its own line, aligned by the `=` sign.
- Optional annotations to the right of each step in muted, smaller text.
- Vertical connecting line or subtle background to group the derivation.

### Styling

- Math rendered in the standard Computer Modern / Latin Modern style (KaTeX default).
- Text colors follow theme: `--glyph-text` for math, `--glyph-text-muted` for annotations.
- Background: transparent (inherits from container).

## 5. Accessibility

- Rendered math includes `aria-label` with the original LaTeX expression (screen readers can parse simple math notation).
- For derivations, each step is a list item with the expression and annotation combined.
- MathML output (KaTeX supports this) provides native screen-reader math semantics.

## 6. Implementation notes

- **Rendering engine**: KaTeX is the clear choice — it's fast (no DOM manipulation), produces static HTML/CSS, supports MathML output, and is ~120KB gzipped. This is the largest dependency in the roadmap and the main reason for M complexity.
- KaTeX should be loaded dynamically (`import()`) to avoid bloating the base bundle. The component shows a formatted code fallback until KaTeX loads.
- The `expression` field uses standard LaTeX math notation. Backslashes need escaping in YAML (`\\frac` instead of `\frac`), but most LLMs handle this correctly.
- For the derivation layout, use a CSS grid or flex column with alignment on the `=` operator.
- Consider bundling only the KaTeX CSS + fonts needed for the most common math symbols, not the full set.
