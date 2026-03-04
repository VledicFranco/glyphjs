---
title: Panel Styles — Design Reference
description: Demonstrates all four ui:panel styles (card, bordered, elevated, ghost) wrapping real components.
---

# Panel Styles — Design Reference

`ui:panel` wraps any suppressed block variable in a styled container.
Four styles are available: `card`, `bordered`, `elevated`, and `ghost`.
All styles accept a custom `padding` value.

---

## Card (default)

The `card` style adds a subtle background, rounded corners, a thin border, and a
light drop shadow. Suitable for most dashboard widgets.

```ui:kpi=_revenueKpi
metrics:
  - label: Revenue
    value: $4.2M
    delta: "+18% YoY"
    trend: up
    sentiment: positive
  - label: Gross Margin
    value: "63.1%"
    trend: flat
    sentiment: neutral
  - label: ARR
    value: $50.4M
    delta: "+$8.1M"
    trend: up
    sentiment: positive
  - label: Churn Rate
    value: "1.8%"
    trend: down
    sentiment: positive
columns: 2
```

```ui:panel
child: revenueKpi
style: card
padding: 1.5rem
```

---

## Bordered

The `bordered` style draws a visible border with rounded corners and no background
fill. Clean and minimal — good for separating sections in a light document.

```ui:callout=_releaseNotice
type: info
title: Release 2.4.0 — Scheduled for March 12
content: "This release includes layout components (ui:columns, ui:polymer, ui:panel), 38 compiler tests, and updated documentation. No breaking changes."
```

```ui:panel
child: releaseNotice
style: bordered
padding: 1.25rem
```

---

## Elevated

The `elevated` style uses a more prominent drop shadow to visually lift the panel
off the page. Use sparingly to draw attention to the most important block.

```ui:table=_priorityTable
columns:
  - key: initiative
    label: Initiative
  - key: owner
    label: Owner
  - key: due
    label: Due Date
  - key: status
    label: Status
rows:
  - { initiative: "Layout Components", owner: "Platform Team", due: "Mar 12", status: "✅ Done" }
  - { initiative: "Variable System", owner: "Compiler Team", due: "Feb 28", status: "✅ Done" }
  - { initiative: "Storybook A11y Audit", owner: "Design Ops", due: "Mar 20", status: "🔄 In Progress" }
  - { initiative: "E2E Test Coverage 90%", owner: "QA", due: "Mar 28", status: "🔄 In Progress" }
  - { initiative: "Docs Site v2", owner: "DevRel", due: "Apr 5", status: "📋 Planned" }
```

```ui:panel
child: priorityTable
style: elevated
padding: 1.5rem
```

---

## Ghost

The `ghost` style applies no visual decoration at all — no background, border, or
shadow. The panel still controls `padding` around its child block, which is useful
for adding breathing room without visual noise.

```ui:callout=_ghostNote
type: warning
title: Ghost Style Note
content: "The ghost panel has no visual chrome — only the padding changes. Use it when you need spacing control without extra borders or shadows."
```

```ui:panel
child: ghostNote
style: ghost
padding: 2rem
```

---

## Nested Layout: Columns inside Panels

Panels can wrap any suppressed block variable, including layout blocks.
Here two `ui:columns` blocks are each wrapped in a `card` panel.

```ui:kpi=_leftKpi
metrics:
  - label: Active Users
    value: 12,841
    trend: up
    sentiment: positive
  - label: Sessions
    value: 98,200
    trend: up
    sentiment: positive
columns: 2
```

```ui:callout=_leftNote
type: tip
title: Growth Drivers
content: "Organic search (+34%) and product-led growth initiatives are the primary contributors this quarter."
```

```ui:kpi=_rightKpi
metrics:
  - label: Avg Session
    value: 4m 12s
    trend: up
    sentiment: positive
  - label: Bounce Rate
    value: "31.4%"
    trend: down
    sentiment: positive
columns: 2
```

```ui:callout=_rightNote
type: info
title: Data Source
content: "Figures aggregated from the analytics pipeline. Refreshed daily at 02:00 UTC."
```

```ui:columns=_leftCols
ratio: [1, 1]
gap: 1rem
children: [leftKpi, leftNote]
```

```ui:columns=_rightCols
ratio: [1, 1]
gap: 1rem
children: [rightKpi, rightNote]
```

```ui:panel=_leftPanelWrapped
child: leftCols
style: card
padding: 1.25rem
```

```ui:panel=_rightPanelWrapped
child: rightCols
style: card
padding: 1.25rem
```

```ui:columns
ratio: [1, 1]
gap: 1.5rem
children: [leftPanelWrapped, rightPanelWrapped]
```
