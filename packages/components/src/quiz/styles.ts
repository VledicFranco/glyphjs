import type { CSSProperties } from 'react';

export const containerStyle: CSSProperties = {
  fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
  color: 'var(--glyph-text, #1a2035)',
  border: '1px solid var(--glyph-border, #d0d8e4)',
  borderRadius: 'var(--glyph-radius-md, 0.5rem)',
  overflow: 'hidden',
};

export const headerStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: '1.125rem',
  padding: 'var(--glyph-spacing-md, 1rem)',
  borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
  color: 'var(--glyph-heading, #0a0e1a)',
};

export function questionGroupStyle(isLast: boolean): CSSProperties {
  return {
    padding: 'var(--glyph-spacing-md, 1rem)',
    borderBottom: isLast ? 'none' : '1px solid var(--glyph-border, #d0d8e4)',
  };
}

export const questionTextStyle: CSSProperties = {
  fontWeight: 600,
  fontSize: '0.9375rem',
  marginBottom: '0.75rem',
};

export function optionLabelStyle(
  isSelected: boolean,
  submitted: boolean,
  isCorrectOption: boolean,
  isIncorrectSelection: boolean,
): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.375rem',
    borderRadius: 'var(--glyph-radius-md, 0.5rem)',
    cursor: submitted ? 'default' : 'pointer',
    background: submitted
      ? isCorrectOption
        ? 'var(--glyph-quiz-correct-bg, #dcfce7)'
        : isIncorrectSelection
          ? 'var(--glyph-quiz-incorrect-bg, #fee2e2)'
          : 'transparent'
      : isSelected
        ? 'var(--glyph-surface, #e8ecf3)'
        : 'transparent',
    border: '1px solid',
    borderColor: submitted
      ? isCorrectOption
        ? 'var(--glyph-quiz-correct, #16a34a)'
        : isIncorrectSelection
          ? 'var(--glyph-quiz-incorrect, #dc2626)'
          : 'var(--glyph-border, #d0d8e4)'
      : isSelected
        ? 'var(--glyph-border, #d0d8e4)'
        : 'transparent',
    fontSize: '0.875rem',
    lineHeight: 1.6,
  };
}

export function buttonStyle(disabled: boolean): CSSProperties {
  return {
    marginTop: '0.75rem',
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--glyph-radius-md, 0.5rem)',
    border: '1px solid var(--glyph-border, #d0d8e4)',
    background: disabled ? 'var(--glyph-surface, #e8ecf3)' : 'var(--glyph-surface, #e8ecf3)',
    color: disabled ? 'var(--glyph-border, #d0d8e4)' : 'var(--glyph-text, #1a2035)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
  };
}

export function feedbackStyle(correct: boolean): CSSProperties {
  return {
    marginTop: '0.75rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--glyph-radius-md, 0.5rem)',
    background: correct
      ? 'var(--glyph-quiz-correct-bg, #dcfce7)'
      : 'var(--glyph-quiz-incorrect-bg, #fee2e2)',
    color: correct ? 'var(--glyph-quiz-correct, #16a34a)' : 'var(--glyph-quiz-incorrect, #dc2626)',
    fontWeight: 600,
    fontSize: '0.875rem',
  };
}

export const explanationStyle: CSSProperties = {
  marginTop: '0.5rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  lineHeight: 1.6,
  color: 'var(--glyph-text, #1a2035)',
  background: 'var(--glyph-surface, #e8ecf3)',
  borderRadius: 'var(--glyph-radius-md, 0.5rem)',
};

export const scoreStyle: CSSProperties = {
  padding: 'var(--glyph-spacing-md, 1rem)',
  borderTop: '1px solid var(--glyph-border, #d0d8e4)',
  fontWeight: 700,
  fontSize: '1rem',
  color: 'var(--glyph-heading, #0a0e1a)',
};
