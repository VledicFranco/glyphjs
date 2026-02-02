# Component Development Lifecycle

This document defines the protocol for introducing a new Glyph UI component, from initial schema through documentation and validation.

Throughout this guide, replace `widget` / `Widget` / `WidgetData` with your actual component name.

---

## Naming conventions

All names derive from a single lowercase identifier (e.g., `widget`):

| Context                   | Pattern                           | Example                         |
| ------------------------- | --------------------------------- | ------------------------------- |
| Schema key (registry map) | `widget`                          | `['widget', widgetSchema]`      |
| Block type                | `ui:widget`                       | ` ```ui:widget ` in Markdown    |
| Directory                 | `packages/components/src/widget/` | —                               |
| React component           | `Widget`                          | `export function Widget(...)`   |
| Data interface            | `WidgetData`                      | `export interface WidgetData`   |
| Component definition      | `widgetDefinition`                | `export const widgetDefinition` |
| Schema export             | `widgetSchema`                    | `export const widgetSchema`     |
| Storybook title           | `Components/Widget`               | `title: 'Components/Widget'`    |
| Storybook story ID        | `components-widget--default`      | Used in e2e `storyUrl()`        |
| Docs slug                 | `components/widget`               | MDX at `components/widget.mdx`  |

---

## Phase 1 — Schema

Define the data shape that authors write in YAML inside ` ```ui:widget ` code blocks.

### 1.1 Create the Zod schema

**Create** `packages/schemas/src/widget.ts`

```typescript
import { z } from 'zod';

export const widgetSchema = z.object({
  label: z.string(),
  value: z.number().optional(),
});
```

### 1.2 Register the schema

**Modify** `packages/schemas/src/registry.ts` — import and add to the `entries` array:

```typescript
import { widgetSchema } from './widget.js';

const entries: [string, z.ZodType][] = [
  // ...existing entries...
  ['widget', widgetSchema],
];
```

The key `'widget'` is the part after `ui:` in the block type. The compiler uses this map to validate YAML data automatically — no compiler changes are needed.

### 1.3 Export the schema

**Modify** `packages/schemas/src/index.ts` — add the barrel export:

```typescript
export { widgetSchema } from './widget.js';
```

---

## Phase 2 — Component and unit tests

### 2.1 Implement the React component

**Create** `packages/components/src/widget/Widget.tsx`

```typescript
import type { ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

export interface WidgetData {
  label: string;
  value?: number;
}

export function Widget({ data, block }: GlyphComponentProps<WidgetData>): ReactElement {
  const baseId = `glyph-widget-${block.id}`;

  return (
    <div
      id={baseId}
      role="region"
      aria-label={data.label}
      style={{
        fontFamily: 'var(--glyph-font-body, inherit)',
        color: 'var(--glyph-text, inherit)',
        border: '1px solid var(--glyph-border, #dce1e8)',
        borderRadius: 'var(--glyph-radius-md, 0.1875rem)',
        padding: 'var(--glyph-spacing-md, 1rem)',
      }}
    >
      {data.label}: {data.value ?? '\u2014'}
    </div>
  );
}
```

**Theming rules:**

- Use CSS custom properties (`var(--glyph-*, fallback)`) for all colors, fonts, spacing, and borders. Never use `theme.isDark` or `theme.resolveVar()` — CSS vars are set by the consumer's theme wrapper and by the Storybook decorator, so both light and dark themes work automatically.
- Use existing global variables (`--glyph-text`, `--glyph-border`, `--glyph-surface`, etc.) whenever possible. Only introduce component-specific variables (`--glyph-widget-*`) when the component needs styling that doesn't map to an existing global variable.
- Every `var()` must include a sensible light-theme fallback as the second argument so the component renders correctly even without a theme wrapper.

**Accessibility rules:**

- Use `block.id` (via a prefix like `glyph-widget-${block.id}`) to generate unique DOM IDs. This is essential when multiple instances of the same component appear in a document, and for ARIA `id`/`aria-controls`/`aria-labelledby` relationships.
- Use semantic HTML elements and ARIA roles appropriate to the component's purpose.
- Support keyboard navigation for interactive components.

**Data interface:**

- The `WidgetData` interface must match the Zod schema from Phase 1 exactly.
- Destructure only the props you use from `GlyphComponentProps<T>` (commonly `data` and `block`).

### 2.2 Create the component definition and barrel export

**Create** `packages/components/src/widget/index.ts`

```typescript
import { widgetSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Widget } from './Widget.js';
import type { WidgetData } from './Widget.js';

export const widgetDefinition: GlyphComponentDefinition<WidgetData> = {
  type: 'ui:widget',
  schema: widgetSchema,
  render: Widget,
};

export { Widget };
export type { WidgetData };
```

