# RFC-019: Rating

- **Status:** Implemented
- **Priority:** P1
- **Complexity:** S
- **Block type:** `ui:rating`

---

## 1. Summary

Multi-item star/number rating scale. Each item can be rated independently, and the full rating state is emitted on every change.

## 2. Motivation

Rating scales are essential for gathering evaluative feedback. LLMs can use structured rating data to prioritize recommendations or understand sentiment across multiple dimensions.

## 3. Schema

```yaml
title: 'Rate these features'
scale: 5
mode: star
labels: { low: 'Poor', high: 'Excellent' }
items:
  - label: Performance
    description: 'Response time and throughput'
  - label: Security
  - label: Developer Experience
```

## 4. Visual design

- Star mode: clickable star icons with hover state.
- Number mode: numbered buttons in a row.
- Scale labels displayed below the star/number row.
- Item descriptions in muted text below labels.

## 5. Accessibility

- Each item uses `role="radiogroup"` with individual `role="radio"` per value.
- Arrow keys change rating within a group.
- `aria-live="polite"` announces changes.

## 6. Implementation notes

- Theme vars: `--glyph-rating-star-fill`, `--glyph-rating-star-empty`, `--glyph-rating-hover`.
- Hover state tracked per item to show preview fill.
- Event payload includes `allRatings` snapshot.
