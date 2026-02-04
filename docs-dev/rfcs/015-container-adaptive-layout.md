# RFC-015: Container-Adaptive Layout System

- **Status:** Implemented
- **Related:** [RFC-013: Card](./013-card.md), [RFC-006: KPI](./006-kpi.md)

---

## 1. Problem

GlyphJS components render in containers ranging from ~350px (chat sidebars) to ~1920px+ (ultrawide dashboards). Every component sets `width: 100%` and renders its full layout regardless of available space.

Broken behaviors today:

- **Card/KPI**: `repeat(colCount, 1fr)` grids produce 75–120px columns in chat — titles truncate, values overlap
- **Infographic**: Hardcoded 2-col grid produces two 175px columns in narrow containers
- **Table**: `width: 100%` with no scroll wrapper — wide tables overflow
- **Graph/Flowchart/Architecture**: Fixed `minHeight: 300, maxHeight: 700` produces near-square viewports in 350px containers where labels overlap
- **MindMap**: Fixed `minHeight: 200, maxHeight: 800` — similar problem at narrow widths
- **Sequence**: Fixed `ACTOR_GAP`/`ACTOR_WIDTH` constants produce oversized SVGs

Card RFC-013 and KPI RFC-006 both promise "responsive: collapses to fewer columns" but this was never implemented.

**Why viewport media queries don't work**: A 400px chat sidebar on a 1920px monitor needs the same adaptation as a 400px mobile screen. Adaptation must be container-based, not viewport-based.

**Why pure CSS container queries aren't viable**: GlyphJS uses inline styles exclusively. `@container` rules can't be expressed in `React.CSSProperties`. Introducing CSS files would be an architectural change.

---

## 2. Approach: Props-Based Container Awareness

### Key architectural constraint

`@glyphjs/components` imports ONLY from `@glyphjs/types` and `@glyphjs/schemas`. It does NOT import from `@glyphjs/runtime`. This clean dependency boundary must be preserved.

### Decision: Extend `GlyphComponentProps` with container info

Add container measurement data to the props that the runtime already injects into every component:

```typescript
// packages/types/src/container.ts — new file
export type ContainerTier = 'compact' | 'standard' | 'wide';

export interface ContainerContext {
  width: number; // measured px (0 = not yet measured)
  tier: ContainerTier; // resolved breakpoint
}
```

```typescript
// packages/types/src/plugin.ts — extended interface
export interface GlyphComponentProps<T = unknown> {
  data: T;
  block: Block;
  outgoingRefs: Reference[];
  incomingRefs: Reference[];
  onNavigate: (ref: Reference) => void;
  theme: GlyphThemeContext;
  layout: LayoutHints;
  container: ContainerContext; // NEW
}
```

The runtime measures the container via a ResizeObserver at the `GlyphDocument` level and passes the result through `resolveComponentProps()`. Components read `container.tier` from their existing props — no new imports needed.

### Why not a `useContainerWidth()` hook?

A context-based hook was considered. Problems:

- Creates a new dependency: `@glyphjs/components` → `@glyphjs/runtime` (currently nonexistent)
- Or requires a new `@glyphjs/hooks` package — unnecessary complexity
- Components would need to be wrapped in a provider for Storybook testing

Props-based approach advantages:

- Preserves the existing dependency graph
- `createMockProps()` in tests already works — just add `container` field
- Storybook stories work without a provider — `mockProps()` supplies the value
- Every component gets container info automatically, no opt-in required

---

## 3. Breakpoint Strategy

Three container-width tiers:

| Tier       | Width     | Contexts                              |
| ---------- | --------- | ------------------------------------- |
| `compact`  | < 500px   | Chat UIs, mobile, narrow sidebars     |
| `standard` | 500–899px | Docs sites, split-pane editors        |
| `wide`     | ≥ 900px   | Dashboards, full-width, presentations |

**500px boundary**: Below this, a 2-column grid with 1rem gap yields columns < 240px — too narrow for card content. Multi-column layouts must collapse.

