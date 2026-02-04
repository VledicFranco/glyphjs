# RFC-007: Accordion

- **Status:** Implemented
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P5
- **Complexity:** S
- **Block type:** `ui:accordion`

---

## 1. Summary

A collapsible accordion component for progressive disclosure. Each section has a header that can be expanded or collapsed to reveal its content.

## 2. Motivation

LLM responses are often long. Tabs help with mutually exclusive views, but Accordion allows multiple sections to be open simultaneously and gives readers control over how much detail they want to see. This is the missing progressive-disclosure primitive — essential for FAQs, API references, detailed explanations with expandable depth, and any "here's the summary, click for details" pattern.

## 3. Schema

````yaml
```ui:accordion
sections:
  - title: What is GlyphJS?
    content: >
      GlyphJS is a Markdown-to-interactive-UI rendering engine.
      It compiles enhanced Markdown into React components.
  - title: How does theming work?
    content: >
      All components use CSS custom properties. Set variables
      on a wrapper element to change the theme.
  - title: Can I create custom components?
    content: >
      Yes. Create a Zod schema, a React component, and register
      it with the runtime via registerComponent().
defaultOpen:
  - 0
````

````

### Zod schema

```typescript
const accordionSchema = z.object({
  title: z.string().optional(),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
  })).min(1),
  defaultOpen: z.array(z.number()).optional(),
  multiple: z.boolean().default(true),
});
````

## 4. Visual design

- Each section is a row with a clickable header.
- Header shows title text and a chevron indicator (▸ collapsed, ▾ expanded).
- Expanding a section reveals the content below with a subtle slide-down transition.
- `multiple: true` (default) allows multiple sections open at once. `multiple: false` auto-collapses others (exclusive mode).
- `defaultOpen` specifies which sections start expanded (by 0-based index). Default: all collapsed.
- Sections separated by borders (`--glyph-border`).
- Header background: `--glyph-surface`, content background: transparent.

## 5. Accessibility

- Uses `<details>`/`<summary>` native HTML elements as the foundation, which provides built-in keyboard and screen-reader support.
- If `multiple: false` requires JavaScript to enforce exclusivity, layer that on top of the native elements.
- Each section header is focusable and toggled with Enter/Space.
- `aria-expanded` attribute on each header indicates current state.

## 6. Implementation notes

- Leverage native `<details>`/`<summary>` for maximum accessibility and zero-JS collapse behavior.
- For the `multiple: false` mode, add an `onToggle` handler that closes other sections.
- Transition: use CSS `transition` on `max-height` or the `::details-content` pseudo-element (where supported).
- This is one of the simplest components — no layout computation, no SVG, no graph. Pure DOM.