### 2.3 Export from the package barrel

**Modify** `packages/components/src/index.ts`:

```typescript
export { widgetDefinition, Widget } from './widget/index.js';
export type { WidgetData } from './widget/index.js';
```

### 2.4 Add to BlockType (optional, recommended)

**Modify** `packages/types/src/ir.ts` — add the literal to the `BlockType` union:

```typescript
export type BlockType =
  // ...existing types...
  | 'ui:widget'
  // Extensible
  | `ui:${string}`;
```

The catch-all `` `ui:${string}` `` already makes this work without the explicit literal, but listing it improves IDE autocompletion and serves as documentation.

### 2.5 Unit tests

**Create** `packages/components/src/widget/__tests__/Widget.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Widget } from '../Widget.js';
import type { WidgetData } from '../Widget.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Widget', () => {
  it('renders the label', () => {
    const props = createMockProps<WidgetData>(
      { label: 'Score', value: 42 },
      'ui:widget',
    );
    render(<Widget {...props} />);
    expect(screen.getByText(/Score/)).toBeInTheDocument();
  });

  it('has an accessible role', () => {
    const props = createMockProps<WidgetData>(
      { label: 'Score', value: 42 },
      'ui:widget',
    );
    render(<Widget {...props} />);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Score');
  });
});
```

Use `createMockProps<T>(data, blockType)` from `packages/components/src/__tests__/helpers.ts`.

Minimum test coverage:

- Renders without crashing with minimal valid data
- Key data fields appear in the DOM
- ARIA roles and labels are correct
- Interactive states work (click, keyboard) for interactive components
- Optional fields handled gracefully when absent

Run with: `pnpm --filter @glyphjs/components test`

---

## Phase 3 — Storybook

### 3.1 Stories

**Create** `packages/components/src/widget/Widget.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Widget } from './Widget.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { WidgetData } from './Widget.js';

const meta: Meta<typeof Widget> = {
  component: Widget,
  title: 'Components/Widget',
};

export default meta;
type Story = StoryObj<typeof Widget>;

export const Default: Story = {
  args: mockProps<WidgetData>(
    { label: 'Score', value: 42 },
    { block: mockBlock({ id: 'widget-default', type: 'ui:widget' }) },
  ),
};

export const NoValue: Story = {
  args: mockProps<WidgetData>(
    { label: 'Pending' },
    { block: mockBlock({ id: 'widget-no-value', type: 'ui:widget' }) },
  ),
};
```

Use `mockProps<T>(data, overrides)` and `mockBlock(overrides)` from `packages/components/src/__storybook__/data.ts`.

Guidelines:

- Create one story per meaningful variant (e.g., `Default`, `WithOptionalField`, `Empty`, `LongContent`).
- Do NOT create separate light/dark theme stories — use the Storybook toolbar theme toggle.
- Verify the component in both themes via the toggle before moving on.

### 3.2 Theme variables (if needed)

If your component introduces custom CSS variables (e.g., `--glyph-widget-header-bg`), add them to both theme maps in `packages/components/.storybook/preview.ts`:

```typescript
const LIGHT_THEME_VARS: Record<string, string> = {
  // ...existing vars...
  '--glyph-widget-header-bg': '#eef1f5',
};

const DARK_THEME_VARS: Record<string, string> = {
  // ...existing vars...
  '--glyph-widget-header-bg': '#111820',
};
```

Always add to **both** maps. A missing dark-theme variable will cause the component to fall back to its light-theme default, producing unreadable contrast in dark mode.

### 3.3 Visual check

Open Storybook (`pnpm --filter @glyphjs/components storybook`) and verify:

1. All stories render correctly in **light** theme.
2. Switch to **dark** theme — all text, backgrounds, and borders remain readable.
3. Check the **Accessibility** panel (addon-a11y) — resolve any violations.

---

## Phase 4 — Documentation and consumer registration

### 4.1 Register in consumer apps

Every app that renders Glyph documents needs to import and register the new definition.

**Modify** `apps/demo/src/App.tsx` — import `widgetDefinition` from `@glyphjs/components` and add it to the `components` array in `createGlyphRuntime()`.

**Modify** `apps/docs/src/components/GlyphPreview.tsx` — import and add to the `allComponents` array.

**Modify** `apps/docs/src/components/Playground.tsx` — import and add to the `allComponents` array.

### 4.2 Create the docs page

**Create** `apps/docs/src/content/docs/components/widget.mdx`