**900px boundary**: At 900px, 3-column grids yield ~285px columns — comfortable for cards with images.

**No ultrawide tier**: Components don't change behavior above 900px. `1fr` units fill extra space naturally.

### Hysteresis

16px dead zone prevents layout thrashing when container width hovers near a boundary:

- compact → standard at 500px, standard → compact at 484px
- standard → wide at 900px, wide → standard at 884px

---

## 4. Per-Component Adaptation

### Components that need NO changes

Callout, Steps, Timeline, Tabs, Accordion, CodeDiff, FileTree, Equation, Quiz — these use vertical stacking or flex-wrap and work well at all sizes.

### Adaptation rules

**Card** (`packages/components/src/card/Card.tsx`):

| Tier     | Columns                |
| -------- | ---------------------- |
| compact  | 1                      |
| standard | min(author columns, 2) |
| wide     | author columns (as-is) |

**KPI** (`packages/components/src/kpi/Kpi.tsx`):

| Tier     | Columns                |
| -------- | ---------------------- |
| compact  | min(metrics, 2)        |
| standard | min(author columns, 3) |
| wide     | author columns (as-is) |

**Infographic** (`packages/components/src/infographic/Infographic.tsx`):

| Tier          | Behavior                                 |
| ------------- | ---------------------------------------- |
| compact       | Force single-column stack (disable grid) |
| standard/wide | Current 2-col grid                       |

**Table** (`packages/components/src/table/Table.tsx`):

| Tier          | Behavior                                                            |
| ------------- | ------------------------------------------------------------------- |
| compact       | Wrap `<table>` in `overflowX: 'auto'` div, reduce font to 0.8125rem |
| standard/wide | Current behavior                                                    |

**Chart** (`packages/components/src/chart/Chart.tsx`):

| Tier          | Behavior                                   |
| ------------- | ------------------------------------------ |
| compact       | Reduce margins by 30%, smaller legend font |
| standard/wide | Current behavior                           |

Chart keeps its own ResizeObserver for precise SVG width. The tier adds density adjustments.

**Graph / Flowchart / Architecture** (`packages/components/src/graph/Graph.tsx`, `packages/components/src/flowchart/Flowchart.tsx`, `packages/components/src/architecture/Architecture.tsx`):

All three use `minHeight: 300, maxHeight: 700` with `width: 100%` SVG rendering.

| Tier          | Behavior                                                |
| ------------- | ------------------------------------------------------- |
| compact       | `minHeight: 200, maxHeight: 500` (from current 300/700) |
| standard/wide | Current behavior (300/700)                              |

Architecture also has fixed `NODE_WIDTH: 120` and spacing constants (via ELK layout engine). These are internal to the layout algorithm and scale via the SVG `viewBox`, so no constant changes are needed — only the height constraints.

**MindMap** (`packages/components/src/mindmap/MindMap.tsx`):

| Tier          | Behavior                                                |
| ------------- | ------------------------------------------------------- |
| compact       | `minHeight: 150, maxHeight: 500` (from current 200/800) |
| standard/wide | Current behavior (200/800)                              |

**Comparison** (`packages/components/src/comparison/Comparison.tsx`):

Comparison already wraps its table in an `overflowX: 'auto'` div, so horizontal overflow is handled. Compact adaptation targets density:

| Tier          | Behavior                                                    |
| ------------- | ----------------------------------------------------------- |
| compact       | Reduce font from 0.875rem to 0.8125rem, reduce cell padding |
| standard/wide | Current behavior                                            |

**Sequence** (constants in `packages/components/src/sequence/helpers.tsx`, rendered in `Sequence.tsx`):

| Tier          | Behavior                                                   |
| ------------- | ---------------------------------------------------------- |
| compact       | Reduce ACTOR_GAP by 40%, ACTOR_WIDTH by 30%, smaller fonts |
| standard/wide | Current behavior                                           |

---

## 5. Implementation

### New files

