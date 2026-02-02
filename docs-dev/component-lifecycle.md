# Component Development Lifecycle

This document defines the protocol for introducing a new Glyph UI component, from initial schema through documentation and validation.

Throughout this guide, replace `widget` / `Widget` / `WidgetData` with your actual component name.

---

## Phase 1 — Schema

Define the data shape that authors will write in YAML.

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

### 1.3 Export the schema

**Modify** `packages/schemas/src/index.ts` — add the barrel export:

```typescript
export { widgetSchema } from './widget.js';
```

At this point the compiler will automatically validate `ui:widget` YAML blocks against your schema (no compiler changes needed).

---

## Phase 2 — Component

### 2.1 Implement the React component

**Create** `packages/components/src/widget/Widget.tsx`

```typescript
import type { ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

export interface WidgetData {
  label: string;
  value?: number;
}

export function Widget({ data }: GlyphComponentProps<WidgetData>): ReactElement {
  return (
    <div style={{ fontFamily: 'var(--glyph-font-body, inherit)' }}>
      {data.label}: {data.value ?? '—'}
    </div>
  );
}
```

Guidelines:

- Use CSS custom properties (`var(--glyph-*, fallback)`) for all colors, fonts, spacing, and borders. Never use `theme.isDark` or `theme.resolveVar()` — this ensures the Storybook theme toggle and any consumer theme work automatically.
- The `WidgetData` interface must match the Zod schema from Phase 1.
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

**Modify** `packages/types/src/ir.ts` — add the literal to the `BlockType` union for discoverability:

```typescript
export type BlockType =
  // ...existing types...
  | 'ui:widget'
  // Extensible
  | `ui:${string}`;
```

The `| \`ui:${string}\`` catch-all already makes this work without the explicit literal, but listing it aids documentation and IDE autocompletion.

---

## Phase 3 — Register in consumers

Every app that renders Glyph documents needs to know about the new definition.

### 3.1 Demo app

**Modify** `apps/demo/src/App.tsx` — import `widgetDefinition` from `@glyphjs/components` and add it to the `components` array in `createGlyphRuntime()`.

### 3.2 Docs preview component

**Modify** `apps/docs/src/components/GlyphPreview.tsx` — import and add to the `allComponents` array.

### 3.3 Docs playground

**Modify** `apps/docs/src/components/Playground.tsx` — import and add to the `allComponents` array.

---

## Phase 4 — Testing

### 4.1 Unit tests

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
});
```

Use `createMockProps<T>(data, blockType)` from `packages/components/src/__tests__/helpers.ts`.

Minimum coverage expectations:

- Renders without crashing with minimal valid data
- Key data fields appear in the DOM
- ARIA roles and labels are present (if applicable)
- Interactive states work (click, keyboard) if the component is interactive

Run with: `pnpm --filter @glyphjs/components test`

### 4.2 Storybook stories

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
```

Use `mockProps<T>(data, overrides)` and `mockBlock(overrides)` from `packages/components/src/__storybook__/data.ts`.

Guidelines:

- Create one story per meaningful variant (e.g., `Default`, `WithOptionalField`, `Empty`).
- Do NOT create separate light/dark theme stories — use the Storybook toolbar theme toggle.
- Verify the component looks correct in both light and dark themes via the toggle.

### 4.3 E2E tests — Storybook

**Create** `tests/e2e/visual/widget.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Widget', () => {
  test('renders correctly', async ({ page }) => {
    await page.goto(storyUrl('components-widget--default'));
    // Assert on visible structure
    await expect(page.locator('text=Score')).toBeVisible();
  });
});
```

The `storyUrl(storyId)` helper builds the Storybook iframe URL. The story ID follows the pattern: lowercase title with dashes, double-dash before the story name (e.g., `components-widget--default`).

### 4.4 E2E tests — docs page

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
    await waitForAllPreviews(page, 1); // match the number of examples
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

Run all e2e: `npx playwright test`

---

## Phase 5 — Documentation

### 5.1 Create the docs page

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

### 5.2 Add to the docs sidebar

**Modify** `apps/docs/astro.config.mjs` — add an entry inside the `Components` sidebar group:

```javascript
{ label: 'Components', items: [
  // ...existing entries...
  { label: 'Widget', slug: 'components/widget' },
]},
```

---

## Phase 6 — Validation checklist

Run all of the following before opening a PR:

```bash
# Lint
pnpm lint

# Type check
pnpm --filter @glyphjs/schemas build
pnpm --filter @glyphjs/components build

# Unit tests
pnpm --filter @glyphjs/components test

# E2E tests (starts Storybook, demo, and docs servers automatically)
npx playwright test

# Bundle size (should stay within limits in .size-limit.json)
pnpm size
```

Verify manually in Storybook:

1. Component renders correctly in the **light** theme.
2. Switch to **dark** theme via the toolbar — all text, backgrounds, and borders remain readable.
3. Interactive features (if any) work: click, keyboard navigation, screen reader.

---

## File inventory

A complete new component touches these files:

| Action | File                                                       |
| ------ | ---------------------------------------------------------- |
| CREATE | `packages/schemas/src/widget.ts`                           |
| MODIFY | `packages/schemas/src/registry.ts`                         |
| MODIFY | `packages/schemas/src/index.ts`                            |
| CREATE | `packages/components/src/widget/Widget.tsx`                |
| CREATE | `packages/components/src/widget/index.ts`                  |
| MODIFY | `packages/components/src/index.ts`                         |
| MODIFY | `packages/types/src/ir.ts` (optional)                      |
| MODIFY | `apps/demo/src/App.tsx`                                    |
| MODIFY | `apps/docs/src/components/GlyphPreview.tsx`                |
| MODIFY | `apps/docs/src/components/Playground.tsx`                  |
| CREATE | `packages/components/src/widget/__tests__/Widget.test.tsx` |
| CREATE | `packages/components/src/widget/Widget.stories.tsx`        |
| CREATE | `tests/e2e/visual/widget.spec.ts`                          |
| CREATE | `tests/e2e/docs/widget.doc.spec.ts`                        |
| CREATE | `apps/docs/src/content/docs/components/widget.mdx`         |
| MODIFY | `apps/docs/astro.config.mjs`                               |

8 new files, 8 modified files.
