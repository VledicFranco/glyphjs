import { decisiontreeSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { DecisionTree } from './DecisionTree.js';
import type { DecisionTreeData } from './DecisionTree.js';

export const decisionTreeDefinition: GlyphComponentDefinition<DecisionTreeData> = {
  type: 'ui:decisiontree',
  schema: decisiontreeSchema as unknown as GlyphComponentDefinition<DecisionTreeData>['schema'],
  render: DecisionTree,
};

export { DecisionTree } from './DecisionTree.js';
export type {
  DecisionTreeData,
  DecisionTreeNode,
  DecisionTreeEdge,
  DecisionTreeNodeType,
  DecisionTreeSentiment,
  DecisionTreeOrientation,
} from './DecisionTree.js';
