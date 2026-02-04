# RFC-017: Interaction Event Stream

- **Status:** Draft
- **Related:** `packages/types/src/plugin.ts`, `packages/types/src/runtime.ts`, `packages/types/src/ir.ts`

---

## 1. Problem

GlyphJS claims interactivity, but the loop is one-directional:

```
LLM → Markdown → IR → React → Human sees UI
```

Users can sort tables, answer quizzes, switch tabs, expand accordions, and navigate file trees — but none of that interaction data escapes the component boundary. The only exception is `onNavigate` on Graph nodes. Every other component keeps its state private in local `useState`.

This means an LLM can build rich UI for a human, but it never learns what the human did with it. The human's choices, answers, and selections are lost.

### The closed loop

The goal is:

```
LLM generates Markdown
        ↓
    compile → IR → render
        ↓
    Human interacts (answers quiz, filters table, selects tab)
        ↓
    Structured InteractionEvent emitted to host app
        ↓
    Host app sends event context to LLM as conversation context
        ↓
    LLM generates new/updated Markdown
        ↓
    compile → diff → patch → re-render
```

The bottom half already exists — `@glyphjs/ir` has diffing (`diffIR`) and patching (`applyPatch`), so incremental updates from the LLM are architecturally supported. The missing piece is the top half: getting structured interaction data out of components.

---

## 2. Design Principles

1. **GlyphJS stays declarative.** Components render from data. They emit events. They don't manage bidirectional state or define behaviors.

2. **The host app orchestrates.** GlyphJS doesn't know about LLMs, conversations, or tool calls. It emits a typed event stream. The host app decides what to do with it.

3. **LLM-friendly authoring.** The Markdown syntax for opting into interactivity should be a single YAML key, not a DSL for defining handlers or actions.

4. **Structured, not generic.** Events are typed per-component with known schemas, not `Record<string, unknown>` blobs. This makes them parseable by LLMs and validatable at compile time.

5. **Opt-in per block.** Not every table sort or tab switch matters. The LLM (or author) marks which blocks should emit events using a reserved YAML key. This keeps the event stream focused.

---

## 3. Approach: Event Stream with Opt-In

### 3.1 Reserved YAML key: `interactive`

A new reserved YAML key, `interactive`, joins `glyph-id` and `refs`. When set to `true`, the block emits interaction events to the runtime. When absent or `false`, the component behaves exactly as today — interactions are local-only.

````markdown
```ui:quiz
interactive: true
questions:
  - question: What is the capital of France?
    type: multiple-choice
    options: [London, Paris, Berlin, Madrid]
    answer: Paris
```
````

````

The parser strips `interactive` from the component data (same pattern as `glyph-id` and `refs`) and stores it on the AST node. The compiler propagates it to the IR block's `metadata`.

### 3.2 InteractionEvent type

A typed union discriminated by component type. Each variant carries exactly the fields an LLM needs to understand what happened:

```typescript
// packages/types/src/interaction.ts

export interface InteractionEventBase {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Block ID of the component that emitted the event */
  blockId: string;
  /** Component type, e.g. 'ui:quiz' */
  blockType: BlockType;
  /** Document ID */
  documentId: string;
}

export interface QuizSubmitEvent extends InteractionEventBase {
  kind: 'quiz-submit';
  payload: {
    questionIndex: number;
    question: string;
    selected: string[];
    correct: boolean;
    score?: { correct: number; total: number };
  };
}

export interface TableSortEvent extends InteractionEventBase {
  kind: 'table-sort';
  payload: {
    column: string;
    direction: 'asc' | 'desc' | 'none';
  };
}

export interface TableFilterEvent extends InteractionEventBase {
  kind: 'table-filter';
  payload: {
    column: string;
    value: string;
  };
}

export interface TabSelectEvent extends InteractionEventBase {
  kind: 'tab-select';
  payload: {
    tabIndex: number;
    tabLabel: string;
  };
}

export interface AccordionToggleEvent extends InteractionEventBase {
  kind: 'accordion-toggle';
  payload: {
    sectionIndex: number;
    sectionTitle: string;
    expanded: boolean;
  };
}

export interface FileTreeSelectEvent extends InteractionEventBase {
  kind: 'filetree-select';
  payload: {
    path: string;
    type: 'file' | 'directory';
    expanded?: boolean;
  };
}

export interface GraphNodeClickEvent extends InteractionEventBase {
  kind: 'graph-node-click';
  payload: {
    nodeId: string;
    nodeLabel?: string;
  };
}

export interface ChartSelectEvent extends InteractionEventBase {
  kind: 'chart-select';
  payload: {
    seriesIndex: number;
    dataIndex: number;
    label: string;
    value: number;
  };
}

export interface ComparisonSelectEvent extends InteractionEventBase {
  kind: 'comparison-select';
  payload: {
    optionIndex: number;
    optionName: string;
  };
}

export type InteractionEvent =
  | QuizSubmitEvent
  | TableSortEvent
  | TableFilterEvent
  | TabSelectEvent
  | AccordionToggleEvent
  | FileTreeSelectEvent
  | GraphNodeClickEvent
  | ChartSelectEvent
  | ComparisonSelectEvent;

/** Discriminant values for exhaustive switch */
export type InteractionKind = InteractionEvent['kind'];
````

This is a **closed union today**, extensible via plugin-authored custom events in the future (a `custom:${string}` kind pattern, mirroring `ReferenceType`).

### 3.3 New prop on GlyphComponentProps

```typescript
// packages/types/src/plugin.ts

