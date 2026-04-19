import { z } from 'zod';

// ─── Sankey Schema ──────────────────────────────────────────
//
// Sankey is a strict DAG — cycles are rejected at validation time.
// Cycle detection uses Kahn's algorithm over the graph formed by the
// declared flows. Duplicate edges collapse into the same adjacency.
//
// Flow conservation (total-in == total-out at intermediate nodes) is
// intentionally NOT enforced here — authors often want to show a
// "dropped off" terminal flow without fully routing it.

const sankeyNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

const sankeyFlowSchema = z.object({
  from: z.string(),
  to: z.string(),
  value: z.number().positive(),
  label: z.string().optional(),
});

function hasCycle(
  nodes: readonly { id: string }[],
  flows: readonly { from: string; to: string }[],
): boolean {
  // Build adjacency + indegree restricted to declared node IDs.
  const ids = new Set(nodes.map((n) => n.id));
  const indegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const id of ids) {
    indegree.set(id, 0);
    adjacency.set(id, []);
  }

  for (const flow of flows) {
    if (!ids.has(flow.from) || !ids.has(flow.to)) continue;
    if (flow.from === flow.to) return true; // self-loop is a cycle
    const fromList = adjacency.get(flow.from);
    if (!fromList) continue;
    fromList.push(flow.to);
    indegree.set(flow.to, (indegree.get(flow.to) ?? 0) + 1);
  }

  // Kahn's algorithm — start from zero-indegree nodes, peel the DAG.
  const queue: string[] = [];
  for (const [id, deg] of indegree) {
    if (deg === 0) queue.push(id);
  }

  let visited = 0;
  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined) break;
    visited += 1;
    for (const next of adjacency.get(id) ?? []) {
      const nextDeg = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextDeg);
      if (nextDeg === 0) queue.push(next);
    }
  }

  // If we couldn't peel every node, a cycle exists.
  return visited !== ids.size;
}

export const sankeySchema = z
  .object({
    title: z.string().optional(),
    nodes: z.array(sankeyNodeSchema).min(2),
    flows: z.array(sankeyFlowSchema).min(1),
    orientation: z.enum(['left-right', 'top-down']).default('left-right'),
    unit: z.string().optional(),
  })
  .refine(
    (data) => {
      const ids = new Set(data.nodes.map((n) => n.id));
      return data.flows.every((f) => ids.has(f.from) && ids.has(f.to));
    },
    {
      message: 'Every flow must reference declared node IDs (from/to).',
      path: ['flows'],
    },
  )
  .refine((data) => !hasCycle(data.nodes, data.flows), {
    message: 'Sankey must be a DAG — cycles are not allowed.',
    path: ['flows'],
  });
