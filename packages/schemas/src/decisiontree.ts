import { z } from 'zod';

// ─── Node Schema ─────────────────────────────────────────────

const decisiontreeNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['question', 'outcome']).default('question'),
  label: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// ─── Edge Schema ─────────────────────────────────────────────

const decisiontreeEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  condition: z.string().optional(),
});

// ─── Tree Schema (with tree-validity refinement) ────────────

export const decisiontreeSchema = z
  .object({
    title: z.string().optional(),
    nodes: z.array(decisiontreeNodeSchema).min(1),
    edges: z.array(decisiontreeEdgeSchema).default([]),
    orientation: z.enum(['left-right', 'top-down']).default('left-right'),
  })
  .superRefine((data, ctx) => {
    const nodeIds = new Set<string>();
    for (const node of data.nodes) {
      if (nodeIds.has(node.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate node id: ${node.id}`,
          path: ['nodes'],
        });
        return;
      }
      nodeIds.add(node.id);
    }

    // Every edge endpoint must reference a known node
    for (const edge of data.edges) {
      if (!nodeIds.has(edge.from)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `edge references unknown node: ${edge.from}`,
          path: ['edges'],
        });
        return;
      }
      if (!nodeIds.has(edge.to)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `edge references unknown node: ${edge.to}`,
          path: ['edges'],
        });
        return;
      }
    }

    // Count parents for each node — every non-root must have exactly one parent,
    // and no node may have multiple parents (tree structure).
    const parentCount = new Map<string, number>();
    for (const id of nodeIds) parentCount.set(id, 0);
    for (const edge of data.edges) {
      parentCount.set(edge.to, (parentCount.get(edge.to) ?? 0) + 1);
    }

    const roots: string[] = [];
    for (const [id, count] of parentCount) {
      if (count === 0) roots.push(id);
      if (count > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `node has multiple parents (tree requires exactly one): ${id}`,
          path: ['edges'],
        });
        return;
      }
    }

    if (roots.length === 0) {
      // If there are no roots, there must be a cycle among all nodes
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'decision tree has no root (cycle detected)',
        path: ['nodes'],
      });
      return;
    }
    if (roots.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `decision tree must have exactly one root, found ${String(roots.length)}: ${roots.join(', ')}`,
        path: ['nodes'],
      });
      return;
    }

    // Confirm reachability from the single root — any unreachable node is
    // either an orphan (covered by parent-count) or part of an unreached
    // cycle (all-cycle case is caught above). This also catches cycles that
    // leave the root reachable but leave a disconnected ring behind.
    const root = roots[0];
    if (root === undefined) return;
    const adjacency = new Map<string, string[]>();
    for (const id of nodeIds) adjacency.set(id, []);
    for (const edge of data.edges) {
      const list = adjacency.get(edge.from);
      if (list) list.push(edge.to);
    }

    const visited = new Set<string>();
    const queue: string[] = [root];
    while (queue.length > 0) {
      const current = queue.shift();
      if (current === undefined) break;
      if (visited.has(current)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `cycle detected at node: ${current}`,
          path: ['edges'],
        });
        return;
      }
      visited.add(current);
      for (const next of adjacency.get(current) ?? []) {
        queue.push(next);
      }
    }

    if (visited.size !== nodeIds.size) {
      const orphans: string[] = [];
      for (const id of nodeIds) {
        if (!visited.has(id)) orphans.push(id);
      }
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `orphan nodes not reachable from root: ${orphans.join(', ')}`,
        path: ['nodes'],
      });
    }
  });
