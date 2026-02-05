import { annotateSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Annotate } from './Annotate.js';
import type { AnnotateData, AnnotateLabel, Annotation } from './Annotate.js';

export const annotateDefinition: GlyphComponentDefinition<AnnotateData> = {
  type: 'ui:annotate',
  schema: annotateSchema,
  render: Annotate,
};

export { Annotate };
export type { AnnotateData, AnnotateLabel, Annotation };
