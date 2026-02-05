# RFC-020: Ranker

- **Status:** Implemented
- **Priority:** P1
- **Complexity:** M
- **Block type:** `ui:ranker`

---

## 1. Summary

Drag-to-reorder list for ranking preferences. Pure DOM implementation with keyboard-first accessibility.

## 2. Motivation

Ranking captures ordinal preferences that are difficult to express through other input types. LLMs can use ranked lists to understand priority ordering for planning and recommendations.

## 3. Schema

```yaml
title: 'Rank by importance'
items:
  - id: auth
    label: Authentication
    description: 'User login and session management'
  - id: dashboard
    label: Dashboard
  - id: api
    label: API Layer
```

## 4. Visual design

- Numbered rank badges on the left.
- Grip handle icon for drag affordance.
- Grabbed item highlighted with accent outline.
- Smooth reorder animation on move.

## 5. Accessibility

- `role="listbox"` container, `role="option"` items.
- Keyboard: Space to grab, Arrow Up/Down to move, Escape to cancel, Space to drop.
- `aria-live="assertive"` during drag to announce position.

## 6. Implementation notes

- Pure DOM keyboard reorder — no drag-and-drop library.
- Event payload includes full `orderedItems` array and `movedItem` diff.
