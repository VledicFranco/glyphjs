---
title: Recursive Layout Demo — ui:columns + ui:rows
description: Nested ui:columns and ui:rows to build complex 2D layouts from simple primitives.
---

# Recursive Layout Demo

`ui:columns` splits horizontally. `ui:rows` splits vertically. Nest them to build
any layout — no CSS Grid strings required.

---

## Basic Vertical Stack

`ui:rows` alone stacks blocks top-to-bottom with a configurable gap.

```ui:callout=_topNote
type: info
title: Phase 1 — Discovery
content: User interviews, competitive analysis, and problem framing. Due March 14.
```

```ui:callout=_midNote
type: tip
title: Phase 2 — Design
content: Wireframes, prototypes, and design review with stakeholders. Due March 28.
```

```ui:callout=_bottomNote
type: warning
title: Phase 3 — Build
content: Engineering sprint begins April 1. Dependency on design sign-off.
```

```ui:rows
gap: 0.75rem
children: [topNote, midNote, bottomNote]
```

---

## The Classic Split

The layout from the plan — a left block alongside a right column split into two.

```
+----------+----------+
|          |  top     |
|  left    +----------+
|          |  bottom  |
+----------+----------+
```

```ui:kpi=_leftMetrics
title: Q1 Pipeline
metrics:
  - label: Deals Open
    value: "84"
    trend: up
    sentiment: positive
  - label: Avg Deal Size
    value: $42K
    trend: up
    sentiment: positive
  - label: Win Rate
    value: "34%"
    trend: flat
    sentiment: neutral
  - label: Forecast
    value: $3.5M
    trend: up
    sentiment: positive
columns: 2
```

```ui:callout=_rightTop
type: tip
title: New Logos This Week
content: "Acme Corp (Enterprise, $120K ARR), Dune Systems (Mid-Market, $28K ARR). Two more in legal review."
```

```ui:callout=_rightBottom
type: warning
title: At-risk Deals
content: "3 deals past 90-day mark without a next step. SDR follow-up scheduled for Thursday."
```

```ui:rows=_rightCol
gap: 1rem
children: [rightTop, rightBottom]
```

```ui:columns
ratio: [3, 2]
gap: 1.5rem
children: [leftMetrics, rightCol]
```

---

## Four-Quadrant Dashboard

Two columns, each with two rows — a 2×2 grid built from four primitives.

```ui:kpi=_q1
metrics:
  - label: MRR
    value: $182K
    trend: up
    sentiment: positive
  - label: Growth
    value: "+8.4%"
    trend: up
    sentiment: positive
columns: 2
```

```ui:callout=_q2
type: info
title: Infrastructure
content: "All services nominal. Planned maintenance window Mar 16, 02:00–04:00 UTC."
```

```ui:callout=_q3
type: tip
title: Top Feature Request
content: "Export to PDF — 142 upvotes. Shipped in v2.4. Second: SSO integration (89 upvotes)."
```

```ui:kpi=_q4
metrics:
  - label: NPS
    value: "67"
    trend: up
    sentiment: positive
  - label: CSAT
    value: "4.6/5"
    trend: up
    sentiment: positive
columns: 2
```

```ui:rows=_leftHalf
ratio: [1, 1]
gap: 1rem
children: [q1, q3]
```

```ui:rows=_rightHalf
ratio: [1, 1]
gap: 1rem
children: [q2, q4]
```

```ui:columns
ratio: [1, 1]
gap: 1.5rem
children: [leftHalf, rightHalf]
```

---

## Deep Nesting

Three levels: columns > rows > columns.

```ui:callout=_a
type: info
title: A
content: Top-left cell.
```

```ui:callout=_b
type: tip
title: B
content: Top-right of the right column.
```

```ui:callout=_c1
type: warning
title: C — Left
content: Bottom-right, left sub-column.
```

```ui:callout=_c2
type: error
title: C — Right
content: Bottom-right, right sub-column.
```

```ui:columns=_bottomRight
ratio: [1, 1]
gap: 0.75rem
children: [c1, c2]
```

```ui:rows=_rightStack
gap: 1rem
children: [b, bottomRight]
```

```ui:columns
ratio: [1, 1]
gap: 1.5rem
children: [a, rightStack]
```
