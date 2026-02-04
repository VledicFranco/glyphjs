# RFC-014: Infographic

- **Status:** Implemented
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P12
- **Complexity:** M
- **Block type:** `ui:infographic`

---

## 1. Summary

A visual summary component for presenting multi-section infographics that mix statistics, facts, progress bars, and narrative text. Sections stack vertically with dividers, and items within each section auto-layout based on their type.

## 2. Motivation

LLMs frequently produce structured summaries that blend different content types: key stats, bullet-point facts, progress toward goals, and explanatory text. Today, these are rendered as flat Markdown — numbered lists, bold text, and improvised ASCII progress bars. An Infographic component provides a visually rich, section-based layout that makes mixed-format summaries scannable and engaging, similar to a dashboard overview or an executive summary slide.

### Differentiation from KPI

KPI (`ui:kpi`) is a flat grid of individual numeric metrics with trend arrows and deltas — it answers "what are the key numbers right now?" Infographic (`ui:infographic`) is a multi-section layout that mixes different item types (stats, facts, progress bars, text) — it answers "what's the full picture?" A KPI block might show "Revenue: $2.3M ▲15%", while an Infographic section might combine a stat row ("$2.3M revenue"), a progress bar ("72% of annual target"), a fact list ("Expanded to 3 new markets"), and a text paragraph explaining the strategy.

## 3. Schema

````yaml
```ui:infographic
title: Q4 2025 Company Overview
sections:
  - heading: Key Metrics
    items:
      - type: stat
        label: Revenue
        value: "$2.3M"
        description: Up 15% from Q3
      - type: stat
        label: Customers
        value: "1,240"
        description: Net new this quarter
      - type: stat
        label: NPS
        value: "72"

  - heading: Annual Targets
    items:
      - type: progress
        label: Revenue target
        value: 72
        color: green
      - type: progress
        label: Hiring plan
        value: 45
      - type: progress
        label: Product launches
        value: 100
        color: blue

  - heading: Highlights
    items:
      - type: fact
        icon: "🚀"
        text: Launched v2.0 with 40% performance improvement
      - type: fact
        icon: "🌍"
        text: Expanded to 3 new international markets
      - type: fact
        icon: "🏆"
        text: Won "Best Developer Tool" at DevAwards 2025

  - heading: Outlook
    items:
      - type: text
        content: >
          Q1 2026 will focus on enterprise expansion and API partnerships.
          The team is targeting 2,000 customers by mid-year with the
          launch of the self-serve tier.
```
````

### Zod schema

```typescript
const statItemSchema = z.object({
  type: z.literal('stat'),
  label: z.string(),
  value: z.string(),
  description: z.string().optional(),
});

const factItemSchema = z.object({
  type: z.literal('fact'),
  icon: z.string().optional(),
  text: z.string(),
});

const progressItemSchema = z.object({
  type: z.literal('progress'),
  label: z.string(),
  value: z.number().min(0).max(100),
  color: z.string().optional(),
});

const textItemSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
});

const infographicItemSchema = z.discriminatedUnion('type', [
  statItemSchema,
  factItemSchema,
  progressItemSchema,
  textItemSchema,
]);

const infographicSectionSchema = z.object({
  heading: z.string().optional(),
  items: z.array(infographicItemSchema).min(1),
});

const infographicSchema = z.object({
  title: z.string().optional(),
  sections: z.array(infographicSectionSchema).min(1).max(8),
});
```

## 4. Visual design

### Overall layout

- Sections stack vertically, separated by subtle horizontal dividers (`--glyph-infographic-section-divider`).
- Optional top-level `title` rendered as a heading above all sections.
- Each section has an optional `heading` rendered as a section subheading.

### Item type rendering

**`stat`** — Rendered as a row grid (auto-columns, similar to KPI layout). Each stat shows:

- **Value** — large, prominent text (`--glyph-heading`, 1.5–2rem).
- **Label** — small, muted text below the value (`--glyph-text-muted`).
- **Description** (optional) — smaller muted text below the label.

**`fact`** — Rendered as a vertical list. Each fact shows:

- **Icon** (optional) — displayed inline before the text, slightly larger font.
- **Text** — standard body text.

**`progress`** — Rendered as stacked horizontal bars. Each bar shows:

- **Label** — left-aligned text.
- **Value** — right-aligned percentage text (e.g., "72%").
- **Bar** — horizontal fill bar below the label row. Track uses `--glyph-infographic-track`, fill uses `--glyph-infographic-color-1` through `--glyph-infographic-color-4` (cycled by index), or the explicit `color` if provided.

**`text`** — Rendered as a standard paragraph with body font and standard line height.

### Auto-layout rules

- Consecutive items of the same type within a section are grouped together.
- `stat` groups render as a row grid (horizontal).
- `fact` groups render as a vertical list.
- `progress` groups render as stacked bars.
- `text` items render as paragraphs.
- Mixed-type sections are supported — items render in order, grouped by consecutive type.

### CSS custom properties

- `--glyph-infographic-track` — Background color of progress bar tracks. Default: `--glyph-surface-raised`.
- `--glyph-infographic-color-1` — Primary fill color for progress bars. Default: `--glyph-accent`.
- `--glyph-infographic-color-2` — Second fill color. Default: `#22c55e` (green).
- `--glyph-infographic-color-3` — Third fill color. Default: `#eab308` (amber).
- `--glyph-infographic-color-4` — Fourth fill color. Default: `#ef4444` (red).
- `--glyph-infographic-section-divider` — Color of the horizontal divider between sections. Default: `--glyph-border`.

## 5. Accessibility

- Outer container: `role="region"` with `aria-label` from the optional `title`.
- Each section: `<section>` element with `aria-labelledby` pointing to the section heading (if present). Sections without a heading use `aria-label="Section N"`.
- Stat groups: `role="group"` with `aria-label="Statistics"`. Each stat has `aria-label` combining label, value, and description (e.g., "Revenue: $2.3M, Up 15% from Q3").
- Fact items: rendered as a `<ul>` list. Icons use `aria-hidden="true"` since the text conveys the meaning.
- Progress bars: each bar uses `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, and `aria-label` from the label field.
- Text items: standard `<p>` elements, no additional ARIA needed.

## 6. Implementation notes

- Complexity is M due to the discriminated union of 4 item types, auto-layout grouping logic, and progress bar rendering.
- The `value` field on `stat` is a string (like KPI) to allow pre-formatted values. The `value` field on `progress` is a number (0–100) since it drives the bar width.
- The `color` field on `progress` accepts any CSS color string. If omitted, colors cycle through `--glyph-infographic-color-{1-4}` based on the item's index within its progress group.
- Auto-layout grouping: iterate through items, grouping consecutive items of the same type. Each group is rendered with the appropriate layout. This keeps the schema flat (no nested layout config) while producing visually distinct sections.
- Section limit of 8 keeps the component to a reasonable length — very long infographics should be split into multiple blocks.
- The stat layout reuses visual patterns from `ui:kpi` but without trend indicators or deltas — stats in infographics are simpler, snapshot values.
