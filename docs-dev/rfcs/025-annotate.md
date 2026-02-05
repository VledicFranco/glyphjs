# RFC-025: Annotate

- **Status:** Implemented
- **Priority:** P1
- **Complexity:** L
- **Block type:** `ui:annotate`

---

## 1. Summary

Text annotation component with highlight ranges, colored labels, and a sidebar listing all annotations. Users create annotations by selecting text and choosing a label.

## 2. Motivation

Text annotation enables structured feedback on code, prose, or any textual content. LLMs can present text for review and collect fine-grained feedback with precise character-level references.

## 3. Schema

```yaml
title: 'Code Review'
labels:
  - name: Bug
    color: '#dc2626'
  - name: Unclear
    color: '#f59e0b'
  - name: Good
    color: '#16a34a'
text: |
  function processData(input) {
    var result = input.split(',');
    eval(result[0]);
    return result;
  }
annotations:
  - start: 68
    end: 84
    label: Bug
    note: 'eval() is dangerous'
```

## 4. Visual design

- Text area with monospace font and pre-wrapped content.
- Annotations rendered as `<mark>` elements with label-colored backgrounds.
- Label picker appears as floating menu on text selection.
- Sidebar lists all annotations with color indicators and text excerpts.

## 5. Accessibility

- `role="document"` on text area.
- Annotations use `<mark>` elements with title attributes.
- Label picker uses `role="menu"` with `role="menuitem"` buttons.
- Sidebar uses `role="complementary"` with `role="list"` for annotation items.

## 6. Implementation notes

- `window.getSelection()` for detecting text selection.
- `computeSegments()` helper for splitting text into annotated/unannotated segments.
- Theme vars: `--glyph-annotate-highlight-opacity`, `--glyph-annotate-label-bg`, `--glyph-annotate-sidebar-bg`.
- Event payload includes full `allAnnotations` state snapshot.
