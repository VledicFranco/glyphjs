import { useState, useRef, useCallback, type ReactElement, type MouseEvent } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import {
  containerStyle,
  headerStyle,
  bodyStyle,
  textPaneStyle,
  labelPickerStyle,
  labelOptionStyle,
  colorDotStyle,
  sidebarStyle,
  sidebarHeaderStyle,
  annotationItemStyle,
  annotationTextStyle,
  annotationNoteStyle,
} from './styles.js';

// ─── Types ─────────────────────────────────────────────────────

export interface AnnotateLabel {
  name: string;
  color: string;
}

export interface Annotation {
  start: number;
  end: number;
  label: string;
  note?: string;
}

export interface AnnotateData {
  title?: string;
  labels: AnnotateLabel[];
  text: string;
  annotations?: Annotation[];
}

// ─── Helpers ───────────────────────────────────────────────────

interface TextSegment {
  text: string;
  start: number;
  annotation: Annotation | null;
}

function computeSegments(text: string, annotations: Annotation[]): TextSegment[] {
  if (annotations.length === 0) {
    return [{ text, start: 0, annotation: null }];
  }

  const sorted = [...annotations].sort((a, b) => a.start - b.start);
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const ann of sorted) {
    if (ann.start > cursor) {
      segments.push({ text: text.slice(cursor, ann.start), start: cursor, annotation: null });
    }
    segments.push({
      text: text.slice(ann.start, ann.end),
      start: ann.start,
      annotation: ann,
    });
    cursor = ann.end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), start: cursor, annotation: null });
  }

  return segments;
}

// ─── Component ─────────────────────────────────────────────────

export function Annotate({
  data,
  block,
  onInteraction,
}: GlyphComponentProps<AnnotateData>): ReactElement {
  const { title, labels, text } = data;
  const baseId = `glyph-annotate-${block.id}`;

  const [annotations, setAnnotations] = useState<Annotation[]>(data.annotations ?? []);
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number } | null>(null);
  const [pendingSelection, setPendingSelection] = useState<{
    start: number;
    end: number;
    text: string;
  } | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback((): void => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !textRef.current) return;

    const range = selection.getRangeAt(0);
    if (!range || !textRef.current.contains(range.commonAncestorContainer)) return;

    // Calculate offsets from the text content
    const selectedText = selection.toString();
    if (!selectedText.trim()) return;

    // Compute the actual offset from the text container using the Range API
    const preCaretRange = document.createRange();
    preCaretRange.selectNodeContents(textRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = preCaretRange.toString().length;
    const endOffset = startOffset + selectedText.length;

    const rect = range.getBoundingClientRect();
    const containerRect = textRef.current.getBoundingClientRect();

    setPendingSelection({ start: startOffset, end: endOffset, text: selectedText });
    setPickerPos({
      x: rect.left - containerRect.left,
      y: rect.bottom - containerRect.top + 4,
    });
  }, []);

  const selectLabel = (labelName: string): void => {
    if (!pendingSelection) return;

    const newAnnotation: Annotation = {
      start: pendingSelection.start,
      end: pendingSelection.end,
      label: labelName,
    };

    const newAnnotations = [...annotations, newAnnotation];
    setAnnotations(newAnnotations);
    setPickerPos(null);
    setPendingSelection(null);
    window.getSelection()?.removeAllRanges();

    if (onInteraction) {
      onInteraction({
        kind: 'annotate-create',
        timestamp: new Date().toISOString(),
        blockId: block.id,
        blockType: block.type,
        payload: {
          start: newAnnotation.start,
          end: newAnnotation.end,
          selectedText: pendingSelection.text,
          label: labelName,
          allAnnotations: newAnnotations.map((a) => ({
            start: a.start,
            end: a.end,
            text: text.slice(a.start, a.end),
            label: a.label,
          })),
        },
      });
    }
  };

  const closePicker = (e: MouseEvent): void => {
    if ((e.target as HTMLElement).closest('[data-label-picker]')) return;
    setPickerPos(null);
    setPendingSelection(null);
  };

  const segments = computeSegments(text, annotations);
  const labelColorMap = new Map(labels.map((l) => [l.name, l.color]));

  return (
    <div
      id={baseId}
      role="region"
      aria-label={title ?? 'Annotate'}
      style={containerStyle}
      onClick={closePicker}
    >
      {title && <div style={headerStyle}>{title}</div>}

      <div style={bodyStyle}>
        <div ref={textRef} role="document" style={textPaneStyle} onMouseUp={handleMouseUp}>
          {segments.map((seg, i) => {
            if (seg.annotation) {
              const color = labelColorMap.get(seg.annotation.label) ?? '#888';
              return (
                <mark
                  key={i}
                  style={{
                    backgroundColor: `${color}33`,
                    borderBottom: `2px solid ${color}`,
                    padding: '0 1px',
                  }}
                  title={`${seg.annotation.label}${seg.annotation.note ? `: ${seg.annotation.note}` : ''}`}
                >
                  {seg.text}
                </mark>
              );
            }
            return <span key={i}>{seg.text}</span>;
          })}

          {pickerPos && (
            <div
              role="menu"
              data-label-picker
              style={{
                ...labelPickerStyle,
                left: `${String(pickerPos.x)}px`,
                top: `${String(pickerPos.y)}px`,
              }}
            >
              {labels.map((label) => (
                <button
                  key={label.name}
                  role="menuitem"
                  style={labelOptionStyle()}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectLabel(label.name);
                  }}
                >
                  <span style={colorDotStyle(label.color)} />
                  {label.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={sidebarStyle} role="complementary" aria-label="Annotations">
          <div style={sidebarHeaderStyle}>Annotations ({String(annotations.length)})</div>
          <div role="list">
            {annotations.map((ann, i) => {
              const color = labelColorMap.get(ann.label) ?? '#888';
              return (
                <div key={i} role="listitem" style={annotationItemStyle(color)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={colorDotStyle(color)} />
                    <strong style={{ fontSize: '0.75rem' }}>{ann.label}</strong>
                  </div>
                  <div style={annotationTextStyle}>{text.slice(ann.start, ann.end)}</div>
                  {ann.note && <div style={annotationNoteStyle}>{ann.note}</div>}
                </div>
              );
            })}
            {annotations.length === 0 && (
              <div
                style={{
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--glyph-text-muted, #6b7a94)',
                }}
              >
                Select text to add annotations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