| File                                                  | Purpose                                   |
| ----------------------------------------------------- | ----------------------------------------- |
| `packages/types/src/container.ts`                     | `ContainerTier`, `ContainerContext` types |
| `packages/runtime/src/container/ContainerMeasure.tsx` | ResizeObserver wrapper component          |
| `packages/runtime/src/container/breakpoints.ts`       | `resolveTier()` with hysteresis           |
| `packages/runtime/src/container/index.ts`             | Barrel exports                            |

### Modified files

| File                                            | Change                                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `packages/types/src/index.ts`                   | Export `ContainerTier`, `ContainerContext`                                                |
| `packages/types/src/plugin.ts`                  | Add `container: ContainerContext` to `GlyphComponentProps`                                |
| `packages/runtime/src/GlyphDocument.tsx`        | Wrap content in `ContainerMeasure`, pass `container` to `BlockRenderer` via `renderBlock` |
| `packages/runtime/src/plugins/resolve-props.ts` | Accept + pass `container` param                                                           |
| `packages/runtime/src/BlockRenderer.tsx`        | Accept `container` prop, pass to `resolveComponentProps()`                                |
| `packages/components/src/__tests__/helpers.ts`  | Add default `container` to `createMockProps`                                              |
| `packages/components/src/__storybook__/data.ts` | Add default `container` to `mockProps`                                                    |

Then per-component changes (Phases 2–4).

### `resolveTier()` with hysteresis

```typescript
// packages/runtime/src/container/breakpoints.ts
const COMPACT_UP = 500;
const COMPACT_DOWN = 484; // 500 - 16
const WIDE_UP = 900;
const WIDE_DOWN = 884; // 900 - 16

export function resolveTier(width: number, previous: ContainerTier): ContainerTier {
  if (width === 0) return 'wide'; // not yet measured — default to full layout

  switch (previous) {
    case 'compact':
      if (width >= WIDE_UP) return 'wide';
      if (width >= COMPACT_UP) return 'standard';
      return 'compact';
    case 'standard':
      if (width >= WIDE_UP) return 'wide';
      if (width < COMPACT_DOWN) return 'compact';
      return 'standard';
    case 'wide':
      if (width < COMPACT_DOWN) return 'compact';
      if (width < WIDE_DOWN) return 'standard';
      return 'wide';
  }
}
```

When growing, transitions happen at the higher threshold (500, 900). When shrinking, transitions happen at the lower threshold (484, 884). This prevents rapid toggling when width hovers near a boundary.

### ContainerMeasure component (simplified)

```typescript
// packages/runtime/src/container/ContainerMeasure.tsx
export function ContainerMeasure({ children, onMeasure }: {
  children: ReactNode;
  onMeasure: (width: number) => void;
}): ReactNode {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) onMeasure(entry.contentRect.width);
      }
    });
    onMeasure(el.clientWidth);  // initial measurement
    observer.observe(el);
    return () => observer.disconnect();
  }, [onMeasure]);

  return <div ref={ref} style={{ width: '100%' }}>{children}</div>;
}
```

### GlyphDocument integration point

```typescript
// In GlyphDocument, add state + ref for container measurement with hysteresis
const [containerWidth, setContainerWidth] = useState(0);
const tierRef = useRef<ContainerTier>('wide');
const containerTier = useMemo(() => {
  const next = resolveTier(containerWidth, tierRef.current);
  tierRef.current = next;
  return next;
}, [containerWidth]);
const container: ContainerContext = useMemo(
  () => ({ width: containerWidth, tier: containerTier }),
  [containerWidth, containerTier],
);

// renderBlock now threads container to BlockRenderer
const renderBlock = useCallback(
  (block: Block, index: number): ReactNode => (
    <BlockRenderer key={block.id} block={block} layout={layout} index={index} container={container} />
  ),
  [layout, container],
);

// Wrap the existing content
return (
  <AnimationProvider config={animation}>
    <LayoutProvider layout={layout}>
      <ContainerMeasure onMeasure={setContainerWidth}>
        <div className={className} data-glyph-document={ir.id}>
          {content}
          {diagnostics && diagnostics.length > 0 && (
            <DiagnosticsOverlay diagnostics={diagnostics} />
          )}
        </div>
      </ContainerMeasure>
    </LayoutProvider>
  </AnimationProvider>
);
```

