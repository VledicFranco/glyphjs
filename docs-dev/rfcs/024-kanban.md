# RFC-024: Kanban

- **Status:** Implemented
- **Priority:** P1
- **Complexity:** L
- **Block type:** `ui:kanban`

---

## 1. Summary

Column-based card board with keyboard-driven movement between columns. Supports priority indicators, descriptions, tags, and WIP limits.

## 2. Motivation

Kanban boards are the standard project management visualization. LLMs can present task breakdowns as interactive boards where users can reprioritize and reorganize work items.

## 3. Schema

```yaml
title: 'Sprint Board'
columns:
  - id: todo
    title: To Do
    cards:
      - id: auth
        title: Implement Auth
        description: 'OAuth2 + JWT tokens'
        priority: high
        tags: [backend, security]
  - id: progress
    title: In Progress
    limit: 3
  - id: done
    title: Done
```

## 4. Visual design

- Horizontal column layout with flexible widths.
- Cards with title, description, priority border, and tags.
- Priority indicated by left border color (high=red, medium=amber, low=green).
- Column headers show card count and optional WIP limit.
- Grabbed card highlighted with shadow and accent outline.

## 5. Accessibility

- Columns as `role="listbox"`, cards as `role="option"`.
- Keyboard: Space to grab, Arrow Left/Right between columns, Up/Down within column, Escape to cancel.
- `aria-live="assertive"` announces grab/move state.

## 6. Implementation notes

- Pure DOM keyboard navigation — no DnD library.
- Theme vars: `--glyph-kanban-column-bg`, `--glyph-kanban-card-bg`, `--glyph-kanban-card-border`, `--glyph-kanban-drag-shadow`, `--glyph-kanban-priority-high/medium/low`.
- Event payload includes full `allColumns` state snapshot.
