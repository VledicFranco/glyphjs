import { useState, type ReactElement } from 'react';
import type { GlyphComponentProps, InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';
import {
  containerStyle,
  headerStyle,
  parameterStyle,
  parameterHeaderStyle,
  parameterLabelStyle,
  parameterValueStyle,
  rangeInputStyle,
  rangeLabelsStyle,
} from './styles.js';

// ─── Types ─────────────────────────────────────────────────────

export interface SliderParameter {
  id: string;
  label: string | InlineNode[];
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  unit?: string;
}

export interface SliderData {
  title?: string;
  layout?: 'vertical' | 'horizontal';
  parameters: SliderParameter[];
  markdown?: boolean;
}

// ─── Component ─────────────────────────────────────────────────

export function Slider({
  data,
  block,
  onInteraction,
}: GlyphComponentProps<SliderData>): ReactElement {
  const { title, parameters } = data;
  const baseId = `glyph-slider-${block.id}`;

  const [values, setValues] = useState<number[]>(() =>
    parameters.map((p) => p.value ?? p.min ?? 0),
  );

  const handleChange = (paramIndex: number, newValue: number): void => {
    const newValues = [...values];
    newValues[paramIndex] = newValue;
    setValues(newValues);

    const param = parameters[paramIndex];
    if (!param) return;

    if (onInteraction) {
      onInteraction({
        kind: 'slider-change',
        timestamp: new Date().toISOString(),
        blockId: block.id,
        blockType: block.type,
        payload: {
          parameterId: param.id,
          parameterLabel: typeof param.label === 'string' ? param.label : 'Parameter',
          value: newValue,
          allValues: parameters.map((p, i) => ({
            id: p.id,
            label: typeof p.label === 'string' ? p.label : 'Parameter',
            value: i === paramIndex ? newValue : (newValues[i] ?? 0),
          })),
        },
      });
    }
  };

  const formatValue = (value: number, unit?: string): string => {
    return unit ? `${String(value)}${unit}` : String(value);
  };

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Slider'} style={containerStyle}>
      {title && <div style={headerStyle}>{title}</div>}

      {parameters.map((param, index) => {
        const min = param.min ?? 0;
        const max = param.max ?? 100;
        const step = param.step ?? 1;
        const currentValue = values[index] ?? min;
        const isLast = index === parameters.length - 1;

        return (
          <div key={param.id} style={parameterStyle(isLast)}>
            <div style={parameterHeaderStyle}>
              <label htmlFor={`${baseId}-${param.id}`} style={parameterLabelStyle}>
                <RichText content={param.label} />
              </label>
              <span style={parameterValueStyle} aria-live="polite">
                {formatValue(currentValue, param.unit)}
              </span>
            </div>
            <input
              id={`${baseId}-${param.id}`}
              type="range"
              min={min}
              max={max}
              step={step}
              value={currentValue}
              onChange={(e) => handleChange(index, Number(e.target.value))}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={currentValue}
              aria-valuetext={formatValue(currentValue, param.unit)}
              style={rangeInputStyle}
            />
            <div style={rangeLabelsStyle}>
              <span>{formatValue(min, param.unit)}</span>
              <span>{formatValue(max, param.unit)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
