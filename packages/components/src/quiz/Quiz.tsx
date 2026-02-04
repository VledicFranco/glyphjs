import { useState, type ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import {
  containerStyle,
  headerStyle,
  questionGroupStyle,
  questionTextStyle,
  optionLabelStyle,
  buttonStyle,
  feedbackStyle,
  explanationStyle,
  scoreStyle,
} from './styles.js';

// ─── Types ─────────────────────────────────────────────────────

export interface QuizMultipleChoice {
  type: 'multiple-choice';
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface QuizTrueFalse {
  type: 'true-false';
  question: string;
  answer: boolean;
  explanation?: string;
}

export interface QuizMultiSelect {
  type: 'multi-select';
  question: string;
  options: string[];
  answer: number[];
  explanation?: string;
}

export type QuizQuestion = QuizMultipleChoice | QuizTrueFalse | QuizMultiSelect;

export interface QuizData {
  questions: QuizQuestion[];
  showScore?: boolean;
  title?: string;
}

// ─── Per-question state ────────────────────────────────────────

interface QuestionState {
  selected: number | number[] | boolean | null;
  submitted: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────

function isCorrect(question: QuizQuestion, selected: number | number[] | boolean | null): boolean {
  if (selected === null) return false;

  switch (question.type) {
    case 'multiple-choice':
      return selected === question.answer;
    case 'true-false':
      return selected === question.answer;
    case 'multi-select': {
      if (!Array.isArray(selected)) return false;
      const sorted = [...selected].sort();
      const expected = [...question.answer].sort();
      return sorted.length === expected.length && sorted.every((v, i) => v === expected[i]);
    }
  }
}

// ─── Component ─────────────────────────────────────────────────

export function Quiz({ data, block, onInteraction }: GlyphComponentProps<QuizData>): ReactElement {
  const { questions, showScore = true, title } = data;
  const baseId = `glyph-quiz-${block.id}`;

  const [states, setStates] = useState<QuestionState[]>(() =>
    questions.map((q) => ({
      selected: q.type === 'multi-select' ? [] : null,
      submitted: false,
    })),
  );

  const updateState = (index: number, patch: Partial<QuestionState>): void => {
    setStates((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const score = states.reduce((acc, s, i) => {
    const q = questions[i];
    if (!q || !s.submitted) return acc;
    return acc + (isCorrect(q, s.selected) ? 1 : 0);
  }, 0);
  const submittedCount = states.filter((s) => s.submitted).length;

  // ─── Render helpers ────────────────────────────────────────

  function renderMultipleChoice(
    question: QuizMultipleChoice,
    qIndex: number,
    state: QuestionState,
  ): ReactElement {
    const selected = typeof state.selected === 'number' ? state.selected : null;

    return (
      <div role="radiogroup" aria-label={question.question}>
        {question.options.map((option, oIndex) => {
          const isSelected = selected === oIndex;
          const isCorrectOption = state.submitted && oIndex === question.answer;
          const isIncorrectSelection = state.submitted && isSelected && oIndex !== question.answer;

          return (
            <label
              key={oIndex}
              style={optionLabelStyle(
                isSelected,
                state.submitted,
                isCorrectOption,
                isIncorrectSelection,
              )}
            >
              <input
                type="radio"
                role="radio"
                name={`${baseId}-q${String(qIndex)}`}
                checked={isSelected}
                disabled={state.submitted}
                onChange={() => updateState(qIndex, { selected: oIndex })}
                aria-checked={isSelected}
              />
              {option}
            </label>
          );
        })}
      </div>
    );
  }

  function renderTrueFalse(
    question: QuizTrueFalse,
    qIndex: number,
    state: QuestionState,
  ): ReactElement {
    const selected = typeof state.selected === 'boolean' ? state.selected : null;

    return (
      <div role="radiogroup" aria-label={question.question}>
        {[true, false].map((value) => {
          const isSelected = selected === value;
          const isCorrectOption = state.submitted && value === question.answer;
          const isIncorrectSelection = state.submitted && isSelected && value !== question.answer;

          return (
            <label
              key={String(value)}
              style={optionLabelStyle(
                isSelected,
                state.submitted,
                isCorrectOption,
                isIncorrectSelection,
              )}
            >
              <input
                type="radio"
                role="radio"
                name={`${baseId}-q${String(qIndex)}`}
                checked={isSelected}
                disabled={state.submitted}
                onChange={() => updateState(qIndex, { selected: value })}
                aria-checked={isSelected}
              />
              {value ? 'True' : 'False'}
            </label>
          );
        })}
      </div>
    );
  }

  function renderMultiSelect(
    question: QuizMultiSelect,
    qIndex: number,
    state: QuestionState,
  ): ReactElement {
    const selected = Array.isArray(state.selected) ? state.selected : [];

    const toggleOption = (oIndex: number): void => {
      const next = selected.includes(oIndex)
        ? selected.filter((v) => v !== oIndex)
        : [...selected, oIndex];
      updateState(qIndex, { selected: next });
    };

    return (
      <div>
        {question.options.map((option, oIndex) => {
          const isSelected = selected.includes(oIndex);
          const isCorrectOption = state.submitted && question.answer.includes(oIndex);
          const isIncorrectSelection =
            state.submitted && isSelected && !question.answer.includes(oIndex);

          return (
            <label
              key={oIndex}
              style={optionLabelStyle(
                isSelected,
                state.submitted,
                isCorrectOption,
                isIncorrectSelection,
              )}
            >
              <input
                type="checkbox"
                role="checkbox"
                checked={isSelected}
                disabled={state.submitted}
                onChange={() => toggleOption(oIndex)}
                aria-checked={isSelected}
              />
              {option}
            </label>
          );
        })}
      </div>
    );
  }

  function renderQuestion(question: QuizQuestion, qIndex: number): ReactElement {
    const state: QuestionState = states[qIndex] ?? { selected: null, submitted: false };
    const isLast = qIndex === questions.length - 1;

    const hasSelection =
      question.type === 'multi-select'
        ? Array.isArray(state.selected) && state.selected.length > 0
        : state.selected !== null;

    const correct = state.submitted ? isCorrect(question, state.selected) : false;

    return (
      <div
        key={qIndex}
        role="group"
        aria-label={`Question ${String(qIndex + 1)}`}
        style={questionGroupStyle(isLast && !(showScore && submittedCount > 0))}
      >
        <div style={questionTextStyle}>
          {questions.length > 1 ? `${String(qIndex + 1)}. ` : ''}
          {question.question}
        </div>

        {question.type === 'multiple-choice' && renderMultipleChoice(question, qIndex, state)}
        {question.type === 'true-false' && renderTrueFalse(question, qIndex, state)}
        {question.type === 'multi-select' && renderMultiSelect(question, qIndex, state)}

        {!state.submitted && (
          <button
            type="button"
            disabled={!hasSelection}
            style={buttonStyle(!hasSelection)}
            onClick={() => {
              updateState(qIndex, { submitted: true });

              if (onInteraction) {
                const correct = isCorrect(question, state.selected);
                // Compute cumulative score including this submission
                const newScore = states.reduce((acc, s, i) => {
                  if (i === qIndex) return acc + (correct ? 1 : 0);
                  const q = questions[i];
                  if (!q || !s.submitted) return acc;
                  return acc + (isCorrect(q, s.selected) ? 1 : 0);
                }, 0);

                // Convert selected value to human-readable strings
                let selected: string[];
                switch (question.type) {
                  case 'multiple-choice':
                    selected =
                      typeof state.selected === 'number'
                        ? [question.options[state.selected] ?? String(state.selected)]
                        : [];
                    break;
                  case 'true-false':
                    selected =
                      typeof state.selected === 'boolean'
                        ? [state.selected ? 'True' : 'False']
                        : [];
                    break;
                  case 'multi-select':
                    selected = Array.isArray(state.selected)
                      ? state.selected.map((idx) => question.options[idx] ?? String(idx))
                      : [];
                    break;
                }

                onInteraction({
                  kind: 'quiz-submit',
                  timestamp: new Date().toISOString(),
                  blockId: block.id,
                  blockType: block.type,
                  payload: {
                    questionIndex: qIndex,
                    question: question.question,
                    selected,
                    correct,
                    score: { correct: newScore, total: questions.length },
                  },
                });
              }
            }}
          >
            Submit
          </button>
        )}

        <div aria-live="polite">
          {state.submitted && (
            <div style={feedbackStyle(correct)}>{correct ? 'Correct!' : 'Incorrect'}</div>
          )}
          {state.submitted && question.explanation && (
            <div style={explanationStyle}>{question.explanation}</div>
          )}
        </div>
      </div>
    );
  }

  // ─── Main render ───────────────────────────────────────────

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Quiz'} style={containerStyle}>
      {title && <div style={headerStyle}>{title}</div>}

      {questions.map((q, i) => renderQuestion(q, i))}

      {showScore && submittedCount > 0 && (
        <div style={scoreStyle}>
          Score: {String(score)} / {String(questions.length)}
        </div>
      )}
    </div>
  );
}
