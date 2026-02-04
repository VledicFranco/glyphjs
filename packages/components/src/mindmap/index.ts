import { mindmapSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { MindMap } from './MindMap.js';
import type { MindMapData } from './MindMap.js';

export const mindMapDefinition: GlyphComponentDefinition<MindMapData> = {
  type: 'ui:mindmap',
  schema: mindmapSchema as unknown as GlyphComponentDefinition<MindMapData>['schema'],
  render: MindMap,
};

export { MindMap } from './MindMap.js';
export type { MindMapData } from './MindMap.js';