```mdx
---
title: Widget
description: Brief description of what the component renders.
---

import GlyphPreview from '../../../components/GlyphPreview.tsx';

The **Widget** component (`ui:widget`) renders ...

## Example

export const example = `\`\`\`ui:widget
label: Score
value: 42
\`\`\``;

<GlyphPreview client:only="react" source={example} />

<details>
<summary>Source</summary>

\`\`\`yaml
\`\`\`ui:widget
label: Score
value: 42
\`\`\`
\`\`\`

</details>

## Properties

| Property | Type     | Required | Default | Description              |
| -------- | -------- | -------- | ------- | ------------------------ |
| `label`  | `string` | Yes      | —       | Display label            |
| `value`  | `number` | No       | —       | Numeric value to display |

## Accessibility

- Describe semantic roles, ARIA attributes, and keyboard support.
```

### 4.3 Add to the docs sidebar

**Modify** `apps/docs/astro.config.mjs` — add an entry inside the `Components` sidebar group, in alphabetical order:

```javascript
{ label: 'Components', items: [
  // ...existing entries...
  { label: 'Widget', slug: 'components/widget' },
]},
```

---

## Phase 5 — E2E tests

These tests require Storybook stories (Phase 3) and the docs page (Phase 4) to exist.

### 5.1 Storybook E2E

**Create** `tests/e2e/visual/widget.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Widget', () => {
  test('renders correctly', async ({ page }) => {
    await page.goto(storyUrl('components-widget--default'));
    await expect(page.locator('text=Score')).toBeVisible();
  });
});
```

The `storyUrl(storyId)` helper from `tests/e2e/setup.ts` builds the Storybook iframe URL. The story ID follows the pattern: lowercase title with dashes, double-dash before the story export name (e.g., `components-widget--default` for `Components/Widget` story `Default`).

### 5.2 Docs page E2E

**Create** `tests/e2e/docs/widget.doc.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Widget doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('widget'));
    await waitForAllPreviews(page, 1); // match the number of GlyphPreview instances
  });

  test('preview renders without error', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();
    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });
});
```

Helpers are in `tests/e2e/docs/setup.ts`:

- `docsComponentUrl(name)` — builds `/glyphjs/components/{name}/`
- `getPreviewContainers(page)` — locates `[data-glyph-preview]` elements
- `waitForAllPreviews(page, count)` — waits until all previews report `status="ready"`
- `assertPreviewRendered(locator)` — checks ready status and non-zero dimensions

---

## Phase 6 — Validation checklist

Run all of the following before opening a PR:

```bash
# Lint
pnpm lint

# Type-check and build
pnpm --filter @glyphjs/schemas build
pnpm --filter @glyphjs/components build
pnpm --filter @glyphjs/docs build

# Unit tests
pnpm --filter @glyphjs/components test

# E2E tests (starts Storybook, demo, and docs servers automatically)
npx playwright test

# Bundle size (should stay within limits in .size-limit.json)
pnpm size
```

Manual Storybook checks:

1. Component renders correctly in **light** theme.
2. Switch to **dark** theme — all text, backgrounds, and borders remain readable.
3. **Accessibility** panel shows zero violations.
4. Interactive features (if any) work: click, keyboard navigation.

---

## File inventory

A complete new component touches these files:

| Action | File                                                             |
| ------ | ---------------------------------------------------------------- |
| CREATE | `packages/schemas/src/widget.ts`                                 |
| MODIFY | `packages/schemas/src/registry.ts`                               |
| MODIFY | `packages/schemas/src/index.ts`                                  |
| CREATE | `packages/components/src/widget/Widget.tsx`                      |
| CREATE | `packages/components/src/widget/index.ts`                        |
| MODIFY | `packages/components/src/index.ts`                               |
| MODIFY | `packages/types/src/ir.ts` (recommended)                         |
| MODIFY | `packages/components/.storybook/preview.ts` (if custom CSS vars) |
| CREATE | `packages/components/src/widget/__tests__/Widget.test.tsx`       |
| CREATE | `packages/components/src/widget/Widget.stories.tsx`              |
| MODIFY | `apps/demo/src/App.tsx`                                          |
| MODIFY | `apps/docs/src/components/GlyphPreview.tsx`                      |
| MODIFY | `apps/docs/src/components/Playground.tsx`                        |
| CREATE | `apps/docs/src/content/docs/components/widget.mdx`               |
| MODIFY | `apps/docs/astro.config.mjs`                                     |
| CREATE | `tests/e2e/visual/widget.spec.ts`                                |
| CREATE | `tests/e2e/docs/widget.doc.spec.ts`                              |

9 new files, 8 modified files (9 if custom CSS vars are needed).
