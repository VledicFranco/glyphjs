import type { ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

export interface FunnelStage {
  label: string;
  value: number;
  description?: string;
}

export interface FunnelData {
  title?: string;
  stages: FunnelStage[];
  showConversion?: boolean;
  orientation?: 'vertical' | 'horizontal';
  unit?: string;
}

// ─── Layout constants ──────────────────────────────────────────

const VERTICAL_WIDTH = 520;
const VERTICAL_STAGE_HEIGHT = 72;
const VERTICAL_GAP = 12;
const VERTICAL_SIDE_PADDING = 16;
const VERTICAL_ANNOTATION_COL = 120;

const HORIZONTAL_HEIGHT = 320;
const HORIZONTAL_STAGE_WIDTH = 120;
const HORIZONTAL_GAP = 12;
const HORIZONTAL_TOP_PADDING = 12;
const HORIZONTAL_ANNOTATION_ROW = 36; // conv % + drop count above each gap
const HORIZONTAL_LABEL_ROW = 40; // stage name + value below each trapezoid
const HORIZONTAL_BOTTOM_PADDING = 12;

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Returns a defensive copy of stages where each stage's value is clamped to
 * be at most the previous stage's value. The Zod schema already enforces
 * monotonic decrease, but we clamp at render time to avoid inverted
 * trapezoids if a caller bypasses validation.
 */
function clampStages(stages: FunnelStage[]): FunnelStage[] {
  const first = stages[0];
  if (first === undefined) return stages;
  const out: FunnelStage[] = [first];
  for (let i = 1; i < stages.length; i++) {
    const current = stages[i];
    const prev = out[i - 1];
    if (current === undefined || prev === undefined) continue;
    out.push({ ...current, value: Math.min(current.value, prev.value) });
  }
  return out;
}

function formatConversion(pct: number): string {
  if (!Number.isFinite(pct)) return '0%';
  if (pct < 10) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
}

function formatValue(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * Stage fill is a single hue (`--glyph-palette-color-1`) at decreasing
 * opacity per index: 1.0, 0.85, 0.70, 0.55, then floors at 0.45. This makes
 * the funnel read as ONE tapering shape rather than a stack of unrelated
 * coloured blocks. Floor of 0.45 keeps the deepest stages legible against
 * light backgrounds.
 */
const STAGE_FILL_HUE = 'var(--glyph-palette-color-1, #00d4aa)';
const STAGE_OPACITY_FLOOR = 0.45;
const STAGE_OPACITY_STEP = 0.15;

function stageOpacity(index: number): number {
  return Math.max(STAGE_OPACITY_FLOOR, 1 - index * STAGE_OPACITY_STEP);
}

function stageAriaLabel(
  stage: FunnelStage,
  index: number,
  prev: FunnelStage | null,
  unit?: string,
): string {
  const unitText = unit ? ` ${unit}` : '';
  const base = `Stage ${String(index + 1)}: ${stage.label}, ${formatValue(stage.value)}${unitText}`;
  if (prev === null) {
    return `${base}, 100% of total`;
  }
  const pct = prev.value === 0 ? 0 : (stage.value / prev.value) * 100;
  return `${base}, ${formatConversion(pct)} of previous`;
}

// ─── Component ─────────────────────────────────────────────────

/**
 * Renders a monotonically-decreasing sequence of stages as a tapering
 * trapezoid funnel. Conversion percentages and drop counts appear between
 * stages when `showConversion` is enabled.
 *
 * Theming is driven by CSS custom properties; no component-specific vars:
 *  - `--glyph-palette-color-1` (single hue used for every stage; opacity is
 *    stepped per stage so the funnel reads as ONE shape narrowing rather
 *    than a series of unrelated blocks)
 *  - `--glyph-color-error` (drop count color)
 *  - `--glyph-text` (body text)
 *  - `--glyph-text-muted` (percentage + description)
 *  - `--glyph-heading` (title color)
 */
export function Funnel({ data, block }: GlyphComponentProps<FunnelData>): ReactElement {
  const { title, stages: rawStages, showConversion = true, orientation = 'vertical', unit } = data;

  const stages = clampStages(rawStages);
  const maxValue = stages[0]?.value ?? 0;
  const baseId = `glyph-funnel-${block.id}`;

  const regionLabel = title ?? 'Funnel';

  return (
    <div
      id={baseId}
      role="region"
      aria-label={regionLabel}
      style={{
        fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
        color: 'var(--glyph-text, #1a2035)',
        padding: 'var(--glyph-spacing-md, 1rem)',
        margin: 'var(--glyph-spacing-sm, 0.5rem) 0',
      }}
    >
      {title ? (
        <div
          style={{
            fontWeight: 600,
            fontSize: '1.125rem',
            marginBottom: 'var(--glyph-spacing-sm, 0.5rem)',
            color: 'var(--glyph-heading, #0a0e1a)',
          }}
        >
          {title}
        </div>
      ) : null}

      {orientation === 'vertical' ? (
        <VerticalFunnel
          stages={stages}
          maxValue={maxValue}
          showConversion={showConversion}
          unit={unit}
        />
      ) : (
        <HorizontalFunnel
          stages={stages}
          maxValue={maxValue}
          showConversion={showConversion}
          unit={unit}
        />
      )}
    </div>
  );
}

// ─── Vertical orientation ──────────────────────────────────────

interface OrientationProps {
  stages: FunnelStage[];
  maxValue: number;
  showConversion: boolean;
  unit?: string;
}

function VerticalFunnel({
  stages,
  maxValue,
  showConversion,
  unit,
}: OrientationProps): ReactElement {
  const trapezoidAreaWidth = VERTICAL_WIDTH - VERTICAL_ANNOTATION_COL - VERTICAL_SIDE_PADDING * 2;
  const centerX = VERTICAL_SIDE_PADDING + trapezoidAreaWidth / 2;
  const totalHeight =
    stages.length * VERTICAL_STAGE_HEIGHT + Math.max(0, stages.length - 1) * VERTICAL_GAP;

  const widthForValue = (v: number): number =>
    maxValue === 0 ? 0 : trapezoidAreaWidth * (v / maxValue);

  return (
    <ol
      role="list"
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      <svg
        width="100%"
        viewBox={`0 0 ${String(VERTICAL_WIDTH)} ${String(totalHeight)}`}
        preserveAspectRatio="xMidYMin meet"
        aria-hidden="true"
        style={{ display: 'block', maxWidth: '100%', overflow: 'visible' }}
      >
        {stages.map((stage, i) => {
          const prev = i === 0 ? stage : (stages[i - 1] ?? stage);
          const topWidth = widthForValue(prev.value);
          const bottomWidth = widthForValue(stage.value);
          const y = i * (VERTICAL_STAGE_HEIGHT + VERTICAL_GAP);
          const fillOpacity = stageOpacity(i);

          const topLeft = centerX - topWidth / 2;
          const topRight = centerX + topWidth / 2;
          const bottomLeft = centerX - bottomWidth / 2;
          const bottomRight = centerX + bottomWidth / 2;
          const bottomY = y + VERTICAL_STAGE_HEIGHT;

          const d = `M ${String(topLeft)} ${String(y)} L ${String(topRight)} ${String(y)} L ${String(bottomRight)} ${String(bottomY)} L ${String(bottomLeft)} ${String(bottomY)} Z`;

          const labelY = y + VERTICAL_STAGE_HEIGHT / 2 - 6;
          const valueY = y + VERTICAL_STAGE_HEIGHT / 2 + 12;

          return (
            <g key={i}>
              <path d={d} fill={STAGE_FILL_HUE} fillOpacity={fillOpacity} />
              <text
                x={centerX}
                y={labelY}
                textAnchor="middle"
                fontSize="14"
                fontWeight={600}
                fill="var(--glyph-text, #1a2035)"
                style={{ paintOrder: 'stroke' }}
              >
                {stage.label}
              </text>
              <text
                x={centerX}
                y={valueY}
                textAnchor="middle"
                fontSize="13"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fill="var(--glyph-text, #1a2035)"
              >
                {formatValue(stage.value)}
                {unit ? ` ${unit}` : ''}
              </text>
            </g>
          );
        })}

        {showConversion &&
          stages.slice(1).map((stage, idx) => {
            const i = idx + 1;
            const prev = stages[i - 1];
            if (prev === undefined) return null;
            const pct = prev.value === 0 ? 0 : (stage.value / prev.value) * 100;
            const drop = prev.value - stage.value;
            const annotationX = VERTICAL_WIDTH - VERTICAL_ANNOTATION_COL + 8;
            // Vertical center of the gap between stage i-1 and stage i
            const gapCenterY = i * (VERTICAL_STAGE_HEIGHT + VERTICAL_GAP) - VERTICAL_GAP / 2;
            return (
              <g key={`conv-${String(i)}`} aria-hidden="true">
                <text
                  x={annotationX}
                  y={gapCenterY - 2}
                  fontSize="12"
                  fill="var(--glyph-text-muted, #6b7a94)"
                  dominantBaseline="middle"
                >
                  {formatConversion(pct)}
                </text>
                <text
                  x={annotationX}
                  y={gapCenterY + 14}
                  fontSize="11"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fill="var(--glyph-color-error, #dc2626)"
                  dominantBaseline="middle"
                >
                  {drop > 0 ? `\u2212${formatValue(drop)}` : '\u00B10'}
                </text>
              </g>
            );
          })}
      </svg>

      {stages.map((stage, i) => {
        const prev = i === 0 ? null : (stages[i - 1] ?? null);
        return (
          <li
            key={i}
            aria-label={stageAriaLabel(stage, i, prev, unit)}
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
            }}
          >
            {stage.description ? (
              <span
                style={{
                  color: 'var(--glyph-text-muted, #6b7a94)',
                  fontSize: '0.85em',
                }}
              >
                {stage.description}
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

// ─── Horizontal orientation ────────────────────────────────────

function HorizontalFunnel({
  stages,
  maxValue,
  showConversion,
  unit,
}: OrientationProps): ReactElement {
  // Vertical layout (top → bottom):
  //   1. HORIZONTAL_TOP_PADDING        — outer padding
  //   2. HORIZONTAL_ANNOTATION_ROW     — conv % + drop count between stages
  //   3. trapezoid area                — stages, vertically centered on midline
  //   4. HORIZONTAL_LABEL_ROW          — stage name + value below each trapezoid
  //   5. HORIZONTAL_BOTTOM_PADDING     — outer padding
  // Trapezoids taper symmetrically from BOTH top and bottom around `centerY`
  // so a smaller stage shrinks toward the midline rather than hanging from
  // the top edge.
  const trapezoidAreaHeight =
    HORIZONTAL_HEIGHT -
    HORIZONTAL_TOP_PADDING -
    HORIZONTAL_ANNOTATION_ROW -
    HORIZONTAL_LABEL_ROW -
    HORIZONTAL_BOTTOM_PADDING;
  const trapezoidAreaTop = HORIZONTAL_TOP_PADDING + HORIZONTAL_ANNOTATION_ROW;
  const centerY = trapezoidAreaTop + trapezoidAreaHeight / 2;
  const labelBaselineY = trapezoidAreaTop + trapezoidAreaHeight + 18;
  const valueBaselineY = labelBaselineY + 16;
  const annotationPctY = HORIZONTAL_TOP_PADDING + 12;
  const annotationDropY = HORIZONTAL_TOP_PADDING + 28;
  const totalWidth =
    stages.length * HORIZONTAL_STAGE_WIDTH + Math.max(0, stages.length - 1) * HORIZONTAL_GAP;

  const heightForValue = (v: number): number =>
    maxValue === 0 ? 0 : trapezoidAreaHeight * (v / maxValue);

  return (
    <ol
      role="list"
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      <svg
        width="100%"
        viewBox={`0 0 ${String(totalWidth)} ${String(HORIZONTAL_HEIGHT)}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={{ display: 'block', maxWidth: '100%', overflow: 'visible' }}
      >
        {stages.map((stage, i) => {
          const prev = i === 0 ? stage : (stages[i - 1] ?? stage);
          const leftHeight = heightForValue(prev.value);
          const rightHeight = heightForValue(stage.value);
          const x = i * (HORIZONTAL_STAGE_WIDTH + HORIZONTAL_GAP);
          const fillOpacity = stageOpacity(i);

          // Symmetric vertical taper around centerY: smaller stages shrink
          // from BOTH top and bottom toward the midline.
          const leftTop = centerY - leftHeight / 2;
          const leftBottom = centerY + leftHeight / 2;
          const rightTop = centerY - rightHeight / 2;
          const rightBottom = centerY + rightHeight / 2;
          const rightX = x + HORIZONTAL_STAGE_WIDTH;

          const d = `M ${String(x)} ${String(leftTop)} L ${String(rightX)} ${String(rightTop)} L ${String(rightX)} ${String(rightBottom)} L ${String(x)} ${String(leftBottom)} Z`;

          const labelX = x + HORIZONTAL_STAGE_WIDTH / 2;

          return (
            <g key={i}>
              <path d={d} fill={STAGE_FILL_HUE} fillOpacity={fillOpacity} />
              <text
                x={labelX}
                y={labelBaselineY}
                textAnchor="middle"
                fontSize="13"
                fontWeight={600}
                fill="var(--glyph-text, #1a2035)"
              >
                {stage.label}
              </text>
              <text
                x={labelX}
                y={valueBaselineY}
                textAnchor="middle"
                fontSize="12"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fill="var(--glyph-text, #1a2035)"
              >
                {formatValue(stage.value)}
                {unit ? ` ${unit}` : ''}
              </text>
            </g>
          );
        })}

        {showConversion &&
          stages.slice(1).map((stage, idx) => {
            const i = idx + 1;
            const prev = stages[i - 1];
            if (prev === undefined) return null;
            const pct = prev.value === 0 ? 0 : (stage.value / prev.value) * 100;
            const drop = prev.value - stage.value;
            const gapCenterX = i * (HORIZONTAL_STAGE_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP / 2;
            return (
              <g key={`conv-${String(i)}`} aria-hidden="true">
                <text
                  x={gapCenterX}
                  y={annotationPctY}
                  textAnchor="middle"
                  fontSize="12"
                  fill="var(--glyph-text-muted, #6b7a94)"
                >
                  {formatConversion(pct)}
                </text>
                <text
                  x={gapCenterX}
                  y={annotationDropY}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fill="var(--glyph-color-error, #dc2626)"
                >
                  {drop > 0 ? `\u2212${formatValue(drop)}` : '\u00B10'}
                </text>
              </g>
            );
          })}
      </svg>

      {stages.map((stage, i) => {
        const prev = i === 0 ? null : (stages[i - 1] ?? null);
        return (
          <li
            key={i}
            aria-label={stageAriaLabel(stage, i, prev, unit)}
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
            }}
          >
            {stage.description ? (
              <span
                style={{
                  color: 'var(--glyph-text-muted, #6b7a94)',
                  fontSize: '0.85em',
                }}
              >
                {stage.description}
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
