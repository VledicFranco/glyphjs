# RFC-004: CodeDiff

- **Status:** Implemented
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P2
- **Complexity:** M
- **Block type:** `ui:codediff`

---

## 1. Summary

A unified code diff component with syntax highlighting, line numbers, and addition/deletion markers. Designed for the most common LLM use case: explaining code changes.

## 2. Motivation

Nearly every coding conversation with an LLM involves "change this code to that code." Today, LLMs show before/after in separate code blocks, requiring the reader to mentally diff them. A CodeDiff component highlights exactly what changed, reducing cognitive load dramatically.

## 3. Schema

````yaml
```ui:codediff
language: typescript
before: |
  function greet(name: string) {
    console.log("Hello " + name);
  }
after: |
  function greet(name: string): string {
    return `Hello, ${name}!`;
  }
````

````

### Zod schema

```typescript
const codediffSchema = z.object({
  language: z.string().optional(),
  before: z.string(),
  after: z.string(),
  beforeLabel: z.string().optional(),
  afterLabel: z.string().optional(),
});
````

## 4. Visual design

- Unified diff layout: single pane with additions in green, deletions in red. (Side-by-side view is a stretch goal for v2.)
- Line numbers in a gutter column.
- Addition lines: green background (`--glyph-codediff-add-bg`), `+` gutter marker.
- Deletion lines: red background (`--glyph-codediff-del-bg`), `-` gutter marker.
- Unchanged context lines: default background.
- Optional labels above the diff (e.g., "Before" / "After" or file names).
- Monospace font via `--glyph-font-mono`.
- Horizontal scroll for long lines; no wrapping by default.

### Diff computation

Use a line-based Myers' diff algorithm. This is the standard diff algorithm (used by `git diff`) and can be implemented in ~100 lines with no external dependencies. It produces minimal edit scripts (fewest insertions + deletions), which yields clean, readable diffs. The diff is computed client-side from the `before` and `after` strings.

## 5. Accessibility

- Rendered as a `<table>` with `role="grid"`. Each row is a diff line, with columns for: gutter marker, line number(s), and code content.
- Each row has `aria-label` indicating its status: "added", "removed", or "unchanged".
- Color is supplemented by `+`/`-` text markers in the gutter.
- Screen reader announcement: "Code diff: X lines added, Y lines removed."

## 6. Implementation notes

- Syntax highlighting: use a lightweight tokenizer or CSS class-based approach. Avoid heavy dependencies like Prism or Shiki at runtime — consider a simple keyword highlighter scoped to the most common languages (JS/TS, Python, Rust, Go, HTML, CSS, JSON, YAML, Bash).
- The diff algorithm should handle insertions, deletions, and modifications (a modified line = deletion + insertion).
- Custom CSS variables: `--glyph-codediff-add-bg`, `--glyph-codediff-add-color`, `--glyph-codediff-del-bg`, `--glyph-codediff-del-color`, `--glyph-codediff-gutter-bg`.
- Add both light and dark values to `preview.ts` theme maps.
