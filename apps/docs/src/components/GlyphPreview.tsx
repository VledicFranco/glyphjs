import { useMemo, useCallback, useRef } from 'react';
import { compile } from '@glyphjs/compiler';
import { createGlyphRuntime } from '@glyphjs/runtime';
import type { GlyphTheme, InteractionEvent } from '@glyphjs/types';
import { useStarlightTheme } from './useStarlightTheme.js';
import { useInteractionLog } from './useInteractionLog.js';
import EventLog from './EventLog.js';
import {
  calloutDefinition,
  chartDefinition,
  graphDefinition,
  relationDefinition,
  stepsDefinition,
  tableDefinition,
  tabsDefinition,
  timelineDefinition,
  architectureDefinition,
  kpiDefinition,
  accordionDefinition,
  comparisonDefinition,
  codeDiffDefinition,
  flowchartDefinition,
  fileTreeDefinition,
  sequenceDefinition,
  mindMapDefinition,
  equationDefinition,
  quizDefinition,
  cardDefinition,
  infographicDefinition,
  pollDefinition,
  ratingDefinition,
  rankerDefinition,
  sliderDefinition,
  matrixDefinition,
  formDefinition,
  kanbanDefinition,
  annotateDefinition,
} from '@glyphjs/components';

const allComponents = [
  calloutDefinition,
  chartDefinition,
  graphDefinition,
  relationDefinition,
  stepsDefinition,
  tableDefinition,
  tabsDefinition,
  timelineDefinition,
  architectureDefinition,
  kpiDefinition,
  accordionDefinition,
  comparisonDefinition,
  codeDiffDefinition,
  flowchartDefinition,
  fileTreeDefinition,
  sequenceDefinition,
  mindMapDefinition,
  equationDefinition,
  quizDefinition,
  cardDefinition,
  infographicDefinition,
  pollDefinition,
  ratingDefinition,
  rankerDefinition,
  sliderDefinition,
  matrixDefinition,
  formDefinition,
  kanbanDefinition,
  annotateDefinition,
];

interface GlyphPreviewProps {
  source: string;
  theme?: GlyphTheme;
  interactive?: boolean;
}

export default function GlyphPreview({
  source,
  theme: customTheme,
  interactive,
}: GlyphPreviewProps) {
  const starlightTheme = useStarlightTheme();
  const { events, addEvent, clearEvents } = useInteractionLog();

  const onInteractionRef = useRef<(event: InteractionEvent) => void>(addEvent);
  onInteractionRef.current = addEvent;

  const stableOnInteraction = useCallback((event: InteractionEvent) => {
    onInteractionRef.current(event);
  }, []);

  const runtime = useMemo(
    () =>
      createGlyphRuntime({
        theme: customTheme ?? starlightTheme,
        components: allComponents,
        ...(interactive ? { onInteraction: stableOnInteraction } : {}),
      }),
    [customTheme, starlightTheme, interactive, stableOnInteraction],
  );

  const { ir, error } = useMemo(() => {
    try {
      const result = compile(source);
      return { ir: result.ir, error: null };
    } catch (e) {
      return { ir: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [source]);

  const GlyphDocument = runtime.GlyphDocument;

  return (
    <div
      data-glyph-preview
      data-glyph-status={error ? 'error' : ir ? 'ready' : 'empty'}
      style={{
        borderRadius: '3px',
        padding: '1.5rem',
        margin: '1rem 0',
      }}
    >
      {error ? (
        <div style={{ color: '#c84a4a', fontFamily: 'monospace', fontSize: '13px' }}>{error}</div>
      ) : ir ? (
        <GlyphDocument ir={ir} />
      ) : null}
      {interactive && <EventLog events={events} onClear={clearEvents} />}
    </div>
  );
}
