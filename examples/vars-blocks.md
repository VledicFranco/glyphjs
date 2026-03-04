---
title: Block Variables Demo
vars:
  org: Acme Corp
  quarter: Q1 2026
---

# {{org}} — {{quarter}} Report

This document demonstrates block variable reuse.

## Disclaimer (defined and rendered here)

```ui:callout=disclaimer
type: warning
title: Important Disclaimer
content: "Figures for {{quarter}} are preliminary and subject to revision. {{org}} makes no representations as to their accuracy."
```

## Executive Summary

Revenue grew significantly in {{quarter}}. See the disclaimer below before acting on any figures.

{{disclaimer}}

## Financial Details

Detailed breakdowns follow. The standard disclaimer applies to all tables:

{{disclaimer}}

---

## Suppressed Template

The following block is defined but NOT rendered at this point:

```ui:callout=_legalNote
type: info
title: Legal Notice
content: "All data is for {{org}} internal use only. Distribution requires written consent."
```

### Section A

{{legalNote}}

### Section B

{{legalNote}}
