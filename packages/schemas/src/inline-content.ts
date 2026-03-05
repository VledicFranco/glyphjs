import { z } from 'zod';
import type { InlineNode } from '@glyphjs/types';

/**
 * Accepts either a plain string or an already-processed InlineNode array.
 *
 * Fields listed in MARKDOWN_FIELD_MAP are converted from `string` to
 * `InlineNode[]` by the compiler when `markdown: true` is set on a block.
 * The runtime re-validates IR data with the component's Zod schema, so any
 * field that can become an InlineNode array must accept both types here —
 * otherwise the runtime logs a spurious schema-validation warning and falls
 * back to raw data even though the component renders correctly.
 *
 * Uses `z.custom` so the TypeScript output type is exactly `string | InlineNode[]`,
 * matching the component data interfaces without requiring casts.
 */
export const inlineContentSchema = z.custom<string | InlineNode[]>(
  (val) => typeof val === 'string' || Array.isArray(val),
);
