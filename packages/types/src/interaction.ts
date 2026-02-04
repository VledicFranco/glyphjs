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
  | CustomInteractionEvent;

/** Discriminant values for exhaustive switch */
export type InteractionKind = InteractionEvent['kind'];
