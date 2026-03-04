---
title: Layout Components Demo
description: Demonstrates ui:columns, ui:rows, and ui:panel layout components.
---

# Layout Components Demo

Layout components let you arrange suppressed block variables into 2D grids and styled
containers. Define blocks with `=_varName` to suppress them from the flow, then reference
them by name inside a layout block.

---

## ui:columns — Proportional Column Grid

```ui:callout=_notice
type: info
title: Status Notice
content: All systems are operational. Last checked 5 minutes ago.
```

```ui:kpi=_metrics
metrics:
  - label: Uptime
    value: "99.98%"
    trend: up
  - label: Latency
    value: 42ms
    trend: flat
  - label: Errors
    value: "0"
    trend: down
```

```ui:columns
ratio: [2, 1]
gap: 1.5rem
children: [notice, metrics]
```

---

## ui:panel — Styled Single-Block Wrapper

```ui:callout=_announcement
type: tip
title: New Feature Available
content: "Variables and macros are now supported in GlyphJS documents. Use double-brace syntax to reference scalar variables and block variables."
```

```ui:panel
child: announcement
style: elevated
padding: 1.5rem
```

---

## ui:rows + ui:columns — Recursive Layout

Nest `ui:rows` inside `ui:columns` (or vice versa) to build 2D layouts.
This produces a left block next to a right column split into two rows.

```ui:callout=_mainBlock
type: tip
title: Main Content
content: Spans the full left column height.
```

```ui:callout=_topRight
type: info
title: Top Right
content: Upper half of the right column.
```

```ui:callout=_bottomRight
type: warning
title: Bottom Right
content: Lower half of the right column.
```

```ui:rows=_rightStack
gap: 1rem
children: [topRight, bottomRight]
```

```ui:columns
ratio: [1, 1]
gap: 1.5rem
children: [mainBlock, rightStack]
```

---

## Combined: Columns with Panels

```ui:callout=_leftContent
type: info
title: Left
content: Left panel content.
```

```ui:callout=_rightContent
type: error
title: Right
content: Right panel content.
```

```ui:panel=_leftPanel
child: leftContent
style: card
```

```ui:panel=_rightPanel
child: rightContent
style: bordered
```

```ui:columns
ratio: [1, 1]
gap: 1rem
children: [leftPanel, rightPanel]
```
