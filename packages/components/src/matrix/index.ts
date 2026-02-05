import { matrixSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Matrix } from './Matrix.js';
import type { MatrixData, MatrixColumn, MatrixRow } from './Matrix.js';

export const matrixDefinition: GlyphComponentDefinition<MatrixData> = {
  type: 'ui:matrix',
  schema: matrixSchema,
  render: Matrix,
};

export { Matrix };
export type { MatrixData, MatrixColumn, MatrixRow };
