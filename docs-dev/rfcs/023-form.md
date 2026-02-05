# RFC-023: Form

- **Status:** Implemented
- **Priority:** P1
- **Complexity:** L
- **Block type:** `ui:form`

---

## 1. Summary

Dynamic form with 5 field types — the universal input primitive for capturing structured user data. Supports text, textarea, select, checkbox, and range fields with validation.

## 2. Motivation

Forms are the most versatile input mechanism. LLMs can dynamically construct forms to gather project configuration, user preferences, or structured feedback — all emitted as a single typed payload on submit.

## 3. Schema

```yaml
title: 'Project Setup'
description: 'Tell us about your project'
submitLabel: 'Create Project'
fields:
  - type: text
    id: name
    label: Project Name
    required: true
  - type: select
    id: framework
    label: Framework
    options: [React, Vue, Angular]
  - type: range
    id: budget
    label: Budget
    min: 0
    max: 50000
    step: 1000
    unit: '$'
  - type: checkbox
    id: typescript
    label: Use TypeScript
    default: true
  - type: textarea
    id: description
    label: Description
    rows: 4
```

## 4. Visual design

- Fields rendered vertically with labels above inputs.
- Required fields marked with red asterisk.
- Invalid fields highlighted with red border on failed validation.
- Submit button disabled after successful submission.

## 5. Accessibility

- Native `<form>` with `<label>` associations via `htmlFor`/`id`.
- `aria-required`, `aria-invalid` on validated inputs.
- Range inputs include `aria-valuetext` with unit.

## 6. Implementation notes

- Field types use discriminated union on `type` in both schema and component.
- Client-side validation for required fields only.
- Form disabled after submission to prevent double-submit.
- Event payload includes both `values` map and `fields` array with metadata.
