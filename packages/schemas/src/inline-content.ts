import { z } from 'zod';

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
 * InlineNode items are always plain objects, so `z.array(z.unknown())`
 * covers the array branch without pulling in the recursive InlineNode types.
 */
export const inlineContentSchema = z.union([z.string(), z.array(z.unknown())]);
