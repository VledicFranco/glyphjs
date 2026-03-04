import { columnsSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Columns } from './Columns.js';
import type { ColumnsData } from './Columns.js';

export const columnsDefinition: GlyphComponentDefinition<ColumnsData> = {
  type: 'ui:columns',
  schema: columnsSchema,
  render: Columns,
};

export { Columns };
export type { ColumnsData };
