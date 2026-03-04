---
title: Parameterized Templates Demo
vars:
  company: Acme Corp
  quarter: Q1 2026
  currency: USD
---

# {{company}} KPI Dashboard — {{quarter}}

Parameterized templates allow defining a reusable block shape once and
instantiating it with different data.

## KPI Template (suppressed — not rendered here)

```ui:callout=_kpi(label, value, trend)
type: info
title: "{{label}}"
content: "{{value}} ({{trend}})"
```

## {{quarter}} Metrics

{{kpi("Revenue","$13.1M","↑ 5.6% YoY")}}

{{kpi("Operating Margin","22.4%","↑ 1.2pp QoQ")}}

{{kpi("Customer Count","1,247","↑ 8.3% YoY")}}

{{kpi("NPS Score","72","↑ 4 points")}}

---

## Callout Template

```ui:callout=_note(title,body)
type: tip
title: "{{title}}"
content: "{{body}}"
```

{{note("Methodology","All figures are computed using GAAP standards and audited by an independent firm.")}}

{{note("Data Sources","Market data sourced from Bloomberg; internal data from {{company}}'s ERP system.")}}

{{note("Currency","All monetary figures are reported in {{currency}} unless otherwise stated.")}}
