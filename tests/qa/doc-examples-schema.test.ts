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
import { pollSchema } from '../../packages/schemas/src/poll';
import { ratingSchema } from '../../packages/schemas/src/rating';
import { rankerSchema } from '../../packages/schemas/src/ranker';
import { sliderSchema } from '../../packages/schemas/src/slider';
import { matrixSchema } from '../../packages/schemas/src/matrix';
import { formSchema } from '../../packages/schemas/src/form';
import { kanbanSchema } from '../../packages/schemas/src/kanban';
import { annotateSchema } from '../../packages/schemas/src/annotate';

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

// ─── Poll examples ─────────────────────────────────────────

describe('Poll doc examples validate against schema', () => {
  it('default framework poll', () => {
    const data = {
      title: 'Framework Poll',
      question: 'Which framework do you prefer?',
      options: ['React', 'Vue', 'Angular', 'Svelte'],
    };
    expect(pollSchema.safeParse(data).success).toBe(true);
  });

  it('multiple selection poll', () => {
    const data = {
      question: 'Which languages do you use? (select all)',
      options: ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go'],
      multiple: true,
    };
    expect(pollSchema.safeParse(data).success).toBe(true);
  });

  it('hidden results poll', () => {
    const data = {
      question: 'What is your favorite color?',
      options: ['Red', 'Blue', 'Green'],
      showResults: false,
    };
    expect(pollSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Rating examples ───────────────────────────────────────

describe('Rating doc examples validate against schema', () => {
  it('star rating with labels', () => {
    const data = {
      title: 'Rate these features',
      scale: 5,
      mode: 'star',
      labels: { low: 'Poor', high: 'Excellent' },
      items: [
        { label: 'Performance', description: 'Response time and throughput' },
        { label: 'Security' },
        { label: 'Developer Experience' },
      ],
    };
    expect(ratingSchema.safeParse(data).success).toBe(true);
  });

  it('number mode rating', () => {
    const data = {
      title: 'Number Rating',
      scale: 10,
      mode: 'number',
      items: [{ label: 'Overall satisfaction' }, { label: 'Ease of use' }],
    };
    expect(ratingSchema.safeParse(data).success).toBe(true);
  });

  it('minimal single-item rating', () => {
    const data = {
      items: [{ label: 'How was your experience?' }],
    };
    expect(ratingSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Ranker examples ───────────────────────────────────────

describe('Ranker doc examples validate against schema', () => {
  it('default ranker with descriptions', () => {
    const data = {
      title: 'Rank by importance',
      items: [
        { id: 'auth', label: 'Authentication', description: 'User login and session management' },
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'api', label: 'API Layer' },
        { id: 'docs', label: 'Documentation' },
      ],
    };
    expect(rankerSchema.safeParse(data).success).toBe(true);
  });

  it('long list ranker', () => {
    const data = {
      title: 'Priority Features',
      items: [
        { id: 'perf', label: 'Performance' },
        { id: 'sec', label: 'Security' },
        { id: 'ux', label: 'UX Polish' },
        { id: 'a11y', label: 'Accessibility' },
        { id: 'i18n', label: 'Internationalization' },
        { id: 'test', label: 'Test Coverage' },
      ],
    };
    expect(rankerSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Slider examples ───────────────────────────────────────

describe('Slider doc examples validate against schema', () => {
  it('multi-parameter slider', () => {
    const data = {
      title: 'Configure preferences',
      parameters: [
        {
          id: 'performance',
          label: 'Performance',
          min: 0,
          max: 100,
          step: 5,
          value: 50,
          unit: '%',
        },
        { id: 'cost', label: 'Budget', min: 0, max: 10000, step: 100, unit: '$' },
        { id: 'quality', label: 'Quality', min: 1, max: 10, step: 1, value: 7 },
      ],
    };
    expect(sliderSchema.safeParse(data).success).toBe(true);
  });

  it('single parameter slider', () => {
    const data = {
      title: 'Confidence Level',
      parameters: [
        {
          id: 'confidence',
          label: 'How confident are you?',
          min: 0,
          max: 100,
          step: 1,
          value: 50,
          unit: '%',
        },
      ],
    };
    expect(sliderSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Matrix examples ───────────────────────────────────────

describe('Matrix doc examples validate against schema', () => {
  it('framework evaluation matrix', () => {
    const data = {
      title: 'Framework Evaluation',
      scale: 5,
      showTotals: true,
      columns: [
        { id: 'perf', label: 'Performance', weight: 2 },
        { id: 'dx', label: 'DX', weight: 1.5 },
        { id: 'eco', label: 'Ecosystem', weight: 1 },
      ],
      rows: [
        { id: 'react', label: 'React' },
        { id: 'vue', label: 'Vue' },
        { id: 'svelte', label: 'Svelte' },
      ],
    };
    expect(matrixSchema.safeParse(data).success).toBe(true);
  });

  it('simple scoring matrix without totals', () => {
    const data = {
      title: 'Simple Scoring',
      showTotals: false,
      scale: 3,
      columns: [
        { id: 'ease', label: 'Ease of Use' },
        { id: 'power', label: 'Power' },
      ],
      rows: [
        { id: 'a', label: 'Option A' },
        { id: 'b', label: 'Option B' },
      ],
    };
    expect(matrixSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Form examples ─────────────────────────────────────────

describe('Form doc examples validate against schema', () => {
  it('project setup form', () => {
    const data = {
      title: 'Project Setup',
      description: 'Tell us about your project',
      submitLabel: 'Create Project',
      fields: [
        { type: 'text', id: 'name', label: 'Project Name', required: true },
        {
          type: 'select',
          id: 'framework',
          label: 'Framework',
          options: ['React', 'Vue', 'Angular'],
        },
        { type: 'range', id: 'budget', label: 'Budget', min: 0, max: 50000, step: 1000, unit: '$' },
        { type: 'checkbox', id: 'typescript', label: 'Use TypeScript', default: true },
        { type: 'textarea', id: 'description', label: 'Description', rows: 4 },
      ],
    };
    expect(formSchema.safeParse(data).success).toBe(true);
  });

  it('contact form', () => {
    const data = {
      title: 'Contact Us',
      fields: [
        { type: 'text', id: 'email', label: 'Email', required: true },
        { type: 'text', id: 'subject', label: 'Subject', required: true },
        { type: 'textarea', id: 'message', label: 'Message', required: true, rows: 6 },
      ],
    };
    expect(formSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Kanban examples ───────────────────────────────────────

describe('Kanban doc examples validate against schema', () => {
  it('sprint board with cards and priorities', () => {
    const data = {
      title: 'Sprint Board',
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          cards: [
            {
              id: 'auth',
              title: 'Implement Auth',
              description: 'OAuth2 + JWT tokens',
              priority: 'high',
              tags: ['backend', 'security'],
            },
            { id: 'dashboard', title: 'Build Dashboard', priority: 'medium' },
          ],
        },
        {
          id: 'progress',
          title: 'In Progress',
          limit: 3,
          cards: [{ id: 'api', title: 'API Layer', priority: 'high' }],
        },
        {
          id: 'done',
          title: 'Done',
          cards: [{ id: 'setup', title: 'Project Setup', priority: 'low' }],
        },
      ],
    };
    expect(kanbanSchema.safeParse(data).success).toBe(true);
  });

  it('empty board', () => {
    const data = {
      title: 'New Board',
      columns: [
        { id: 'backlog', title: 'Backlog' },
        { id: 'todo', title: 'To Do' },
        { id: 'done', title: 'Done' },
      ],
    };
    expect(kanbanSchema.safeParse(data).success).toBe(true);
  });
});

// ─── Annotate examples ─────────────────────────────────────

describe('Annotate doc examples validate against schema', () => {
  it('code review with annotations', () => {
    const data = {
      title: 'Code Review',
      labels: [
        { name: 'Bug', color: '#dc2626' },
        { name: 'Unclear', color: '#f59e0b' },
        { name: 'Good', color: '#16a34a' },
      ],
      text: "function processData(input) {\n  var result = input.split(',');\n  eval(result[0]);\n  return result;\n}",
      annotations: [{ start: 62, end: 78, label: 'Bug', note: 'eval() is dangerous' }],
    };
    expect(annotateSchema.safeParse(data).success).toBe(true);
  });

  it('prose text with highlights', () => {
    const data = {
      title: 'Document Review',
      labels: [
        { name: 'Important', color: '#3b82f6' },
        { name: 'Question', color: '#f59e0b' },
      ],
      text: 'The system shall process all incoming requests within 200ms. Authentication tokens expire after 24 hours. Rate limiting is applied at 100 requests per minute per user.',
      annotations: [{ start: 0, end: 55, label: 'Important' }],
    };
    expect(annotateSchema.safeParse(data).success).toBe(true);
  });
});
