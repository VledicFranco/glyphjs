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
 * Uses z.union([z.string(), z.array(z.any())]) so that:
 * - JSON Schema generates anyOf:[string, array] (correctly rejects numbers etc.)
 * - TypeScript infers string | any[], which is assignable to string | InlineNode[]
 */

export const inlineContentSchema = z.union([z.string(), z.array(z.any())]);
