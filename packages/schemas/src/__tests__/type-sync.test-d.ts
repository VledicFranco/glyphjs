/**
 * Cross-package schema ↔ interface sync check.
 *
 * Uses vitest `expectTypeOf` to verify that `z.infer<typeof schema>` is
 * bidirectionally assignable with each component's exported data interface.
 * Fails at compile time if the types drift apart.
 */
import { expectTypeOf } from 'vitest';
import type { z } from 'zod';

// ─── Schemas ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- typeof needs value imports for z.infer
import {
  calloutSchema,
  tabsSchema,
  stepsSchema,
  tableSchema,
  graphSchema,
  chartSchema,
  relationSchema,
  timelineSchema,
  architectureSchema,
  kpiSchema,
  accordionSchema,
  comparisonSchema,
  codediffSchema,
  flowchartSchema,
  filetreeSchema,
  sequenceSchema,
  mindmapSchema,
  equationSchema,
  quizSchema,
  cardSchema,
  infographicSchema,
} from '../index.js';

// ─── Component Data Interfaces ──────────────────────────────
import type { CalloutData } from '../../../components/src/callout/Callout';
import type { TabsData } from '../../../components/src/tabs/Tabs';
import type { StepsData } from '../../../components/src/steps/Steps';
import type { TableData } from '../../../components/src/table/Table';
import type { GraphData } from '../../../components/src/graph/Graph';
import type { ChartData } from '../../../components/src/chart/Chart';
import type { RelationData } from '../../../components/src/relation/Relation';
import type { TimelineData } from '../../../components/src/timeline/Timeline';
import type { ArchitectureData } from '../../../components/src/architecture/Architecture';
import type { KpiData } from '../../../components/src/kpi/Kpi';
import type { AccordionData } from '../../../components/src/accordion/Accordion';
import type { ComparisonData } from '../../../components/src/comparison/Comparison';
import type { CodeDiffData } from '../../../components/src/codediff/CodeDiff';
import type { FlowchartData } from '../../../components/src/flowchart/Flowchart';
import type { FileTreeData } from '../../../components/src/filetree/FileTree';
import type { SequenceData } from '../../../components/src/sequence/Sequence';
import type { MindMapData } from '../../../components/src/mindmap/MindMap';
import type { EquationData } from '../../../components/src/equation/Equation';
import type { QuizData } from '../../../components/src/quiz/Quiz';
import type { CardData } from '../../../components/src/card/Card';
import type { InfographicData } from '../../../components/src/infographic/Infographic';

// ─── Sync Assertions ────────────────────────────────────────
// Each assertion verifies that the Zod-inferred type extends the
// component interface AND vice versa (bidirectional assignability).

expectTypeOf<z.infer<typeof calloutSchema>>().toEqualTypeOf<CalloutData>();
expectTypeOf<z.infer<typeof tabsSchema>>().toEqualTypeOf<TabsData>();
expectTypeOf<z.infer<typeof stepsSchema>>().toEqualTypeOf<StepsData>();
expectTypeOf<z.infer<typeof tableSchema>>().toEqualTypeOf<TableData>();
expectTypeOf<z.infer<typeof graphSchema>>().toEqualTypeOf<GraphData>();
expectTypeOf<z.infer<typeof chartSchema>>().toEqualTypeOf<ChartData>();
expectTypeOf<z.infer<typeof relationSchema>>().toEqualTypeOf<RelationData>();
expectTypeOf<z.infer<typeof timelineSchema>>().toEqualTypeOf<TimelineData>();
expectTypeOf<z.infer<typeof architectureSchema>>().toEqualTypeOf<ArchitectureData>();
expectTypeOf<z.infer<typeof kpiSchema>>().toEqualTypeOf<KpiData>();
expectTypeOf<z.infer<typeof accordionSchema>>().toEqualTypeOf<AccordionData>();
expectTypeOf<z.infer<typeof comparisonSchema>>().toEqualTypeOf<ComparisonData>();
expectTypeOf<z.infer<typeof codediffSchema>>().toEqualTypeOf<CodeDiffData>();
expectTypeOf<z.infer<typeof flowchartSchema>>().toEqualTypeOf<FlowchartData>();
expectTypeOf<z.infer<typeof filetreeSchema>>().toEqualTypeOf<FileTreeData>();
expectTypeOf<z.infer<typeof sequenceSchema>>().toEqualTypeOf<SequenceData>();
expectTypeOf<z.infer<typeof mindmapSchema>>().toEqualTypeOf<MindMapData>();
expectTypeOf<z.infer<typeof equationSchema>>().toEqualTypeOf<EquationData>();
expectTypeOf<z.infer<typeof quizSchema>>().toEqualTypeOf<QuizData>();
expectTypeOf<z.infer<typeof cardSchema>>().toEqualTypeOf<CardData>();
expectTypeOf<z.infer<typeof infographicSchema>>().toEqualTypeOf<InfographicData>();
