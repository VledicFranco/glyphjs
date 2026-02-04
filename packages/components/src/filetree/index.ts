import { filetreeSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { FileTree } from './FileTree.js';
import type { FileTreeData } from './FileTree.js';

export const fileTreeDefinition: GlyphComponentDefinition<FileTreeData> = {
  type: 'ui:filetree',
  schema: filetreeSchema as unknown as GlyphComponentDefinition<FileTreeData>['schema'],
  render: FileTree,
};

export { FileTree } from './FileTree.js';
export type { FileTreeData } from './FileTree.js';
