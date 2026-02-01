import { tableSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Table } from './Table.js';
import type { TableData } from './Table.js';

export const tableDefinition: GlyphComponentDefinition<TableData> = {
  type: 'ui:table',
  schema: tableSchema,
  render: Table,
};

export { Table };
export type { TableData };
