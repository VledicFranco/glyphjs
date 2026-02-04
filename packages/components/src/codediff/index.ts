import { codediffSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { CodeDiff } from './CodeDiff.js';
import type { CodeDiffData } from './CodeDiff.js';

export const codeDiffDefinition: GlyphComponentDefinition<CodeDiffData> = {
  type: 'ui:codediff',
  schema: codediffSchema,
  render: CodeDiff,
};

export { CodeDiff };
export type { CodeDiffData } from './CodeDiff.js';
export { computeDiff } from './diff.js';
export type { DiffLine, DiffLineKind } from './diff.js';
