// ─── Graph Shared Types ───────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  type?: string;
  style?: Record<string, string>;
  group?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  type?: string;
  cardinality?: '1:1' | '1:N' | 'N:1' | 'N:M';
  style?: Record<string, string>;
}
