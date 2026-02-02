# RFC-009: Sequence Diagram

- **Status:** Draft
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P7
- **Complexity:** L
- **Block type:** `ui:sequence`

---

## 1. Summary

A UML-style sequence diagram component showing interactions between actors/systems over time, with messages, replies, and optional activation bars.

## 2. Motivation

LLMs frequently explain how systems interact: "The client sends a request to the API, which queries the database, which returns the result." Sequence diagrams are the standard visualization for this, but today LLMs can only describe them in prose or ASCII art. A rendered sequence diagram with lifelines, arrows, and labels makes these interactions immediately clear.

## 3. Schema

````yaml
```ui:sequence
title: Authentication Flow
actors:
  - id: client
    label: Browser
  - id: api
    label: Auth API
  - id: db
    label: Database
messages:
  - from: client
    to: api
    label: POST /login
  - from: api
    to: db
    label: Query user
  - from: db
    to: api
    label: User record
    type: reply
  - from: api
    to: api
    label: Verify password
    type: self
  - from: api
    to: client
    label: JWT token
    type: reply
````

````

### Zod schema

```typescript
const sequenceSchema = z.object({
  title: z.string().optional(),
  actors: z.array(z.object({
    id: z.string(),
    label: z.string(),
  })).min(2),
  messages: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string(),
    type: z.enum(['message', 'reply', 'self']).default('message'),
  })).min(1),
});
````

## 4. Visual design

- **Actors** rendered as labeled boxes across the top.
- **Lifelines** extend downward from each actor as dashed vertical lines.
- **Messages** rendered as horizontal arrows between lifelines:
  - `message`: solid arrow (→).
  - `reply`: dashed arrow (⇠).
  - `self`: arrow that loops back to the same lifeline.
- Labels centered above each arrow.
- Messages are spaced vertically in order, creating a clear timeline.
- Rendered as SVG.
- Colors: actor boxes use `--glyph-surface-raised`, lifelines use `--glyph-border`, arrows use `--glyph-text`, labels use `--glyph-text`.

## 5. Accessibility

- SVG has `role="img"` with `aria-label` describing the diagram title and actor count.
- Hidden accessible table listing each message: "From [actor] to [actor]: [label]".
- Messages listed in order to convey the temporal sequence.

## 6. Implementation notes

- Layout is simpler than it looks: actors are evenly spaced horizontally, messages are evenly spaced vertically. No graph layout engine needed.
- Actor x-positions: divide SVG width by actor count.
- Message y-positions: fixed vertical spacing (e.g., 50px per message).
- Self-messages need a small arc or loop rendered on one lifeline.
- SVG width adapts to actor count; height adapts to message count.
- Arrow markers defined as SVG `<marker>` elements (solid and dashed variants).
- No external dependencies required — this is pure SVG geometry.
