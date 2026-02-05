import { useState, type ReactElement, type FormEvent } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import {
  containerStyle,
  headerStyle,
  descriptionStyle,
  formStyle,
  fieldStyle,
  labelStyle,
  requiredStyle,
  textInputStyle,
  selectInputStyle,
  checkboxLabelStyle,
  rangeValueStyle,
  submitButtonStyle,
  invalidStyle,
} from './styles.js';

// ─── Types ─────────────────────────────────────────────────────

interface TextField {
  type: 'text';
  id: string;
  label: string;
  required?: boolean;
  default?: string;
  placeholder?: string;
}

interface TextareaField {
  type: 'textarea';
  id: string;
  label: string;
  required?: boolean;
  default?: string;
  placeholder?: string;
  rows?: number;
}

interface SelectField {
  type: 'select';
  id: string;
  label: string;
  required?: boolean;
  options: string[];
  default?: string;
}

interface CheckboxField {
  type: 'checkbox';
  id: string;
  label: string;
  default?: boolean;
}

interface RangeField {
  type: 'range';
  id: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  default?: number;
  unit?: string;
}

export type FormField = TextField | TextareaField | SelectField | CheckboxField | RangeField;

export interface FormData {
  title?: string;
  description?: string;
  submitLabel?: string;
  fields: FormField[];
}

// ─── Field Renderer ───────────────────────────────────────────

interface FieldRendererProps {
  field: FormField;
  baseId: string;
  values: Record<string, string | number | boolean>;
  validation: Record<string, boolean>;
  submitted: boolean;
  updateValue: (fieldId: string, value: string | number | boolean) => void;
}

function renderField({
  field,
  baseId,
  values,
  validation,
  submitted,
  updateValue,
}: FieldRendererProps): ReactElement {
  const isInvalid = validation[field.id] === true;
  const fieldId = `${baseId}-${field.id}`;

  switch (field.type) {
    case 'text':
      return (
        <div key={field.id} style={fieldStyle}>
          <label htmlFor={fieldId} style={labelStyle}>
            {field.label}
            {field.required && (
              <span style={requiredStyle} aria-hidden="true">
                *
              </span>
            )}
          </label>
          <input
            id={fieldId}
            type="text"
            value={(values[field.id] as string) ?? ''}
            onChange={(e) => updateValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={submitted}
            aria-required={field.required}
            aria-invalid={isInvalid}
            style={{ ...textInputStyle, ...invalidStyle(isInvalid) }}
          />
        </div>
      );

    case 'textarea':
      return (
        <div key={field.id} style={fieldStyle}>
          <label htmlFor={fieldId} style={labelStyle}>
            {field.label}
            {field.required && (
              <span style={requiredStyle} aria-hidden="true">
                *
              </span>
            )}
          </label>
          <textarea
            id={fieldId}
            value={(values[field.id] as string) ?? ''}
            onChange={(e) => updateValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows ?? 4}
            disabled={submitted}
            aria-required={field.required}
            aria-invalid={isInvalid}
            style={{
              ...textInputStyle,
              ...invalidStyle(isInvalid),
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>
      );

    case 'select':
      return (
        <div key={field.id} style={fieldStyle}>
          <label htmlFor={fieldId} style={labelStyle}>
            {field.label}
            {field.required && (
              <span style={requiredStyle} aria-hidden="true">
                *
              </span>
            )}
          </label>
          <select
            id={fieldId}
            value={(values[field.id] as string) ?? ''}
            onChange={(e) => updateValue(field.id, e.target.value)}
            disabled={submitted}
            aria-required={field.required}
            style={selectInputStyle}
          >
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case 'checkbox':
      return (
        <div key={field.id} style={fieldStyle}>
          <label style={checkboxLabelStyle}>
            <input
              id={fieldId}
              type="checkbox"
              checked={(values[field.id] as boolean) ?? false}
              onChange={(e) => updateValue(field.id, e.target.checked)}
              disabled={submitted}
            />
            {field.label}
          </label>
        </div>
      );

    case 'range': {
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      const step = field.step ?? 1;
      const currentValue = (values[field.id] as number) ?? min;
      const displayValue = field.unit
        ? `${String(currentValue)}${field.unit}`
        : String(currentValue);

      return (
        <div key={field.id} style={fieldStyle}>
          <label htmlFor={fieldId} style={labelStyle}>
            {field.label}
            <span style={rangeValueStyle}>{displayValue}</span>
          </label>
          <input
            id={fieldId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={(e) => updateValue(field.id, Number(e.target.value))}
            disabled={submitted}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue}
            aria-valuetext={displayValue}
            style={{ width: '100%', accentColor: 'var(--glyph-accent, #0a9d7c)' }}
          />
        </div>
      );
    }
  }
}

// ─── Component ─────────────────────────────────────────────────

export function Form({ data, block, onInteraction }: GlyphComponentProps<FormData>): ReactElement {
  const { title, description, submitLabel = 'Submit', fields } = data;
  const baseId = `glyph-form-${block.id}`;

  const [values, setValues] = useState<Record<string, string | number | boolean>>(() => {
    const init: Record<string, string | number | boolean> = {};
    for (const field of fields) {
      switch (field.type) {
        case 'text':
        case 'textarea':
          init[field.id] = field.default ?? '';
          break;
        case 'select':
          init[field.id] = field.default ?? field.options[0] ?? '';
          break;
        case 'checkbox':
          init[field.id] = field.default ?? false;
          break;
        case 'range':
          init[field.id] = field.default ?? field.min ?? 0;
          break;
      }
    }
    return init;
  });

  const [submitted, setSubmitted] = useState(false);
  const [validation, setValidation] = useState<Record<string, boolean>>({});

  const updateValue = (fieldId: string, value: string | number | boolean): void => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    if (validation[fieldId]) {
      setValidation((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();

    // Validate required fields
    const errors: Record<string, boolean> = {};
    for (const field of fields) {
      if ('required' in field && field.required) {
        const val = values[field.id];
        if (val === '' || val === undefined) {
          errors[field.id] = true;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidation(errors);
      return;
    }

    setSubmitted(true);

    if (onInteraction) {
      onInteraction({
        kind: 'form-submit',
        timestamp: new Date().toISOString(),
        blockId: block.id,
        blockType: block.type,
        payload: {
          values: { ...values },
          fields: fields.map((f) => ({
            id: f.id,
            label: f.label,
            type: f.type,
            value: values[f.id] !== undefined ? values[f.id] : '',
          })),
        },
      });
    }
  };

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Form'} style={containerStyle}>
      {title && <div style={headerStyle}>{title}</div>}
      {description && <div style={descriptionStyle}>{description}</div>}

      <form onSubmit={handleSubmit} style={formStyle} noValidate>
        {fields.map((field) =>
          renderField({ field, baseId, values, validation, submitted, updateValue }),
        )}

        <button
          type="submit"
          disabled={submitted}
          style={{
            ...submitButtonStyle,
            opacity: submitted ? 0.5 : 1,
            cursor: submitted ? 'default' : 'pointer',
          }}
        >
          {submitted ? 'Submitted' : submitLabel}
        </button>
      </form>
    </div>
  );
}
