# Migration Guide: v0.3 → v0.4

## Breaking Changes

### Graph Interaction Modes (Graph, Flowchart, Relation)

**What Changed:** The default zoom/pan interaction behavior for visualization components has changed.

**Previous Behavior (v0.3):**

- Scrolling over graphs would zoom immediately (no modifier key required)
- This caused UX issues when scrolling past graphs in documentation or long-form content
- Users frequently reported accidental zooming when trying to scroll

**New Behavior (v0.4):**

- Default interaction mode is now `'modifier-key'`
- Users must hold **Ctrl** (Windows/Linux) or **⌘ Cmd** (Mac) while scrolling to zoom
- Panning via click-and-drag still works normally
- A tooltip appears on first scroll attempt showing: "Ctrl+scroll to zoom"

---

## Affected Components

The following components now have a new `interactionMode` property:

1. **Graph** (`ui:graph`)
2. **Flowchart** (`ui:flowchart`)
3. **Relation** (`ui:relation`)

---

## Migration Steps

### If you want the old behavior

Add `interactionMode: always` to your component data:

```yaml
type: ui:graph
data:
  type: dag
  interactionMode: always # ← Restores v0.3 behavior
  nodes:
    - id: a
      label: Node A
  # ... rest of your data
```

```yaml
type: ui:flowchart
data:
  interactionMode: always # ← Restores v0.3 behavior
  nodes:
    - id: start
      type: start
      label: Begin
  # ... rest of your data
```

```yaml
type: ui:relation
data:
  interactionMode: always # ← Restores v0.3 behavior
  entities:
    - id: users
      label: Users
  # ... rest of your data
```

### If you're happy with the new default

**No action needed.** The new `modifier-key` mode is the default and provides a better UX for scrollable content.

### Alternative: Click-to-Activate Mode

If you want even more control, use `'click-to-activate'` mode:

```yaml
type: ui:graph
data:
  type: dag
  interactionMode: click-to-activate
  nodes:
    # ...
```

**Behavior:**

- Graph starts inactive (overlay shows "Click to interact")
- Click once to activate zoom/pan
- Press **Escape** or click outside to deactivate
- Visual feedback: active graphs show a highlighted border

---

## Why This Change?

### Problem

The previous "always zoom" behavior caused significant UX issues:

1. **Documentation frustration:** Users scrolling through docs would accidentally zoom graphs
2. **Long-form content:** Graphs in blog posts or tutorials interrupted natural scrolling
3. **Mobile issues:** Touch scrolling was particularly problematic
4. **Industry standard:** Most modern visualization tools (Google Maps, Figma, Miro) require modifier keys

### Solution

The new default (`modifier-key`) follows industry-standard interaction patterns:

- Respects user intent: scrolling = page navigation, Ctrl+scroll = zoom
- Better accessibility: clearer distinction between actions
- Preserves full functionality: all zoom/pan features still available

---

## Interaction Mode Reference

### `'modifier-key'` (New Default)

| Action            | Behavior                  |
| ----------------- | ------------------------- |
| Scroll            | No zoom (tooltip appears) |
| Ctrl/Cmd + Scroll | Zoom in/out               |
| Click and drag    | Pan around                |

**Use case:** Documentation, blogs, any scrollable content

### `'click-to-activate'`

| Action                  | Behavior                   |
| ----------------------- | -------------------------- |
| Initial state           | Inactive (overlay visible) |
| Click graph             | Activate interaction       |
| Scroll (active)         | Zoom in/out                |
| Click and drag (active) | Pan around                 |
| Escape key              | Deactivate                 |
| Click outside           | Deactivate                 |

**Use case:** Dense dashboards, galleries, when you want explicit opt-in

### `'always'` (Legacy)

| Action         | Behavior                |
| -------------- | ----------------------- |
| Scroll         | Zoom in/out immediately |
| Click and drag | Pan around              |

**Use case:** Standalone visualization apps, when zoom-first interaction is desired

---

## TypeScript Changes

If you're using TypeScript, the component data interfaces now include the optional `interactionMode` property:

```typescript
import type { GraphData } from '@glyphjs/components';

const graphData: GraphData = {
  type: 'dag',
  interactionMode: 'modifier-key', // 'modifier-key' | 'click-to-activate' | 'always'
  nodes: [
    // ...
  ],
  edges: [
    // ...
  ],
};
```

The same applies to `FlowchartData` and `RelationData` types.

---

## Schema Changes

The Zod schemas have been updated to include the new field:

```typescript
// @glyphjs/schemas
export const graphSchema = z.object({
  // ... existing fields
  interactionMode: z.enum(['modifier-key', 'click-to-activate', 'always']).default('modifier-key'),
});
```

If you're programmatically generating GlyphJS documents, the schema will validate the new field but won't require it (it has a default).

---

## Testing Your Migration

1. **Visual test:** Open your content and scroll past graphs
   - New default: Should not zoom
   - With `interactionMode: always`: Should zoom (old behavior)

2. **Interaction test:** Hold Ctrl/Cmd and scroll
   - Should zoom in/out smoothly
   - Tooltip should appear on first scroll attempt

3. **Panning test:** Click and drag on any graph
   - Should pan normally regardless of interaction mode

4. **Click-to-activate test:** Set `interactionMode: 'click-to-activate'`
   - Should show overlay when inactive
   - Click to activate
   - Escape should deactivate

---

## Questions or Issues?

If you encounter any problems with this migration:

1. Check that you're using `@glyphjs/components@^0.4.0`
2. Verify your interaction mode is set correctly
3. Open an issue at [github.com/yourusername/glyphjs](https://github.com/yourusername/glyphjs)

---

**Recommendation:** We strongly recommend using the new default (`modifier-key`) for better UX. Only use `always` mode if you have a specific use case that requires immediate zoom-on-scroll behavior.
