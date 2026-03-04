import { rowsSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Rows } from './Rows.js';
import type { RowsData } from './Rows.js';

export const rowsDefinition: GlyphComponentDefinition<RowsData> = {
  type: 'ui:rows',
  schema: rowsSchema,
  render: Rows,
};

export { Rows };
export type { RowsData };