**BlockRenderer** receives `container` as a new prop and passes it through to `resolveComponentProps()`, which includes it in the assembled `GlyphComponentProps` object.

### Wrapper div

`ContainerMeasure` adds a `<div style={{ width: '100%' }}>` wrapper to attach the ResizeObserver ref. This is a block-level element that inherits the parent's width and does not alter layout. It sits between `LayoutProvider` and the document `<div>`, which is acceptable since no CSS selectors or layout assumptions depend on a direct parent-child relationship there.

### SSR / initial render

Default tier is `'wide'` when `width === 0` (before first measurement). This means the initial paint uses full layout. For compact containers, the observer fires on the next frame and triggers a re-render to the correct tier. In practice this produces a single-frame flash from wide to compact layout.

Mitigations:

- The flash is only visible when the component tree is large enough to be perceptible. Small documents render fast enough that the correction is invisible.
- Future: `GlyphDocumentProps` could accept `initialContainerWidth` for SSR or pre-known container sizes, allowing the first render to use the correct tier.

---

## 6. Rollout Phases

### Phase 1: Infrastructure + test helpers

- `ContainerTier`, `ContainerContext` types
- `resolveTier()` with hysteresis + unit tests
- `ContainerMeasure` component + tests
- Extend `GlyphComponentProps`, update `resolveComponentProps`
- Wire into `GlyphDocument`
- Update `createMockProps` and `mockProps` helpers with default `container`
- Verify all existing tests pass (they'll get `container: { width: 0, tier: 'wide' }`)

### Phase 2: Grid components (Card, KPI, Infographic)

- Apply tier-based column clamping
- Add Storybook stories at chat/docs/wide widths
- Unit tests for each tier

### Phase 3: Table + Comparison

- Table: add `overflowX: 'auto'` wrapper and font reduction at compact (Comparison already has overflow wrapper)
- Comparison: reduce font and cell padding at compact
- Stories and tests

### Phase 4: SVG components (Graph, Flowchart, Architecture, MindMap, Sequence, Chart)

- Height constraint adjustment, spacing reduction
- Chart compact-tier margin reduction
- Stories and tests

---

## 7. Testing

### Unit tests

- `resolveTier()`: boundary values (0, 483, 484, 499, 500, 883, 884, 899, 900), hysteresis both directions
- `ContainerMeasure`: mock ResizeObserver, verify callback
- Per-component: mock `container` prop at each tier, verify layout output

### Storybook

- Storybook renders components in isolation via `mockProps()` — the runtime's `ContainerMeasure` is not involved. Stories set the `container` prop directly:
  ```typescript
  export const ChatWidth: Story = {
    args: mockProps(sampleData, {
      container: { width: 400, tier: 'compact' },
    }),
    decorators: [(Story) => <div style={{ width: '400px' }}><Story /></div>],
  };
  ```
- The decorator constrains visual width for accurate rendering; the `container` prop drives the component's layout logic
- Each adapted component should have stories for all three tiers (compact at 400px, standard at 700px, wide at 1000px)

### E2E (Playwright)

- Test Card/KPI column collapse at narrow viewports
- Verify Table scroll wrapper at compact width

---

## 8. Non-goals

- Viewport-based media queries (all adaptation is container-based)
- Schema changes (YAML authoring format unchanged)
- CSS file introduction (inline-style architecture preserved)
- Animated transitions between tiers (tier changes during resize should snap immediately; animation would delay layout correction and risk intermediate broken states)
- Print layout changes (separate concern, already partially handled)

---

## 9. Open question

**Dashboard layout: document-level vs block-level measurement.** In dashboard mode, blocks sit in CSS grid cells that may be narrower than the document container. Phase 1 measures at the document level. Block-level measurement (if needed for dashboard mode) is a future enhancement.
