---
title: Complex Document
description: A document exercising all features.
authors:
  - Alice
tags:
  - complex
  - test
layout:
  mode: dashboard
  spacing: relaxed
  columns: 2
---

# Complex Document

An introductory paragraph with **bold**, *italic*, and `inline code`.

## Data Visualization

```ui:graph
glyph-id: main-graph
type: flowchart
nodes:
  - id: input
    label: Input Data
  - id: process
    label: Processing
  - id: output
    label: Output
edges:
  - from: input
    to: process
  - from: process
    to: output
layout: left-right
refs:
  - target: summary-callout
    type: details
    label: see summary
```

```ui:callout
glyph-id: summary-callout
type: info
title: Summary
content: This summarizes the graph above.
```

## Interactive Sections

```ui:tabs
tabs:
  - label: Tab A
    content: |
      Content for tab A with a [link](https://example.com).
  - label: Tab B
    content: |
      Content for tab B.
```

```ui:steps
steps:
  - title: Initialize
    status: completed
    content: |
      Set up the environment.
  - title: Execute
    status: active
    content: |
      Run the process.
```

- First item
- Second item
- Third item

> A blockquote for emphasis.

```javascript
console.log("Hello, Glyph!");
```

---

Final paragraph.
