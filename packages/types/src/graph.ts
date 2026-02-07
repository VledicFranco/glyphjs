// ─── Graph Shared Types ───────────────────────────────────────

import type { InlineNode } from './block-data.js';

export interface GraphNode {
  id: string;
  label: string | InlineNode[];
  type?: string;
  style?: Record<string, string>;
  group?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string | InlineNode[];
  type?: string;
  cardinality?: '1:1' | '1:N' | 'N:1' | 'N:M';
  style?: Record<string, string>;
}
