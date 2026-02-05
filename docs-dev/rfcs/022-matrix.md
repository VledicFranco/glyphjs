# RFC-022: Matrix

- **Status:** Implemented
- **Priority:** P1
- **Complexity:** M
- **Block type:** `ui:matrix`

---

## 1. Summary

Decision matrix for scoring options against weighted criteria. Computes weighted totals automatically and emits full state on each cell change.

## 2. Motivation

Decision matrices structure complex multi-criteria evaluations. LLMs can present structured decision frameworks where users score options, and the weighted totals provide actionable rankings.

## 3. Schema

```yaml
title: 'Framework Evaluation'
scale: 5
showTotals: true
columns:
  - id: perf
    label: Performance
    weight: 2
  - id: dx
    label: DX
    weight: 1.5
rows:
  - id: react
    label: React
  - id: vue
    label: Vue
```

## 4. Visual design

- Table layout with column headers showing criteria names and weights.
- Number inputs in each cell, clamped to 0–scale.
- Totals column on the right with weighted sums.
- Weight indicators shown as "×N" below column labels.

## 5. Accessibility

- `role="grid"` on the table.
- Cells are `<input type="number">` with `aria-label="Score for {row} on {column}"`.
- Row and column headers use proper `<th>` elements.

## 6. Implementation notes

- `computeWeightedTotals` helper extracts total computation.
- Values clamped to valid range on input.
- Event payload includes `allValues` map and `weightedTotals` array.