export interface GlyphComponentProps<T = unknown> {
  data: T;
  block: Block;
  outgoingRefs: Reference[];
  incomingRefs: Reference[];
  onNavigate: (ref: Reference) => void;
  onInteraction?: (event: InteractionEvent) => void; // NEW
  theme: GlyphThemeContext;
  layout: LayoutHints;
  container: ContainerContext;
}
```

The prop is optional. Components check `if (props.onInteraction)` before emitting. The runtime only passes it to blocks where `interactive: true` is set in the IR metadata.

### 3.4 Runtime callback

```typescript
// packages/types/src/runtime.ts

export interface GlyphRuntimeConfig {
  components?: GlyphComponentDefinition[];
  overrides?: Partial<Record<string, ComponentType<BlockProps>>>;
  theme?: 'light' | 'dark' | GlyphTheme;
  animation?: AnimationConfig;
  onDiagnostic?: (diagnostic: Diagnostic) => void;
  onNavigate?: (ref: Reference, targetBlock: Block) => void;
  onInteraction?: (event: InteractionEvent) => void; // NEW
}
```

The runtime aggregates events from all interactive blocks and calls `onInteraction` on the config. This is the single point where the host app receives all user interactions.

### 3.5 `onNavigate` becomes a special case

Today `onNavigate` is the only way a component signals the runtime. With this RFC, Graph's node-click behavior can be expressed as an `InteractionEvent` with `kind: 'graph-node-click'`. The existing `onNavigate` callback remains for backwards compatibility and for reference-based navigation, but new interactive behaviors go through `onInteraction`.

---

## 4. How the LLM Loop Works

### 4.1 LLM authors an interactive document

````markdown
# Product Feedback Survey

```ui:quiz
interactive: true
glyph-id: satisfaction-quiz
questions:
  - question: How would you rate the product?
    type: multiple-choice
    options: [Excellent, Good, Fair, Poor]
    answer: Excellent
  - question: Would you recommend it?
    type: true-false
    answer: true
```
````

```ui:table
interactive: true
glyph-id: feature-requests
columns: [Feature, Votes, Status]
rows:
  - [Dark mode, 142, Planned]
  - [Export to PDF, 89, In Progress]
  - [API access, 67, Under Review]
filterable: true
sortable: true
```

````

### 4.2 Host app wires up the event stream

```typescript
import { compile } from '@glyphjs/compiler';
import { createGlyphRuntime } from '@glyphjs/runtime';
import type { InteractionEvent } from '@glyphjs/types';

const { ir } = compile(markdown);

const runtime = createGlyphRuntime({
  components: defaultComponents,
  theme: 'light',
  onInteraction: (event: InteractionEvent) => {
    // Send to LLM as tool result or conversation context
    sendToLLM({
      role: 'tool',
      content: JSON.stringify(event),
    });
  },
});
````

### 4.3 LLM receives structured event

```json
{
  "kind": "quiz-submit",
  "timestamp": "2026-02-04T22:15:00.000Z",
  "blockId": "satisfaction-quiz",
  "blockType": "ui:quiz",
  "documentId": "feedback-survey",
  "payload": {
    "questionIndex": 0,
    "question": "How would you rate the product?",
    "selected": ["Good"],
    "correct": false,
    "score": { "correct": 0, "total": 2 }
  }
}
```

### 4.4 LLM responds with updated Markdown

The LLM can now react to the user's input — updating the document, adding follow-up components, or generating new content based on the interaction:

````markdown
# Product Feedback Survey

Thanks for your feedback! You rated the product as **Good**.

```ui:callout
type: info
title: Follow-up
content: Since you rated "Good" rather than "Excellent", could you tell us what would make it excellent?
```
````

````

### 4.5 Host app applies the update

