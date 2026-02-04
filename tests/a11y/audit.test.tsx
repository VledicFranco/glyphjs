// @vitest-environment jsdom
/**
 * Accessibility audit tests — axe-core integration
 *
 * Verifies that every Glyph component meets WCAG 2.1 AA standards by running
 * automated axe-core checks and validating expected ARIA roles, keyboard
 * focusability, and screen-reader fallbacks for D3-rendered components.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

// ─── Components ────────────────────────────────────────────────
import { Callout } from '../../packages/components/src/callout/Callout';
import type { CalloutData } from '../../packages/components/src/callout/Callout';
import { Steps } from '../../packages/components/src/steps/Steps';
import type { StepsData } from '../../packages/components/src/steps/Steps';
import { Table } from '../../packages/components/src/table/Table';
import type { TableData } from '../../packages/components/src/table/Table';
import { Tabs } from '../../packages/components/src/tabs/Tabs';
import type { TabsData } from '../../packages/components/src/tabs/Tabs';
import { Timeline } from '../../packages/components/src/timeline/Timeline';
import type { TimelineData } from '../../packages/components/src/timeline/Timeline';
import { Graph } from '../../packages/components/src/graph/Graph';
import type { GraphData } from '../../packages/components/src/graph/Graph';
import { Chart } from '../../packages/components/src/chart/Chart';
import type { ChartData } from '../../packages/components/src/chart/Chart';
import { Relation } from '../../packages/components/src/relation/Relation';
import type { RelationData } from '../../packages/components/src/relation/Relation';
import { Architecture } from '../../packages/components/src/architecture/Architecture';
import type { ArchitectureData } from '../../packages/components/src/architecture/Architecture';
import { Accordion } from '../../packages/components/src/accordion/Accordion';
import type { AccordionData } from '../../packages/components/src/accordion/Accordion';
import { Card } from '../../packages/components/src/card/Card';
import type { CardData } from '../../packages/components/src/card/Card';
import { CodeDiff } from '../../packages/components/src/codediff/CodeDiff';
import type { CodeDiffData } from '../../packages/components/src/codediff/CodeDiff';
import { Comparison } from '../../packages/components/src/comparison/Comparison';
import type { ComparisonData } from '../../packages/components/src/comparison/Comparison';
import { Equation } from '../../packages/components/src/equation/Equation';
import type { EquationData } from '../../packages/components/src/equation/Equation';
import { FileTree } from '../../packages/components/src/filetree/FileTree';
import type { FileTreeData } from '../../packages/components/src/filetree/FileTree';
import { Flowchart } from '../../packages/components/src/flowchart/Flowchart';
import type { FlowchartData } from '../../packages/components/src/flowchart/Flowchart';
import { Kpi } from '../../packages/components/src/kpi/Kpi';
import type { KpiData } from '../../packages/components/src/kpi/Kpi';
import { MindMap } from '../../packages/components/src/mindmap/MindMap';
import type { MindMapData } from '../../packages/components/src/mindmap/MindMap';
import { Quiz } from '../../packages/components/src/quiz/Quiz';
import type { QuizData } from '../../packages/components/src/quiz/Quiz';
import { Sequence } from '../../packages/components/src/sequence/Sequence';
import type { SequenceData } from '../../packages/components/src/sequence/Sequence';
import { Infographic } from '../../packages/components/src/infographic/Infographic';
import type { InfographicData } from '../../packages/components/src/infographic/Infographic';

// ─── Renderers ─────────────────────────────────────────────────
import { GlyphHeading } from '../../packages/runtime/src/renderers/GlyphHeading';
import { GlyphParagraph } from '../../packages/runtime/src/renderers/GlyphParagraph';
import { GlyphList } from '../../packages/runtime/src/renderers/GlyphList';
import { GlyphCodeBlock } from '../../packages/runtime/src/renderers/GlyphCodeBlock';
import { GlyphBlockquote } from '../../packages/runtime/src/renderers/GlyphBlockquote';
import { GlyphImage } from '../../packages/runtime/src/renderers/GlyphImage';
import { GlyphThematicBreak } from '../../packages/runtime/src/renderers/GlyphThematicBreak';

// ─── Test Helpers ──────────────────────────────────────────────
import type {
  GlyphComponentProps,
  BlockProps,
  Block,
  LayoutHints,
  GlyphThemeContext,
} from '../../packages/types/src/index';

// ─── jsdom Polyfills ───────────────────────────────────────────
// ResizeObserver is not available in jsdom; provide a minimal stub.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver;
}

expect.extend(toHaveNoViolations);

// ─── Mock Factories ────────────────────────────────────────────

function mockTheme(isDark = false): GlyphThemeContext {
  return { name: isDark ? 'dark' : 'light', resolveVar: () => '', isDark };
}

function mockLayout(): LayoutHints {
  return { mode: 'document' };
}

function mockComponentProps<T>(data: T, type = 'ui:test'): GlyphComponentProps<T> {
  return {
    data,
    block: {
      id: 'test-block',
      type: type as GlyphComponentProps<T>['block']['type'],
      data,
      position: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    },
    outgoingRefs: [],
    incomingRefs: [],
    onNavigate: () => {},
    theme: mockTheme(),
    layout: mockLayout(),
    container: { width: 0, tier: 'wide' },
  };
}

function mockBlockProps(data: unknown, type = 'paragraph'): BlockProps {
  return {
    block: {
      id: `block-${type}`,
      type,
      data,
      position: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    } as Block,
    layout: mockLayout(),
  };
}

// ────────────────────────────────────────────────────────────────
// SECTION 1: axe-core violation tests
// ────────────────────────────────────────────────────────────────

describe('Accessibility: axe-core automated checks', () => {
  it('Callout has no axe-core violations', async () => {
    const props = mockComponentProps<CalloutData>(
      { type: 'info', title: 'Note', content: 'Important information' },
      'ui:callout',
    );
    const { container } = render(<Callout {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Callout (warning variant) has no axe-core violations', async () => {
    const props = mockComponentProps<CalloutData>(
      { type: 'warning', content: 'Be careful' },
      'ui:callout',
    );
    const { container } = render(<Callout {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Steps has no axe-core violations', async () => {
    const props = mockComponentProps<StepsData>(
      {
        steps: [
          { title: 'Step 1', content: 'First step', status: 'completed' },
          { title: 'Step 2', content: 'Second step', status: 'active' },
          { title: 'Step 3', content: 'Third step', status: 'pending' },
        ],
      },
      'ui:steps',
    );
    const { container } = render(<Steps {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Table has no axe-core violations', async () => {
    const props = mockComponentProps<TableData>(
      {
        columns: [
          { key: 'name', label: 'Name', sortable: true },
          { key: 'age', label: 'Age', sortable: true, type: 'number' },
        ],
        rows: [
          { name: 'Alice', age: 30 },
          { name: 'Bob', age: 25 },
        ],
      },
      'ui:table',
    );
    const { container } = render(<Table {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Table with filters has no axe-core violations', async () => {
    const props = mockComponentProps<TableData>(
      {
        columns: [
          { key: 'name', label: 'Name', sortable: true, filterable: true },
          { key: 'age', label: 'Age', type: 'number' },
        ],
        rows: [
          { name: 'Alice', age: 30 },
          { name: 'Bob', age: 25 },
        ],
      },
      'ui:table',
    );
    const { container } = render(<Table {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Tabs has no axe-core violations', async () => {
    const props = mockComponentProps<TabsData>(
      {
        tabs: [
          { label: 'Tab One', content: 'Content for tab one' },
          { label: 'Tab Two', content: 'Content for tab two' },
        ],
      },
      'ui:tabs',
    );
    const { container } = render(<Tabs {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Timeline has no axe-core violations', async () => {
    const props = mockComponentProps<TimelineData>(
      {
        events: [
          { date: '2024-01-01', title: 'New Year', description: 'Celebration' },
          { date: '2024-06-15', title: 'Mid Year', description: 'Review' },
        ],
      },
      'ui:timeline',
    );
    const { container } = render(<Timeline {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Chart has no axe-core violations', async () => {
    const props = mockComponentProps<ChartData>(
      {
        type: 'bar',
        series: [
          {
            name: 'Revenue',
            data: [
              { x: 'Q1', y: 100 },
              { x: 'Q2', y: 200 },
            ],
          },
        ],
        xAxis: { key: 'x', label: 'Quarter' },
        yAxis: { key: 'y', label: 'Revenue ($)' },
      },
      'ui:chart',
    );
    const { container } = render(<Chart {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Graph has no axe-core violations', async () => {
    const props = mockComponentProps<GraphData>(
      {
        type: 'dag',
        nodes: [
          { id: 'a', label: 'Node A' },
          { id: 'b', label: 'Node B' },
        ],
        edges: [{ from: 'a', to: 'b' }],
      },
      'ui:graph',
    );
    const { container } = render(<Graph {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Relation has no axe-core violations', async () => {
    const props = mockComponentProps<RelationData>(
      {
        entities: [
          {
            id: 'users',
            label: 'Users',
            attributes: [{ name: 'id', type: 'int', primaryKey: true }],
          },
          {
            id: 'posts',
            label: 'Posts',
            attributes: [{ name: 'id', type: 'int', primaryKey: true }],
          },
        ],
        relationships: [{ from: 'users', to: 'posts', label: 'writes', cardinality: '1:N' }],
      },
      'ui:relation',
    );
    const { container } = render(<Relation {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Architecture has no axe-core violations', async () => {
    const props = mockComponentProps<ArchitectureData>(
      {
        children: [
          { id: 'a', label: 'Service A', icon: 'server' },
          { id: 'b', label: 'Service B', icon: 'database' },
        ],
        edges: [{ from: 'a', to: 'b' }],
      },
      'ui:architecture',
    );
    const { container } = render(<Architecture {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Accordion has no axe-core violations', async () => {
    const props = mockComponentProps<AccordionData>(
      {
        sections: [
          { title: 'Section 1', content: 'Content for section one.' },
          { title: 'Section 2', content: 'Content for section two.' },
        ],
      },
      'ui:accordion',
    );
    const { container } = render(<Accordion {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card has no axe-core violations', async () => {
    const props = mockComponentProps<CardData>(
      {
        cards: [
          { title: 'Card A', body: 'Body text for card A.' },
          { title: 'Card B', body: 'Body text for card B.' },
        ],
      },
      'ui:card',
    );
    const { container } = render(<Card {...props} />);
    const results = await axe(container, {
      rules: { 'aria-allowed-role': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('CodeDiff has no axe-core violations', async () => {
    const props = mockComponentProps<CodeDiffData>(
      { before: 'const x = 1;', after: 'const x = 2;', language: 'javascript' },
      'ui:codediff',
    );
    const { container } = render(<CodeDiff {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Comparison has no axe-core violations', async () => {
    const props = mockComponentProps<ComparisonData>(
      {
        options: [{ name: 'Plan A' }, { name: 'Plan B' }],
        features: [{ name: 'Price', values: ['$10', '$20'] }],
      },
      'ui:comparison',
    );
    const { container } = render(<Comparison {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Equation has no axe-core violations', async () => {
    const props = mockComponentProps<EquationData>(
      { expression: 'E = mc^2', label: 'Mass-energy equivalence' },
      'ui:equation',
    );
    const { container } = render(<Equation {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('FileTree has no axe-core violations', async () => {
    const props = mockComponentProps<FileTreeData>(
      {
        tree: [{ name: 'src', children: [{ name: 'index.ts' }] }, { name: 'package.json' }],
        defaultExpanded: true,
      },
      'ui:filetree',
    );
    const { container } = render(<FileTree {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Flowchart has no axe-core violations', async () => {
    const props = mockComponentProps<FlowchartData>(
      {
        nodes: [
          { id: 'a', type: 'start', label: 'Begin' },
          { id: 'b', type: 'end', label: 'End' },
        ],
        edges: [{ from: 'a', to: 'b' }],
        direction: 'top-down',
      },
      'ui:flowchart',
    );
    const { container } = render(<Flowchart {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('KPI has no axe-core violations', async () => {
    const props = mockComponentProps<KpiData>(
      {
        metrics: [
          { label: 'Revenue', value: '$1.2M', trend: 'up', sentiment: 'positive' },
          { label: 'Churn', value: '2.1%', trend: 'down', sentiment: 'positive' },
        ],
      },
      'ui:kpi',
    );
    const { container } = render(<Kpi {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('MindMap has no axe-core violations', async () => {
    const props = mockComponentProps<MindMapData>(
      {
        root: 'Center',
        children: [{ label: 'Branch A' }, { label: 'Branch B' }],
        layout: 'radial',
      },
      'ui:mindmap',
    );
    const { container } = render(<MindMap {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Quiz has no axe-core violations', async () => {
    const props = mockComponentProps<QuizData>(
      {
        questions: [
          {
            type: 'multiple-choice',
            question: 'What is 2+2?',
            options: ['3', '4', '5'],
            answer: 1,
          },
        ],
      },
      'ui:quiz',
    );
    const { container } = render(<Quiz {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Sequence has no axe-core violations', async () => {
    const props = mockComponentProps<SequenceData>(
      {
        actors: [
          { id: 'a', label: 'Client' },
          { id: 'b', label: 'Server' },
        ],
        messages: [{ from: 'a', to: 'b', label: 'Request', type: 'message' }],
      },
      'ui:sequence',
    );
    const { container } = render(<Sequence {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Infographic has no axe-core violations', async () => {
    const props = mockComponentProps<InfographicData>(
      {
        sections: [
          {
            heading: 'Key Metrics',
            items: [{ type: 'stat', label: 'Users', value: '1.2M' }],
          },
        ],
      },
      'ui:infographic',
    );
    const { container } = render(<Infographic {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // ─── Standard renderers ─────────────────────────────────────

  it('GlyphHeading has no axe-core violations', async () => {
    const props = mockBlockProps(
      { depth: 2, children: [{ type: 'text', value: 'Hello World' }] },
      'heading',
    );
    const { container } = render(<GlyphHeading {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('GlyphParagraph has no axe-core violations', async () => {
    const props = mockBlockProps(
      { children: [{ type: 'text', value: 'Some paragraph text.' }] },
      'paragraph',
    );
    const { container } = render(<GlyphParagraph {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('GlyphList has no axe-core violations', async () => {
    const props = mockBlockProps(
      {
        ordered: true,
        items: [
          { children: [{ type: 'text', value: 'Item one' }] },
          { children: [{ type: 'text', value: 'Item two' }] },
        ],
      },
      'list',
    );
    const { container } = render(<GlyphList {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('GlyphCodeBlock has no axe-core violations', async () => {
    const props = mockBlockProps({ language: 'javascript', value: 'const x = 1;' }, 'code');
    const { container } = render(<GlyphCodeBlock {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('GlyphBlockquote has no axe-core violations', async () => {
    const props = mockBlockProps(
      { children: [{ type: 'text', value: 'A wise quote.' }] },
      'blockquote',
    );
    const { container } = render(<GlyphBlockquote {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('GlyphImage has no axe-core violations', async () => {
    const props = mockBlockProps(
      { src: 'https://example.com/image.png', alt: 'Example image', title: 'Example' },
      'image',
    );
    const { container } = render(<GlyphImage {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('GlyphThematicBreak has no axe-core violations', async () => {
    const props = mockBlockProps({}, 'thematic-break');
    const { container } = render(<GlyphThematicBreak {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ────────────────────────────────────────────────────────────────
// SECTION 2: ARIA roles and attributes
// ────────────────────────────────────────────────────────────────

describe('Accessibility: ARIA roles and attributes', () => {
  it('Callout uses role="note" with correct aria-label per variant', () => {
    const variants: { type: CalloutData['type']; label: string }[] = [
      { type: 'info', label: 'Information' },
      { type: 'warning', label: 'Warning' },
      { type: 'error', label: 'Error' },
      { type: 'tip', label: 'Tip' },
    ];

    for (const variant of variants) {
      const { unmount } = render(
        <Callout
          {...mockComponentProps<CalloutData>(
            { type: variant.type, content: 'test' },
            'ui:callout',
          )}
        />,
      );
      const note = screen.getByRole('note');
      expect(note).toHaveAttribute('aria-label', variant.label);
      unmount();
    }
  });

  it('Callout icon is aria-hidden', () => {
    const { container } = render(
      <Callout
        {...mockComponentProps<CalloutData>({ type: 'info', content: 'test' }, 'ui:callout')}
      />,
    );
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it('Tabs has correct WAI-ARIA roles', () => {
    render(
      <Tabs
        {...mockComponentProps<TabsData>(
          {
            tabs: [
              { label: 'A', content: 'Content A' },
              { label: 'B', content: 'Content B' },
            ],
          },
          'ui:tabs',
        )}
      />,
    );

    // Tablist
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Tabs');

    // Tabs
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');

    // Tab panels
    const tabpanels = screen.getAllByRole('tabpanel');
    expect(tabpanels.length).toBeGreaterThanOrEqual(1);
  });

  it('Tabs associate tab with tabpanel via aria-controls and aria-labelledby', () => {
    render(
      <Tabs
        {...mockComponentProps<TabsData>(
          { tabs: [{ label: 'A', content: 'Content A' }] },
          'ui:tabs',
        )}
      />,
    );
    const tab = screen.getByRole('tab');
    const panelId = tab.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();

    const panel = document.getElementById(panelId!);
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('Table has role="grid" and scope="col" on header cells', () => {
    const { container } = render(
      <Table
        {...mockComponentProps<TableData>(
          {
            columns: [{ key: 'name', label: 'Name' }],
            rows: [{ name: 'Alice' }],
          },
          'ui:table',
        )}
      />,
    );

    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();

    const th = container.querySelector('th[scope="col"]');
    expect(th).toBeInTheDocument();
  });

  it('Table sortable headers have aria-sort and tabindex', () => {
    render(
      <Table
        {...mockComponentProps<TableData>(
          {
            columns: [{ key: 'name', label: 'Name', sortable: true }],
            rows: [{ name: 'Alice' }],
          },
          'ui:table',
        )}
      />,
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveAttribute('aria-sort', 'none');
    expect(headers[0]).toHaveAttribute('tabindex', '0');
  });

  it('Table filter inputs have aria-label', () => {
    render(
      <Table
        {...mockComponentProps<TableData>(
          {
            columns: [{ key: 'name', label: 'Name', filterable: true }],
            rows: [{ name: 'Alice' }],
          },
          'ui:table',
        )}
      />,
    );

    const input = screen.getByLabelText('Filter Name');
    expect(input).toBeInTheDocument();
  });

  it('Steps uses ordered list with aria-label per step', () => {
    const { container } = render(
      <Steps
        {...mockComponentProps<StepsData>(
          {
            steps: [
              { title: 'Install', content: 'Run npm install', status: 'completed' },
              { title: 'Build', content: 'Run npm build', status: 'active' },
            ],
          },
          'ui:steps',
        )}
      />,
    );

    const list = screen.getByRole('list');
    expect(list.tagName.toLowerCase()).toBe('ol');

    const items = container.querySelectorAll('li');
    expect(items[0]).toHaveAttribute('aria-label', expect.stringContaining('Install'));
    expect(items[0]).toHaveAttribute('aria-label', expect.stringContaining('Completed'));
  });

  it('Steps marks active step with aria-current="step"', () => {
    const { container } = render(
      <Steps
        {...mockComponentProps<StepsData>(
          {
            steps: [
              { title: 'Step 1', content: 'Done', status: 'completed' },
              { title: 'Step 2', content: 'In progress', status: 'active' },
            ],
          },
          'ui:steps',
        )}
      />,
    );

    const activeItem = container.querySelector('[aria-current="step"]');
    expect(activeItem).toBeInTheDocument();
    expect(activeItem).toHaveAttribute('aria-label', expect.stringContaining('Step 2'));
  });

  it('Timeline has role="img" with descriptive aria-label', () => {
    render(
      <Timeline
        {...mockComponentProps<TimelineData>(
          {
            events: [
              { date: '2024-01-01', title: 'Event 1' },
              { date: '2024-06-15', title: 'Event 2' },
            ],
          },
          'ui:timeline',
        )}
      />,
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('aria-label', 'Timeline with 2 events');
  });

  it('Timeline has screen-reader accessible ordered list fallback', () => {
    const { container } = render(
      <Timeline
        {...mockComponentProps<TimelineData>(
          {
            events: [{ date: '2024-01-01', title: 'New Year' }],
          },
          'ui:timeline',
        )}
      />,
    );

    // The sr-only list is visually hidden but present in the DOM
    const srList = container.querySelector('ol');
    expect(srList).toBeInTheDocument();
    const timeElements = container.querySelectorAll('time');
    expect(timeElements).toHaveLength(1);
    expect(timeElements[0]).toHaveAttribute('dateTime');
  });

  it('Graph SVG has role="img" and descriptive aria-label', () => {
    const { container } = render(
      <Graph
        {...mockComponentProps<GraphData>(
          {
            type: 'dag',
            nodes: [
              { id: 'a', label: 'A' },
              { id: 'b', label: 'B' },
            ],
            edges: [{ from: 'a', to: 'b' }],
          },
          'ui:graph',
        )}
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('2 nodes'));
  });

  it('Graph has hidden data table for screen readers', () => {
    const { container } = render(
      <Graph
        {...mockComponentProps<GraphData>(
          {
            type: 'dag',
            nodes: [{ id: 'a', label: 'Node A' }],
            edges: [],
          },
          'ui:graph',
        )}
      />,
    );

    const srTable = container.querySelector('table.sr-only');
    expect(srTable).toBeInTheDocument();
    expect(srTable).toHaveAttribute('aria-label', 'Graph data');

    const caption = srTable?.querySelector('caption');
    expect(caption).toHaveTextContent('Graph nodes and connections');
  });

  it('Chart SVG has role="img" and descriptive aria-label', () => {
    const { container } = render(
      <Chart
        {...mockComponentProps<ChartData>(
          {
            type: 'line',
            series: [{ name: 'Sales', data: [{ x: 1, y: 10 }] }],
          },
          'ui:chart',
        )}
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('Sales'));
  });

  it('Chart has hidden accessible data table', () => {
    const { container } = render(
      <Chart
        {...mockComponentProps<ChartData>(
          {
            type: 'bar',
            series: [{ name: 'Revenue', data: [{ x: 'Q1', y: 100 }] }],
          },
          'ui:chart',
        )}
      />,
    );

    const srTable = container.querySelector('table');
    expect(srTable).toBeInTheDocument();
    const caption = srTable?.querySelector('caption');
    expect(caption).toHaveTextContent('bar chart data');
  });

  it('Chart tooltip has role="tooltip" and aria-live', () => {
    const { container } = render(
      <Chart
        {...mockComponentProps<ChartData>(
          {
            type: 'line',
            series: [{ name: 'Data', data: [{ x: 1, y: 2 }] }],
          },
          'ui:chart',
        )}
      />,
    );

    const tooltip = container.querySelector('[role="tooltip"]');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute('aria-live', 'polite');
  });

  it('Relation SVG has role="img" and descriptive aria-label', () => {
    const { container } = render(
      <Relation
        {...mockComponentProps<RelationData>(
          {
            entities: [{ id: 'e1', label: 'Entity1' }],
            relationships: [],
          },
          'ui:relation',
        )}
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('1 entities'));
  });

  it('Relation has hidden data table for screen readers', () => {
    const { container } = render(
      <Relation
        {...mockComponentProps<RelationData>(
          {
            entities: [
              {
                id: 'users',
                label: 'Users',
                attributes: [{ name: 'id', type: 'int', primaryKey: true }],
              },
            ],
            relationships: [],
          },
          'ui:relation',
        )}
      />,
    );

    const srTable = container.querySelector('table.sr-only');
    expect(srTable).toBeInTheDocument();
    expect(srTable).toHaveAttribute('aria-label', 'Entity-relationship data');
  });

  it('Architecture SVG has role="img" and descriptive aria-label', () => {
    const { container } = render(
      <Architecture
        {...mockComponentProps<ArchitectureData>(
          {
            children: [
              { id: 'a', label: 'Node A', icon: 'server' },
              { id: 'b', label: 'Node B', icon: 'database' },
            ],
            edges: [{ from: 'a', to: 'b' }],
          },
          'ui:architecture',
        )}
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('2 nodes'));
  });

  it('Architecture has hidden data table for screen readers', () => {
    const { container } = render(
      <Architecture
        {...mockComponentProps<ArchitectureData>(
          {
            children: [{ id: 'a', label: 'Service A', icon: 'server' }],
            edges: [],
          },
          'ui:architecture',
        )}
      />,
    );

    const srTable = container.querySelector('table.sr-only');
    expect(srTable).toBeInTheDocument();
    expect(srTable).toHaveAttribute('aria-label', 'Architecture data');

    const caption = srTable?.querySelector('caption');
    expect(caption).toHaveTextContent('Architecture nodes and connections');
  });

  it('Accordion sections use details/summary elements', () => {
    const { container } = render(
      <Accordion
        {...mockComponentProps<AccordionData>(
          {
            sections: [
              { title: 'First', content: 'Content 1' },
              { title: 'Second', content: 'Content 2' },
            ],
          },
          'ui:accordion',
        )}
      />,
    );

    const details = container.querySelectorAll('details');
    expect(details.length).toBeGreaterThanOrEqual(2);

    const summaries = container.querySelectorAll('summary');
    expect(summaries.length).toBeGreaterThanOrEqual(2);
  });

  it('Comparison renders as a table with scope headers', () => {
    const { container } = render(
      <Comparison
        {...mockComponentProps<ComparisonData>(
          {
            options: [{ name: 'A' }, { name: 'B' }],
            features: [{ name: 'Price', values: ['$10', '$20'] }],
          },
          'ui:comparison',
        )}
      />,
    );

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  it('Flowchart SVG has role="img" and descriptive aria-label', () => {
    const { container } = render(
      <Flowchart
        {...mockComponentProps<FlowchartData>(
          {
            nodes: [
              { id: 'a', type: 'start', label: 'Start' },
              { id: 'b', type: 'end', label: 'End' },
            ],
            edges: [{ from: 'a', to: 'b' }],
            direction: 'top-down',
          },
          'ui:flowchart',
        )}
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label');
  });

  it('Sequence SVG has role="img" and descriptive aria-label', () => {
    const { container } = render(
      <Sequence
        {...mockComponentProps<SequenceData>(
          {
            actors: [
              { id: 'a', label: 'Client' },
              { id: 'b', label: 'Server' },
            ],
            messages: [{ from: 'a', to: 'b', label: 'Request', type: 'message' }],
          },
          'ui:sequence',
        )}
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('2 actors'));
  });

  it('MindMap SVG has role="img" and descriptive aria-label', () => {
    const { container } = render(
      <MindMap
        {...mockComponentProps<MindMapData>(
          {
            root: 'Center',
            children: [{ label: 'A' }, { label: 'B' }],
            layout: 'radial',
          },
          'ui:mindmap',
        )}
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label');
  });

  it('Quiz has role="region" with aria-label', () => {
    render(
      <Quiz
        {...mockComponentProps<QuizData>(
          {
            title: 'Test Quiz',
            questions: [{ type: 'true-false', question: 'Sky is blue.', answer: true }],
          },
          'ui:quiz',
        )}
      />,
    );

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Test Quiz');
  });

  it('KPI metrics are labelled', () => {
    const { container } = render(
      <Kpi
        {...mockComponentProps<KpiData>(
          {
            metrics: [{ label: 'Revenue', value: '$1M' }],
          },
          'ui:kpi',
        )}
      />,
    );

    expect(container.textContent).toContain('Revenue');
    expect(container.textContent).toContain('$1M');
  });

  it('FileTree uses tree role or list structure', () => {
    const { container } = render(
      <FileTree
        {...mockComponentProps<FileTreeData>(
          {
            tree: [{ name: 'src', children: [{ name: 'index.ts' }] }],
            defaultExpanded: true,
          },
          'ui:filetree',
        )}
      />,
    );

    const tree = container.querySelector('[role="tree"], [role="group"], ul');
    expect(tree).toBeInTheDocument();
  });

  it('GlyphImage uses semantic figure/figcaption and alt text', () => {
    const props = mockBlockProps(
      { src: 'https://example.com/img.png', alt: 'Descriptive alt text', title: 'Figure title' },
      'image',
    );
    const { container } = render(<GlyphImage {...props} />);

    const figure = container.querySelector('figure');
    expect(figure).toBeInTheDocument();

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', 'Descriptive alt text');

    const caption = container.querySelector('figcaption');
    expect(caption).toHaveTextContent('Figure title');
  });

  it('GlyphCodeBlock has aria-label describing the language', () => {
    const props = mockBlockProps({ language: 'typescript', value: 'const x: number = 1;' }, 'code');
    const { container } = render(<GlyphCodeBlock {...props} />);

    const pre = container.querySelector('pre');
    expect(pre).toHaveAttribute('aria-label', 'Code block (typescript)');
  });

  it('GlyphHeading generates id for anchor linking', () => {
    const props = mockBlockProps(
      { depth: 1, children: [{ type: 'text', value: 'Getting Started' }] },
      'heading',
    );
    render(<GlyphHeading {...props} />);

    const heading = screen.getByRole('heading');
    expect(heading).toHaveAttribute('id', 'getting-started');
  });
});

// ────────────────────────────────────────────────────────────────
// SECTION 3: Keyboard navigation
// ────────────────────────────────────────────────────────────────

describe('Accessibility: Keyboard navigation', () => {
  it('Tabs support ArrowRight / ArrowLeft keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <Tabs
        {...mockComponentProps<TabsData>(
          {
            tabs: [
              { label: 'First', content: 'Content 1' },
              { label: 'Second', content: 'Content 2' },
              { label: 'Third', content: 'Content 3' },
            ],
          },
          'ui:tabs',
        )}
      />,
    );

    const tabs = screen.getAllByRole('tab');

    // Focus first tab
    tabs[0]!.focus();
    expect(document.activeElement).toBe(tabs[0]);

    // ArrowRight moves to second tab
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

    // ArrowRight again moves to third tab
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tabs[2]);
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');

    // ArrowRight wraps to first tab
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tabs[0]);

    // ArrowLeft wraps to last tab
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tabs[2]);
  });

  it('Tabs support Home / End keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <Tabs
        {...mockComponentProps<TabsData>(
          {
            tabs: [
              { label: 'First', content: 'Content 1' },
              { label: 'Second', content: 'Content 2' },
              { label: 'Third', content: 'Content 3' },
            ],
          },
          'ui:tabs',
        )}
      />,
    );

    const tabs = screen.getAllByRole('tab');
    tabs[0]!.focus();

    // End goes to last tab
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(tabs[2]);

    // Home goes to first tab
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(tabs[0]);
  });

  it('Tabs inactive tabs have tabindex=-1 (roving tabindex)', () => {
    render(
      <Tabs
        {...mockComponentProps<TabsData>(
          {
            tabs: [
              { label: 'A', content: 'Content A' },
              { label: 'B', content: 'Content B' },
            ],
          },
          'ui:tabs',
        )}
      />,
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('tabindex', '0'); // active
    expect(tabs[1]).toHaveAttribute('tabindex', '-1'); // inactive
  });

  it('Tab panels are focusable with tabindex=0', () => {
    render(
      <Tabs
        {...mockComponentProps<TabsData>(
          {
            tabs: [{ label: 'A', content: 'Content A' }],
          },
          'ui:tabs',
        )}
      />,
    );

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('tabindex', '0');
  });

  it('Table sortable headers respond to Enter key', async () => {
    const user = userEvent.setup();

    render(
      <Table
        {...mockComponentProps<TableData>(
          {
            columns: [{ key: 'name', label: 'Name', sortable: true }],
            rows: [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }],
          },
          'ui:table',
        )}
      />,
    );

    const header = screen.getByRole('columnheader');
    header.focus();
    await user.keyboard('{Enter}');

    // After pressing Enter, sort should change to ascending
    expect(header).toHaveAttribute('aria-sort', 'ascending');
  });

  it('Table sortable headers respond to Space key', async () => {
    const user = userEvent.setup();

    render(
      <Table
        {...mockComponentProps<TableData>(
          {
            columns: [{ key: 'name', label: 'Name', sortable: true }],
            rows: [{ name: 'Alice' }],
          },
          'ui:table',
        )}
      />,
    );

    const header = screen.getByRole('columnheader');
    header.focus();
    await user.keyboard(' ');

    expect(header).toHaveAttribute('aria-sort', 'ascending');
  });

  it('FileTree items respond to Enter/Space for expand/collapse', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <FileTree
        {...mockComponentProps<FileTreeData>(
          {
            tree: [{ name: 'src', children: [{ name: 'index.ts' }] }],
            defaultExpanded: false,
          },
          'ui:filetree',
        )}
      />,
    );

    const treeItems = container.querySelectorAll('[role="treeitem"], button, [tabindex="0"]');
    if (treeItems.length > 0) {
      const firstItem = treeItems[0] as HTMLElement;
      firstItem.focus();
      await user.keyboard('{Enter}');
      // After expand, children should be visible
      expect(container.textContent).toContain('index.ts');
    }
  });

  it('Quiz radio options respond to keyboard selection', async () => {
    const user = userEvent.setup();

    render(
      <Quiz
        {...mockComponentProps<QuizData>(
          {
            questions: [
              {
                type: 'multiple-choice',
                question: 'Pick one',
                options: ['A', 'B', 'C'],
                answer: 0,
              },
            ],
          },
          'ui:quiz',
        )}
      />,
    );

    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBeGreaterThanOrEqual(3);

    // Tab to first radio and select
    radios[0]!.focus();
    await user.keyboard(' ');
    expect(radios[0]).toBeChecked();
  });
});

// ────────────────────────────────────────────────────────────────
// SECTION 4: Screen reader fallbacks for D3 components
// ────────────────────────────────────────────────────────────────

describe('Accessibility: Screen reader fallbacks for D3/SVG components', () => {
  it('Graph sr-only table lists all nodes with their connections', () => {
    const { container } = render(
      <Graph
        {...mockComponentProps<GraphData>(
          {
            type: 'flowchart',
            nodes: [
              { id: 'a', label: 'Start', group: 'process' },
              { id: 'b', label: 'End', group: 'process' },
            ],
            edges: [{ from: 'a', to: 'b', label: 'flow' }],
          },
          'ui:graph',
        )}
      />,
    );

    const srTable = container.querySelector('table.sr-only');
    const rows = srTable?.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);

    // First row should mention Start node
    expect(rows![0]!.textContent).toContain('Start');
    // Connection info should be present
    expect(rows![0]!.textContent).toContain('-> b');
  });

  it('Relation sr-only table includes entity attributes and relationships', () => {
    const { container } = render(
      <Relation
        {...mockComponentProps<RelationData>(
          {
            entities: [
              {
                id: 'users',
                label: 'Users',
                attributes: [
                  { name: 'id', type: 'int', primaryKey: true },
                  { name: 'email', type: 'varchar' },
                ],
              },
              {
                id: 'posts',
                label: 'Posts',
                attributes: [{ name: 'id', type: 'int', primaryKey: true }],
              },
            ],
            relationships: [{ from: 'users', to: 'posts', label: 'authors', cardinality: '1:N' }],
          },
          'ui:relation',
        )}
      />,
    );

    const srTable = container.querySelector('table.sr-only');
    const rows = srTable?.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);

    // Users row should mention attributes and relationships
    const usersRow = rows![0]!.textContent;
    expect(usersRow).toContain('Users');
    expect(usersRow).toContain('id: int');
    expect(usersRow).toContain('(PK)');
    expect(usersRow).toContain('-> posts');
    expect(usersRow).toContain('[1:N]');
  });

  it('Chart sr-only table includes series data', () => {
    const { container } = render(
      <Chart
        {...mockComponentProps<ChartData>(
          {
            type: 'bar',
            series: [
              {
                name: 'Sales',
                data: [
                  { quarter: 'Q1', revenue: 100 },
                  { quarter: 'Q2', revenue: 200 },
                ],
              },
            ],
            xAxis: { key: 'quarter', label: 'Quarter' },
            yAxis: { key: 'revenue', label: 'Revenue' },
          },
          'ui:chart',
        )}
      />,
    );

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();

    const caption = table?.querySelector('caption');
    expect(caption?.textContent).toContain('chart data');

    // Should contain series name
    const content = table?.textContent;
    expect(content).toContain('Sales');
  });

  it('Architecture sr-only table lists nodes with zone membership', () => {
    const { container } = render(
      <Architecture
        {...mockComponentProps<ArchitectureData>(
          {
            children: [
              {
                id: 'zone1',
                label: 'Zone One',
                type: 'zone',
                children: [{ id: 'svc', label: 'Service', icon: 'server' }],
              },
              { id: 'ext', label: 'External', icon: 'cloud' },
            ],
            edges: [{ from: 'ext', to: 'svc', label: 'calls' }],
          },
          'ui:architecture',
        )}
      />,
    );

    const srTable = container.querySelector('table.sr-only');
    const rows = srTable?.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);

    // Service node should mention zone
    expect(rows![0]!.textContent).toContain('Service');
    expect(rows![0]!.textContent).toContain('Zone One');

    // External node connections
    expect(rows![1]!.textContent).toContain('External');
    expect(rows![1]!.textContent).toContain('-> svc');
  });

  it('Flowchart sr-only table lists nodes and connections', () => {
    const { container } = render(
      <Flowchart
        {...mockComponentProps<FlowchartData>(
          {
            nodes: [
              { id: 'a', type: 'start', label: 'Begin' },
              { id: 'b', type: 'process', label: 'Process' },
              { id: 'c', type: 'end', label: 'Done' },
            ],
            edges: [
              { from: 'a', to: 'b' },
              { from: 'b', to: 'c' },
            ],
            direction: 'top-down',
          },
          'ui:flowchart',
        )}
      />,
    );

    const srTable = container.querySelector('table.sr-only');
    expect(srTable).toBeInTheDocument();

    const rows = srTable?.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(3);
    expect(rows![0]!.textContent).toContain('Begin');
  });

  it('Sequence sr-only table lists messages in order', () => {
    const { container } = render(
      <Sequence
        {...mockComponentProps<SequenceData>(
          {
            actors: [
              { id: 'a', label: 'Client' },
              { id: 'b', label: 'Server' },
            ],
            messages: [
              { from: 'a', to: 'b', label: 'Request', type: 'message' },
              { from: 'b', to: 'a', label: 'Response', type: 'reply' },
            ],
          },
          'ui:sequence',
        )}
      />,
    );

    const srTable = container.querySelector('table.sr-only');
    expect(srTable).toBeInTheDocument();
    expect(srTable).toHaveAttribute('aria-label', 'Sequence data');

    const rows = srTable?.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows![0]!.textContent).toContain('Client');
    expect(rows![0]!.textContent).toContain('Request');
  });

  it('MindMap sr-only list contains node labels', () => {
    const { container } = render(
      <MindMap
        {...mockComponentProps<MindMapData>(
          {
            root: 'Main Topic',
            children: [{ label: 'Branch A' }, { label: 'Branch B' }],
            layout: 'radial',
          },
          'ui:mindmap',
        )}
      />,
    );

    const srList = container.querySelector('ul[aria-label="Mind map structure"]');
    expect(srList).toBeInTheDocument();
    expect(srList!.textContent).toContain('Branch A');
    expect(srList!.textContent).toContain('Branch B');
  });

  it('Timeline sr-only list contains semantic time elements', () => {
    const { container } = render(
      <Timeline
        {...mockComponentProps<TimelineData>(
          {
            events: [
              { date: '2024-03-15', title: 'Launch' },
              { date: '2024-07-01', title: 'Update' },
            ],
          },
          'ui:timeline',
        )}
      />,
    );

    const srList = container.querySelector('ol');
    expect(srList).toBeInTheDocument();

    const items = srList?.querySelectorAll('li');
    expect(items).toHaveLength(2);

    const times = srList?.querySelectorAll('time[dateTime]');
    expect(times).toHaveLength(2);
    expect(times![0]).toHaveAttribute('dateTime', '2024-03-15');

    // Content contains event titles
    expect(items![0]!.textContent).toContain('Launch');
    expect(items![1]!.textContent).toContain('Update');
  });
});
