import { z } from 'zod';

// ─── Architecture Schema ────────────────────────────────────

const iconEnum = z.enum([
  'server',
  'database',
  'queue',
  'cache',
  'loadbalancer',
  'function',
  'storage',
  'gateway',
  'user',
  'cloud',
  'container',
  'network',
]);

const baseNode = z.object({
  id: z.string(),
  label: z.string(),
  icon: iconEnum.optional(),
  type: z.literal('zone').optional(),
  style: z.record(z.string()).optional(),
});

export interface ArchitectureNode {
  id: string;
  label: string;
  icon?:
    | 'server'
    | 'database'
    | 'queue'
    | 'cache'
    | 'loadbalancer'
    | 'function'
    | 'storage'
    | 'gateway'
    | 'user'
    | 'cloud'
    | 'container'
    | 'network';
  type?: 'zone';
  children?: ArchitectureNode[];
  style?: Record<string, string>;
}

const architectureNodeSchema: z.ZodType<ArchitectureNode> = baseNode.extend({
  children: z.lazy(() => z.array(architectureNodeSchema)).optional(),
});

export const architectureSchema = z.object({
  title: z.string().optional(),
  children: z.array(architectureNodeSchema),
  edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: z.string().optional(),
      type: z.enum(['sync', 'async', 'data']).optional(),
      style: z.record(z.string()).optional(),
    }),
  ),
  layout: z.enum(['top-down', 'left-right', 'bottom-up']).optional(),
});
