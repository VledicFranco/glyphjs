import type { BlockType } from './ir.js';

// ─── Base ────────────────────────────────────────────────────

export interface InteractionEventBase {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Block ID of the component that emitted the event */
  blockId: string;
  /** Component type, e.g. 'ui:quiz' */
  blockType: BlockType;
  /**
   * Document ID (from GlyphIR.id).
   * Injected by the runtime — components do not set this field.
   */
  documentId: string;
}

// ─── Table ───────────────────────────────────────────────────

/** Snapshot of the Table component's full interactive state. */
export interface TableState {
  sort: { column: string; direction: 'asc' | 'desc' } | null;
  filters: Record<string, string>;
  visibleRowCount: number;
  totalRowCount: number;
}

export interface TableSortEvent extends InteractionEventBase {
  kind: 'table-sort';
  payload: {
    column: string;
    direction: 'asc' | 'desc' | 'none';
    state: TableState;
  };
}

export interface TableFilterEvent extends InteractionEventBase {
  kind: 'table-filter';
  payload: {
    column: string;
    value: string;
    state: TableState;
  };
}

// ─── Quiz ────────────────────────────────────────────────────

export interface QuizSubmitEvent extends InteractionEventBase {
  kind: 'quiz-submit';
  payload: {
    questionIndex: number;
    question: string;
    selected: string[];
    correct: boolean;
    score: { correct: number; total: number };
  };
}

// ─── Tabs ────────────────────────────────────────────────────

export interface TabSelectEvent extends InteractionEventBase {
  kind: 'tab-select';
  payload: {
    tabIndex: number;
    tabLabel: string;
  };
}

// ─── Accordion ───────────────────────────────────────────────

export interface AccordionToggleEvent extends InteractionEventBase {
  kind: 'accordion-toggle';
  payload: {
    sectionIndex: number;
    sectionTitle: string;
    expanded: boolean;
  };
}

// ─── FileTree ────────────────────────────────────────────────

export interface FileTreeSelectEvent extends InteractionEventBase {
  kind: 'filetree-select';
  payload: {
    path: string;
    type: 'file' | 'directory';
    expanded?: boolean;
  };
}

// ─── Graph (Phase 3) ────────────────────────────────────────

export interface GraphNodeClickEvent extends InteractionEventBase {
  kind: 'graph-node-click';
  payload: {
    nodeId: string;
    nodeLabel?: string;
  };
}

// ─── Chart (Phase 3) ────────────────────────────────────────

export interface ChartSelectEvent extends InteractionEventBase {
  kind: 'chart-select';
  payload: {
    seriesIndex: number;
    dataIndex: number;
    label: string;
    value: number;
  };
}

// ─── Comparison (Phase 3) ───────────────────────────────────

export interface ComparisonSelectEvent extends InteractionEventBase {
  kind: 'comparison-select';
  payload: {
    optionIndex: number;
    optionName: string;
  };
}

// ─── Poll ───────────────────────────────────────────────────

export interface PollVoteEvent extends InteractionEventBase {
  kind: 'poll-vote';
  payload: {
    selectedOptions: string[];
    selectedIndices: number[];
  };
}

// ─── Rating ─────────────────────────────────────────────────

export interface RatingChangeEvent extends InteractionEventBase {
  kind: 'rating-change';
  payload: {
    itemIndex: number;
    itemLabel: string;
    value: number;
    allRatings: { label: string; value: number | null }[];
  };
}

// ─── Ranker ─────────────────────────────────────────────────

export interface RankerReorderEvent extends InteractionEventBase {
  kind: 'ranker-reorder';
  payload: {
    orderedItems: { id: string; label: string; rank: number }[];
    movedItem: { id: string; label: string; fromRank: number; toRank: number };
  };
}

// ─── Slider ─────────────────────────────────────────────────

export interface SliderChangeEvent extends InteractionEventBase {
  kind: 'slider-change';
  payload: {
    parameterId: string;
    parameterLabel: string;
    value: number;
    allValues: { id: string; label: string; value: number }[];
  };
}

// ─── Matrix ─────────────────────────────────────────────────

export interface MatrixChangeEvent extends InteractionEventBase {
  kind: 'matrix-change';
  payload: {
    rowId: string;
    rowLabel: string;
    columnId: string;
    columnLabel: string;
    value: number;
    allValues: Record<string, Record<string, number>>;
    weightedTotals: { rowId: string; rowLabel: string; total: number }[];
  };
}

// ─── Form ───────────────────────────────────────────────────

export interface FormSubmitEvent extends InteractionEventBase {
  kind: 'form-submit';
  payload: {
    values: Record<string, string | number | boolean>;
    fields: { id: string; label: string; type: string; value: string | number | boolean }[];
  };
}

// ─── Kanban ─────────────────────────────────────────────────

export interface KanbanMoveEvent extends InteractionEventBase {
  kind: 'kanban-move';
  payload: {
    cardId: string;
    cardTitle: string;
    sourceColumnId: string;
    sourceColumnTitle: string;
    destinationColumnId: string;
    destinationColumnTitle: string;
    position: number;
    allColumns: { id: string; title: string; cardIds: string[] }[];
  };
}

// ─── Annotate ───────────────────────────────────────────────

export interface AnnotateCreateEvent extends InteractionEventBase {
  kind: 'annotate-create';
  payload: {
    start: number;
    end: number;
    selectedText: string;
    label: string;
    allAnnotations: { start: number; end: number; text: string; label: string }[];
  };
}

// ─── Custom (plugin extensibility) ──────────────────────────

/** Extensibility for plugin-authored components (mirrors ReferenceType pattern) */
export interface CustomInteractionEvent extends InteractionEventBase {
  kind: `custom:${string}`;
  payload: Record<string, unknown>;
}

// ─── Union ───────────────────────────────────────────────────

export type InteractionEvent =
  | QuizSubmitEvent
  | TableSortEvent
  | TableFilterEvent
  | TabSelectEvent
  | AccordionToggleEvent
  | FileTreeSelectEvent
  | GraphNodeClickEvent
  | ChartSelectEvent
  | ComparisonSelectEvent
  | PollVoteEvent
  | RatingChangeEvent
  | RankerReorderEvent
  | SliderChangeEvent
  | MatrixChangeEvent
  | FormSubmitEvent
  | KanbanMoveEvent
  | AnnotateCreateEvent
  | CustomInteractionEvent;

/** Discriminant values for exhaustive switch */
export type InteractionKind = InteractionEvent['kind'];
