/**
 * Schema validation tests for doc examples
 *
 * Validates each component doc page's example data against the corresponding
 * Zod schema using plain JS objects.  Catches schema-vs-docs drift.
 */
import { describe, it, expect } from 'vitest';

import { calloutSchema } from '../../packages/schemas/src/callout';
import { tabsSchema } from '../../packages/schemas/src/tabs';
import { stepsSchema } from '../../packages/schemas/src/steps';
import { tableSchema } from '../../packages/schemas/src/table';
import { graphSchema } from '../../packages/schemas/src/graph';
import { chartSchema } from '../../packages/schemas/src/chart';
import { relationSchema } from '../../packages/schemas/src/relation';
import { timelineSchema } from '../../packages/schemas/src/timeline';
import { architectureSchema } from '../../packages/schemas/src/architecture';

// ─── Callout examples ───────────────────────────────────────

describe('Callout doc examples validate against schema', () => {
  it('warning callout with title', () => {
    const data = {
      type: 'warning',
      title: 'Breaking change in v2',
      content: 'The refs field now requires an explicit target type.',
    };
    expect(calloutSchema.safeParse(data).success).toBe(true);
  });

  it('info callout without title', () => {
    const data = {
      type: 'info',
      content: 'Glyph JS validates all YAML payloads at compile time using Zod schemas.',
    };
    expect(calloutSchema.safeParse(data).success).toBe(true);
  });

  it('tip callout', () => {
    const data = {
      type: 'tip',
      title: 'LLM authoring',
      content: 'LLMs generate callouts reliably because the schema is minimal.',
    };
    expect(calloutSchema.safeParse(data).success).toBe(true);
  });

  it('error callout', () => {
    const data = {
      type: 'error',
      title: 'Critical failure',
      content: 'The build pipeline has halted due to a compilation error.',
    };
    expect(calloutSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Tabs examples ──────────────────────────────────────────

describe('Tabs doc examples validate against schema', () => {
  it('3-tab example', () => {
    const data = {
      tabs: [
        { label: 'Overview', content: 'General overview of the Glyph JS framework.' },
        { label: 'API', content: 'The compile function accepts a Markdown string.' },
        { label: 'Examples', content: 'See the Gallery page for full examples.' },
      ],
    };
    expect(tabsSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Steps examples ─────────────────────────────────────────

describe('Steps doc examples validate against schema', () => {
  it('3-step example with statuses', () => {
    const data = {
      steps: [
        { title: 'Install Dependencies', status: 'completed', content: 'Run pnpm install.' },
        { title: 'Configure the Runtime', status: 'active', content: 'Create a runtime instance.' },
        {
          title: 'Render Documents',
          status: 'pending',
          content: 'Pass compiled IR to GlyphDocument.',
        },
      ],
    };
    expect(stepsSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Table examples ─────────────────────────────────────────

describe('Table doc examples validate against schema', () => {
  it('employee table with sortable columns', () => {
    const data = {
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'role', label: 'Role' },
        { key: 'department', label: 'Department' },
      ],
      rows: [
        { name: 'Alice', role: 'Engineer', department: 'Platform' },
        { name: 'Bob', role: 'Designer', department: 'Product' },
      ],
    };
    expect(tableSchema.safeParse(data).success).toBe(true);
  });

  it('gallery quarterly revenue table', () => {
    const data = {
      columns: [
        { key: 'quarter', label: 'Quarter' },
        { key: 'revenue', label: 'Revenue', sortable: true },
        { key: 'growth', label: 'Growth', sortable: true },
      ],
      rows: [
        { quarter: 'Q1', revenue: '$120k', growth: '—' },
        { quarter: 'Q2', revenue: '$185k', growth: '+54%' },
      ],
    };
    expect(tableSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Graph examples ─────────────────────────────────────────

describe('Graph doc examples validate against schema', () => {
  it('flowchart architecture diagram', () => {
    const data = {
      type: 'flowchart',
      nodes: [
        { id: 'client', label: 'Browser Client' },
        { id: 'api', label: 'API Gateway' },
        { id: 'auth', label: 'Auth Service' },
        { id: 'db', label: 'PostgreSQL' },
      ],
      edges: [
        { from: 'client', to: 'api', label: 'HTTPS' },
        { from: 'api', to: 'auth', label: 'JWT' },
        { from: 'api', to: 'db', label: 'SQL' },
      ],
    };
    expect(graphSchema.safeParse(data).success).toBe(true);
  });

  it('DAG pipeline graph', () => {
    const data = {
      type: 'dag',
      nodes: [
        { id: 'parser', label: 'Parser' },
        { id: 'compiler', label: 'Compiler' },
        { id: 'runtime', label: 'Runtime' },
      ],
      edges: [
        { from: 'parser', to: 'compiler' },
        { from: 'compiler', to: 'runtime' },
      ],
    };
    expect(graphSchema.safeParse(data).success).toBe(true);
  });

  it('mindmap graph', () => {
    const data = {
      type: 'mindmap',
      nodes: [
        { id: 'center', label: 'Glyph JS' },
        { id: 'parser', label: 'Parser' },
        { id: 'compiler', label: 'Compiler' },
      ],
      edges: [
        { from: 'center', to: 'parser' },
        { from: 'center', to: 'compiler' },
      ],
    };
    expect(graphSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Chart examples ─────────────────────────────────────────

describe('Chart doc examples validate against schema', () => {
  it('bar chart with axis config', () => {
    const data = {
      type: 'bar',
      series: [
        {
          name: 'Revenue',
          data: [
            { x: 'Q1', y: 120 },
            { x: 'Q2', y: 185 },
            { x: 'Q3', y: 210 },
            { x: 'Q4', y: 290 },
          ],
        },
      ],
      xAxis: { key: 'x', label: 'Quarter' },
      yAxis: { key: 'y', label: 'Revenue' },
    };
    expect(chartSchema.safeParse(data).success).toBe(true);
  });

  it('line chart', () => {
    const data = {
      type: 'line',
      series: [
        {
          name: 'Users',
          data: [
            { x: 'Jan', y: 100 },
            { x: 'Feb', y: 150 },
            { x: 'Mar', y: 200 },
          ],
        },
      ],
      xAxis: { key: 'x', label: 'Month' },
      yAxis: { key: 'y', label: 'Users' },
    };
    expect(chartSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Relation examples ──────────────────────────────────────

describe('Relation doc examples validate against schema', () => {
  it('user-posts ER diagram', () => {
    const data = {
      entities: [
        {
          id: 'users',
          label: 'User',
          attributes: [
            { name: 'id', type: 'uuid', primaryKey: true },
            { name: 'email', type: 'string' },
            { name: 'name', type: 'string' },
          ],
        },
        {
          id: 'posts',
          label: 'Post',
          attributes: [
            { name: 'id', type: 'uuid', primaryKey: true },
            { name: 'title', type: 'string' },
            { name: 'authorId', type: 'uuid' },
          ],
        },
      ],
      relationships: [{ from: 'users', to: 'posts', cardinality: '1:N', label: 'writes' }],
    };
    expect(relationSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Timeline examples ──────────────────────────────────────

describe('Timeline doc examples validate against schema', () => {
  it('vertical timeline with ISO dates', () => {
    const data = {
      events: [
        {
          date: '2026-01-15',
          title: 'Project kickoff',
          description: 'Initial RFC published.',
          type: 'milestone',
        },
        {
          date: '2026-01-22',
          title: 'Parser v0.1',
          description: 'First working parser.',
          type: 'release',
        },
        {
          date: '2026-02-12',
          title: 'Public beta',
          description: 'First public release.',
          type: 'milestone',
        },
      ],
      orientation: 'vertical',
    };
    expect(timelineSchema.safeParse(data).success).toBe(true);
  });

  it('horizontal timeline with quarter dates', () => {
    const data = {
      events: [
        { date: 'Q1 2026', title: 'Alpha', type: 'release' },
        { date: 'Q2 2026', title: 'Beta', type: 'release' },
        { date: 'Q3 2026', title: 'GA', type: 'milestone' },
      ],
      orientation: 'horizontal',
    };
    expect(timelineSchema.safeParse(data).success).toBe(true);
  });

  it('gallery horizontal timeline with YYYY-MM dates', () => {
    const data = {
      orientation: 'horizontal',
      events: [
        { date: '2026-01', title: 'Alpha Release', description: 'Core pipeline working.' },
        { date: '2026-03', title: 'Beta Release', description: 'All 8 components.' },
        { date: '2026-06', title: 'v1.0 GA', description: 'Production-ready.' },
        { date: '2026-09', title: 'MCP Integration', description: 'LLM agents via MCP tools.' },
      ],
    };
    expect(timelineSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Architecture examples ─────────────────────────────────

describe('Architecture doc examples validate against schema', () => {
  it('simple 3-tier architecture', () => {
    const data = {
      children: [
        { id: 'web', label: 'Web App', icon: 'cloud' },
        { id: 'api', label: 'API Server', icon: 'server' },
        { id: 'db', label: 'Database', icon: 'database' },
      ],
      edges: [
        { from: 'web', to: 'api', label: 'REST' },
        { from: 'api', to: 'db', label: 'queries' },
      ],
      layout: 'top-down',
    };
    expect(architectureSchema.safeParse(data).success).toBe(true);
  });

  it('cloud VPC with nested subnets', () => {
    const data = {
      title: 'Cloud Platform',
      children: [
        {
          id: 'vpc',
          label: 'Production VPC',
          type: 'zone',
          children: [
            {
              id: 'pub-subnet',
              label: 'Public Subnet',
              type: 'zone',
              children: [
                { id: 'alb', label: 'Load Balancer', icon: 'loadbalancer' },
                { id: 'bastion', label: 'Bastion Host', icon: 'server' },
              ],
            },
            {
              id: 'priv-subnet',
              label: 'Private Subnet',
              type: 'zone',
              children: [
                { id: 'api', label: 'API Service', icon: 'server' },
                { id: 'worker', label: 'Worker', icon: 'function' },
              ],
            },
          ],
        },
        { id: 'users', label: 'Users', icon: 'user' },
      ],
      edges: [
        { from: 'users', to: 'alb', label: 'HTTPS' },
        { from: 'alb', to: 'api' },
        { from: 'api', to: 'worker' },
      ],
      layout: 'top-down',
    };
    expect(architectureSchema.safeParse(data).success).toBe(true);
  });

  it('architecture with edge types', () => {
    const data = {
      children: [
        { id: 'a', label: 'Producer', icon: 'server' },
        { id: 'b', label: 'Queue', icon: 'queue' },
        { id: 'c', label: 'Consumer', icon: 'function' },
      ],
      edges: [
        { from: 'a', to: 'b', type: 'async' },
        { from: 'b', to: 'c', type: 'data' },
      ],
    };
    expect(architectureSchema.safeParse(data).success).toBe(true);
  });
});
