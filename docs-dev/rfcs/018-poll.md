# RFC-018: Poll

- **Status:** Implemented
- **Priority:** P1
- **Complexity:** S
- **Block type:** `ui:poll`

---

## 1. Summary

Multi-option voting component with visual result bars. Supports single-select (radio) and multi-select (checkbox) modes.

## 2. Motivation

Polling is a fundamental interaction primitive for gathering preferences from users. LLMs can use poll results to understand user preferences before generating recommendations.

## 3. Schema

```yaml
question: 'Which framework do you prefer?'
options: [React, Vue, Angular, Svelte]
multiple: false
showResults: true
title: 'Framework Poll'
```

## 4. Visual design

- Question text displayed prominently above options.
- Options rendered as labeled radio buttons or checkboxes.
- Vote button triggers state change.
- Result bars show percentage with animated fill using CSS custom properties.

## 5. Accessibility

- `role="group"` on option container.
- Radio/checkbox inputs with proper labels.
- `role="progressbar"` on result bars with `aria-valuenow`.
- `aria-live="polite"` on results region.

## 6. Implementation notes

- Theme vars: `--glyph-poll-bar-bg`, `--glyph-poll-bar-fill`.
- Single-vote model — no server-side aggregation.
- Options disabled after voting to prevent double-submission.