```typescript
const { ir: newIR } = compile(updatedMarkdown);
const patch = diffIR(currentIR, newIR);
const patchedIR = applyPatch(currentIR, patch);
// Re-render with patchedIR — only changed blocks update
````

---

## 5. Implementation Phases

### Phase 1: Types and plumbing

**Packages:** `@glyphjs/types`, `@glyphjs/parser`, `@glyphjs/compiler`, `@glyphjs/runtime`

1. Add `InteractionEvent` types to `@glyphjs/types`
2. Parser: extract `interactive` reserved key (same pattern as `glyph-id`)
3. Compiler: propagate `interactive: true` to block `metadata`
4. Runtime: add `onInteraction` to config, pass `onInteraction` prop to interactive blocks

**Files touched:**

- `packages/types/src/interaction.ts` (new)
- `packages/types/src/index.ts` (re-export)
- `packages/types/src/plugin.ts` (add `onInteraction` to props)
- `packages/types/src/runtime.ts` (add `onInteraction` to config)
- `packages/parser/src/plugin.ts` (extract `interactive` key)
- `packages/types/src/ast.ts` (add `interactive` to AST node)
- `packages/compiler/src/ast-to-ir.ts` (propagate to metadata)
- `packages/runtime/src/` (wire through to components)

### Phase 2: Stateful components emit events

**Package:** `@glyphjs/components`

Instrument the 5 stateful components to emit events when `onInteraction` is provided:

| Component | Events                                                       |
| --------- | ------------------------------------------------------------ |
| Quiz      | `quiz-submit` on answer submission                           |
| Table     | `table-sort` on column sort, `table-filter` on filter change |
| Tabs      | `tab-select` on tab switch                                   |
| Accordion | `accordion-toggle` on section expand/collapse                |
| FileTree  | `filetree-select` on node click                              |

Each component checks `if (props.onInteraction)` and emits the appropriate typed event alongside its existing local state update. No behavioral changes to components without `interactive: true`.

### Phase 3: Visualization components (stretch)

Add click/select events to visualization components:

| Component  | Events                                                  |
| ---------- | ------------------------------------------------------- |
| Graph      | `graph-node-click` (replaces custom `onNavigate` usage) |
| Chart      | `chart-select` on data point click                      |
| Comparison | `comparison-select` on option selection                 |

### Phase 4: Documentation and examples

- Document the `interactive` key in the authoring guide
- Add an LLM integration example to the docs
- Update the component docs pages for interactive components

---

## 6. Alternatives Considered

### Two-way data binding (rejected)

Components receive and emit state — e.g., the LLM sets `selectedTab: 2` in YAML and receives tab changes back. Rejected because:

- Forces LLMs to manage component state in Markdown, which is unnatural
- Turns GlyphJS into a form framework, diverging from its document-rendering identity
- Complexity of state synchronization (race conditions, stale state, conflict resolution)

### Action dispatching (rejected)

Markdown defines handlers: `on-submit: ask-llm`, `on-filter: refresh-data`. Rejected because:

- Requires a DSL for defining behaviors, which LLMs need to learn and which scope-creeps the project
- Blurs the boundary between rendering engine and application framework
- The host app is the right place for orchestration logic, not the Markdown

### Always-on events without opt-in (rejected)

Every component always emits events for every interaction. Rejected because:

- Creates a noisy event stream (every tab switch, every table sort re-order)
- LLMs would need to filter relevant from irrelevant events
- Performance overhead for components that don't need it
- The `interactive` key lets the LLM express intent: "I care about this component's interactions"

---

## 7. Open Questions

1. **Debouncing**: Should `table-filter` events be debounced? The user typing "react" generates 5 events ("r", "re", "rea", "reac", "react"). The runtime could debounce by default (300ms) or leave it to the host app.

2. **Event batching**: Should the runtime batch events (e.g., emit an array every 100ms) or fire them individually? Individual is simpler; batching is more efficient for high-frequency interactions.

3. **State snapshots**: Should events include the component's full current state (all sort columns, all filter values) or just the delta? Full state is more useful for LLMs (no need to track history), but larger payloads.

4. **Custom component events**: Should the plugin API allow custom components to define their own event kinds? A `custom:${string}` pattern would work, matching the existing `ReferenceType` extensibility. This can be deferred to a follow-up RFC.

---

## 8. References

- Current `GlyphComponentProps`: `packages/types/src/plugin.ts`
- Current `GlyphRuntimeConfig`: `packages/types/src/runtime.ts`
- Reserved YAML key handling: `packages/parser/src/plugin.ts:85-98`
- IR diffing/patching: `packages/ir/src/`
- Quiz component (most interactive today): `packages/components/src/quiz/`
