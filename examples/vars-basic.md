---
title: Variables Basic Demo
vars:
  company: Acme Corp
  product: GlyphJS
  version: 2.4.1
  releaseDate: March 2026
---

# {{product}} v{{version}} — {{company}} Release Notes

Released on **{{releaseDate}}** by {{company}}.

```ui:callout
type: info
content: "{{product}} v{{version}} is now generally available. Thank you to everyone who contributed."
```

## What's new in {{product}} v{{version}}

The {{version}} release of {{product}} ships several improvements:

```ui:vars
q1Revenue: $13.1M
growthRate: 5.6%
customerCount: 1,200+
```

Key business metrics for **{{company}}** this quarter:

```ui:kpi
metrics:
  - label: "Q1 Revenue"
    value: "{{q1Revenue}}"
    trend: up
  - label: "Growth Rate"
    value: "{{growthRate}}"
    trend: up
  - label: "Customers"
    value: "{{customerCount}}"
    trend: up
```

---

> This document is maintained by {{company}}. For questions about {{product}}, please refer to the official documentation.
