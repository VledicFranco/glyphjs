# RFC-008: FileTree

- **Status:** Implemented
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P6
- **Complexity:** M
- **Block type:** `ui:filetree`

---

## 1. Summary

A file/directory tree component for displaying hierarchical structures with expand/collapse, file type icons, and optional annotations.

## 2. Motivation

LLMs constantly describe project layouts: "Your project structure should look like this..." Today this is rendered as a Markdown code block with ASCII art (`├──`, `└──`), which is fragile and non-interactive. A FileTree component provides collapsible directories, type-appropriate icons, and optional file annotations (e.g., "new", "modified").

## 3. Schema

````yaml
```ui:filetree
root: my-project
tree:
  - name: src
    children:
      - name: index.ts
        annotation: entry point
      - name: components
        children:
          - name: App.tsx
          - name: Header.tsx
            annotation: new
  - name: package.json
  - name: tsconfig.json
  - name: README.md
````

````

### Zod schema

```typescript
const fileNodeSchema: z.ZodType = z.object({
  name: z.string(),
  annotation: z.string().optional(),
  children: z.array(z.lazy(() => fileNodeSchema)).optional(),
});

const filetreeSchema = z.object({
  root: z.string().optional(),
  tree: z.array(fileNodeSchema).min(1),
  defaultExpanded: z.boolean().default(true),
});
````

## 4. Visual design

- Indented tree with vertical guide lines connecting siblings.
- **Directories** (nodes with `children`): folder icon, clickable to expand/collapse.
- **Files** (leaf nodes): file icon. Icon variant based on extension (`.ts`/`.tsx` → TypeScript, `.json` → JSON, `.md` → Markdown, etc.). Default: generic file icon.
- **Annotations**: rendered as a muted badge/tag next to the file name.
- `defaultExpanded: true` means all directories start open. `false` means all start collapsed.
- Root label (if provided) rendered at the top as a bold directory name.
- Icons rendered as inline SVG or Unicode characters to avoid icon font dependencies.

## 5. Accessibility

- Rendered as a nested `<ul>` tree with `role="tree"` on the root and `role="treeitem"` on each node.
- Directories have `aria-expanded` indicating open/closed state.
- Keyboard: ArrowUp/Down to navigate items, ArrowLeft to collapse or move to parent, ArrowRight to expand or move to first child, Enter to toggle.
- Annotations included in `aria-label` (e.g., "Header.tsx, new").

## 6. Implementation notes

- The recursive `fileNodeSchema` uses `z.lazy()` for self-referential validation.
- File type detection is purely by extension — no need for MIME types.
- Keep icons simple: 2–3 SVG paths (folder, file, specialized file). Can expand icon coverage over time.
- The component is self-contained — no layout engine needed. Recursive React rendering of the tree structure.
- Keyboard navigation follows the WAI-ARIA Treeview pattern (ArrowUp/Down, ArrowLeft/Right, Home/End, Enter). This is the primary source of complexity — implementing the full keyboard model with roving tabindex across a recursive tree is non-trivial.
- `defaultExpanded` applies to all directories. Per-node expansion state could be added later but isn't needed for v1.
