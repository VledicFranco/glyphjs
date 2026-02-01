// ─── Inline Nodes (PhrasingContent) ──────────────────────────

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'emphasis'; children: InlineNode[] }
  | { type: 'delete'; children: InlineNode[] }
  | { type: 'inlineCode'; value: string }
  | { type: 'link'; url: string; title?: string; children: InlineNode[] }
  | { type: 'image'; src: string; alt?: string; title?: string }
  | { type: 'break' };

// ─── Standard Markdown Block Data ────────────────────────────

export interface HeadingData {
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
}

export interface ParagraphData {
  children: InlineNode[];
}

export interface ListData {
  ordered: boolean;
  start?: number;
  items: ListItemData[];
}

export interface ListItemData {
  children: InlineNode[];
  subList?: ListData;
}

export interface CodeData {
  language?: string;
  value: string;
  meta?: string;
}

export interface BlockquoteData {
  children: InlineNode[];
}

export interface ImageData {
  src: string;
  alt?: string;
  title?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ThematicBreakData {
  // No data — just a horizontal rule
}

export interface HtmlData {
  value: string;
}

// ─── Type-safe BlockData union ───────────────────────────────

export type BlockData =
  | HeadingData
  | ParagraphData
  | ListData
  | CodeData
  | BlockquoteData
  | ImageData
  | ThematicBreakData
  | HtmlData
  | Record<string, unknown>;
