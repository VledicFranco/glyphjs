// @glyphjs/components — barrel file

export { calloutDefinition, Callout } from './callout/index.js';
export { chartDefinition, Chart } from './chart/index.js';
export type { CalloutData } from './callout/index.js';
export { stepsDefinition, Steps } from './steps/index.js';
export type { StepsData } from './steps/index.js';
export { tableDefinition, Table } from './table/index.js';
export type { TableData } from './table/index.js';
export { tabsDefinition, Tabs } from './tabs/index.js';
export type { TabsData } from './tabs/index.js';
export { timelineDefinition, Timeline } from './timeline/index.js';
export type { TimelineData } from './timeline/index.js';
export { graphDefinition, Graph, computeDagreLayout, computeForceLayout } from './graph/index.js';
export type { GraphData, PositionedNode, PositionedEdge, LayoutResult } from './graph/index.js';
export { relationDefinition, Relation } from './relation/index.js';
export type { RelationData } from './relation/index.js';
export { kpiDefinition, Kpi } from './kpi/index.js';
export type { KpiData, KpiMetric } from './kpi/index.js';
export { accordionDefinition, Accordion } from './accordion/index.js';
export type { AccordionData, AccordionSection } from './accordion/index.js';
export { comparisonDefinition, Comparison } from './comparison/index.js';
export type { ComparisonData, ComparisonOption, ComparisonFeature } from './comparison/index.js';
export { codeDiffDefinition, CodeDiff, computeDiff } from './codediff/index.js';
export type { CodeDiffData, DiffLine, DiffLineKind } from './codediff/index.js';
export { flowchartDefinition, Flowchart } from './flowchart/index.js';
export type { FlowchartData } from './flowchart/index.js';
export { fileTreeDefinition, FileTree } from './filetree/index.js';
export type { FileTreeData } from './filetree/index.js';
export { sequenceDefinition, Sequence } from './sequence/index.js';
export type { SequenceData } from './sequence/index.js';
export {
  architectureDefinition,
  Architecture,
  computeArchitectureLayout,
} from './architecture/index.js';
export type {
  ArchitectureData,
  ArchitectureLayout,
  PositionedArchNode,
  PositionedZone,
  PositionedArchEdge,
} from './architecture/index.js';
export { mindMapDefinition, MindMap } from './mindmap/index.js';
export type { MindMapData } from './mindmap/index.js';
export { equationDefinition, Equation } from './equation/index.js';
export type { EquationData, EquationStep } from './equation/index.js';
export { quizDefinition, Quiz } from './quiz/index.js';
export type { QuizData, QuizQuestion } from './quiz/index.js';
export { cardDefinition, Card } from './card/index.js';
export type { CardData, CardItem, CardAction } from './card/index.js';
export { infographicDefinition, Infographic } from './infographic/index.js';
export type {
  InfographicData,
  InfographicSection,
  InfographicItem,
  PieItem,
  PieSlice,
  DividerItem,
  RatingItem,
} from './infographic/index.js';
export { pollDefinition, Poll } from './poll/index.js';
export type { PollData } from './poll/index.js';
export { ratingDefinition, Rating } from './rating/index.js';
export type { RatingData } from './rating/index.js';
export type { RatingItem as RatingScaleItem } from './rating/index.js';
export { rankerDefinition, Ranker } from './ranker/index.js';
export type { RankerData, RankerItemData } from './ranker/index.js';
export { sliderDefinition, Slider } from './slider/index.js';
export type { SliderData, SliderParameter } from './slider/index.js';
export { matrixDefinition, Matrix } from './matrix/index.js';
export type { MatrixData, MatrixColumn, MatrixRow } from './matrix/index.js';
export { formDefinition, Form } from './form/index.js';
export type { FormData, FormField } from './form/index.js';
export { kanbanDefinition, Kanban } from './kanban/index.js';
export type { KanbanData, KanbanColumn, KanbanCard } from './kanban/index.js';
export { annotateDefinition, Annotate } from './annotate/index.js';
export type { AnnotateData, AnnotateLabel, Annotation } from './annotate/index.js';

// All component definitions (for CLI / batch registration)
import { calloutDefinition as _callout } from './callout/index.js';
import { chartDefinition as _chart } from './chart/index.js';
import { stepsDefinition as _steps } from './steps/index.js';
import { tableDefinition as _table } from './table/index.js';
import { tabsDefinition as _tabs } from './tabs/index.js';
import { timelineDefinition as _timeline } from './timeline/index.js';
import { graphDefinition as _graph } from './graph/index.js';
import { relationDefinition as _relation } from './relation/index.js';
import { kpiDefinition as _kpi } from './kpi/index.js';
import { accordionDefinition as _accordion } from './accordion/index.js';
import { comparisonDefinition as _comparison } from './comparison/index.js';
import { codeDiffDefinition as _codeDiff } from './codediff/index.js';
import { flowchartDefinition as _flowchart } from './flowchart/index.js';
import { fileTreeDefinition as _fileTree } from './filetree/index.js';
import { sequenceDefinition as _sequence } from './sequence/index.js';
import { architectureDefinition as _architecture } from './architecture/index.js';
import { mindMapDefinition as _mindMap } from './mindmap/index.js';
import { equationDefinition as _equation } from './equation/index.js';
import { quizDefinition as _quiz } from './quiz/index.js';
import { cardDefinition as _card } from './card/index.js';
import { infographicDefinition as _infographic } from './infographic/index.js';
import { pollDefinition as _poll } from './poll/index.js';
import { ratingDefinition as _rating } from './rating/index.js';
import { rankerDefinition as _ranker } from './ranker/index.js';
import { sliderDefinition as _slider } from './slider/index.js';
import { matrixDefinition as _matrix } from './matrix/index.js';
import { formDefinition as _form } from './form/index.js';
import { kanbanDefinition as _kanban } from './kanban/index.js';
import { annotateDefinition as _annotate } from './annotate/index.js';

export const allComponentDefinitions = [
  _callout,
  _chart,
  _steps,
  _table,
  _tabs,
  _timeline,
  _graph,
  _relation,
  _kpi,
  _accordion,
  _comparison,
  _codeDiff,
  _flowchart,
  _fileTree,
  _sequence,
  _architecture,
  _mindMap,
  _equation,
  _quiz,
  _card,
  _infographic,
  _poll,
  _rating,
  _ranker,
  _slider,
  _matrix,
  _form,
  _kanban,
  _annotate,
] as const;
