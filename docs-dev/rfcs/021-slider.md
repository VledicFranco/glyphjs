# RFC-021: Slider

- **Status:** Implemented
- **Priority:** P1
- **Complexity:** M
- **Block type:** `ui:slider`

---

## 1. Summary

Multi-parameter slider panel for trade-off exploration. Each parameter has its own range input with configurable min, max, step, and unit.

## 2. Motivation

Sliders enable continuous parameter exploration, useful for configuring preferences, adjusting trade-offs, and setting thresholds. LLMs can present multiple parameters for users to tune simultaneously.

## 3. Schema

```yaml
title: 'Configure preferences'
layout: vertical
parameters:
  - id: performance
    label: Performance
    min: 0
    max: 100
    step: 5
    value: 50
    unit: '%'
  - id: cost
    label: Budget
    min: 0
    max: 10000
    step: 100
    unit: '$'
```

## 4. Visual design

- Each parameter shown with label, current value, and range input.
- Min/max labels below the slider track.
- Value display uses accent color and tabular numbers.

## 5. Accessibility

- Native `<input type="range">` with `aria-valuemin/max/now/text`.
- Arrow keys for step increments, Home/End for min/max.
- Labels associated via `htmlFor`/`id`.

## 6. Implementation notes

- Theme vars: `--glyph-slider-track`, `--glyph-slider-fill`, `--glyph-slider-thumb`.
- Uses CSS `accent-color` for native range styling.
- Event payload includes `allValues` snapshot.
