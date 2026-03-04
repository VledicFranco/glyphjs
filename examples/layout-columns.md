---
title: Engineering Dashboard — Q1 2026
description: Sprint metrics and deployment health using ui:columns for side-by-side layout.
---

# Engineering Dashboard — Q1 2026

Real-time sprint metrics and infrastructure health, arranged with `ui:columns` for
a side-by-side reading experience. The left panel shows KPIs; the right panel provides
context and status.

---

## Sprint Performance

```ui:kpi=_sprintKpis
title: Sprint 14 Metrics
metrics:
  - label: Story Points Delivered
    value: "84"
    delta: "+12 vs Sprint 13"
    trend: up
    sentiment: positive
  - label: Cycle Time
    value: 3.2 days
    delta: "-0.8 days"
    trend: down
    sentiment: positive
  - label: Bug Escape Rate
    value: "2.1%"
    delta: "-0.9%"
    trend: down
    sentiment: positive
  - label: Test Coverage
    value: "87.4%"
    delta: "+2.1%"
    trend: up
    sentiment: positive
columns: 2
```

```ui:callout=_sprintStatus
type: tip
title: Sprint 14 — Closed Successfully
content: "All committed stories delivered. Two stretch goals pulled forward to Sprint 15. Retrospective scheduled for Friday at 14:00."
```

```ui:columns
ratio: [2, 1]
gap: 1.5rem
children: [sprintKpis, sprintStatus]
```

---

## Deployment Health

```ui:chart=_deployChart
type: bar
series:
  - name: Deployments
    data:
      - { week: "Jan W1", count: 8 }
      - { week: "Jan W2", count: 11 }
      - { week: "Jan W3", count: 9 }
      - { week: "Jan W4", count: 14 }
      - { week: "Feb W1", count: 12 }
      - { week: "Feb W2", count: 17 }
      - { week: "Feb W3", count: 15 }
      - { week: "Feb W4", count: 20 }
xAxis:
  key: week
  label: Week
yAxis:
  key: count
  label: Deployments
legend: false
```

```ui:table=_incidentTable
columns:
  - key: date
    label: Date
  - key: severity
    label: Severity
  - key: service
    label: Service
  - key: duration
    label: Duration
  - key: status
    label: Status
rows:
  - { date: "Feb 03", severity: P2, service: auth-api, duration: "18 min", status: Resolved }
  - { date: "Feb 11", severity: P3, service: file-storage, duration: "6 min", status: Resolved }
  - { date: "Feb 22", severity: P1, service: payment-svc, duration: "41 min", status: Resolved }
```

```ui:columns
ratio: [3, 2]
gap: 1.5rem
children: [deployChart, incidentTable]
```

---

## Team Velocity vs. Capacity

```ui:chart=_velocityChart
type: area
series:
  - name: Capacity
    data:
      - { sprint: "S10", pts: 70 }
      - { sprint: "S11", pts: 72 }
      - { sprint: "S12", pts: 68 }
      - { sprint: "S13", pts: 72 }
      - { sprint: "S14", pts: 80 }
  - name: Delivered
    data:
      - { sprint: "S10", pts: 65 }
      - { sprint: "S11", pts: 71 }
      - { sprint: "S12", pts: 60 }
      - { sprint: "S13", pts: 72 }
      - { sprint: "S14", pts: 84 }
xAxis:
  key: sprint
  label: Sprint
yAxis:
  key: pts
  label: Story Points
legend: true
```

```ui:kpi=_teamHealth
title: Team Health
metrics:
  - label: Avg Team Happiness
    value: 4.3 / 5
    trend: up
    sentiment: positive
  - label: On-call Incidents (30d)
    value: "3"
    trend: down
    sentiment: positive
  - label: PR Review Time
    value: 6.1 hrs
    delta: "-1.4 hrs"
    trend: down
    sentiment: positive
columns: 1
```

```ui:columns
ratio: [3, 1]
gap: 1.5rem
children: [velocityChart, teamHealth]
```
