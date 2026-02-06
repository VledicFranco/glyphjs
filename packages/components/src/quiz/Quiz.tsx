import { useState, type ReactElement } from 'react';
import type { GlyphComponentProps, InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';
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
  question: string | InlineNode[];
  options: (string | InlineNode[])[];
  answer: number;
  explanation?: string | InlineNode[];
}

export interface QuizTrueFalse {
  type: 'true-false';
  question: string | InlineNode[];
  answer: boolean;
  explanation?: string | InlineNode[];
}

export interface QuizMultiSelect {
  type: 'multi-select';
  question: string | InlineNode[];
  options: (string | InlineNode[])[];
  answer: number[];
  explanation?: string | InlineNode[];
}

export type QuizQuestion = QuizMultipleChoice | QuizTrueFalse | QuizMultiSelect;

export interface QuizData {
  questions: QuizQuestion[];
  showScore?: boolean;
  title?: string;
  markdown?: boolean;
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

// ─── Render helpers ──────────────────────────────────────────

type StateUpdater = (index: number, patch: Partial<QuestionState>) => void;

function renderMultipleChoice(
  question: QuizMultipleChoice,
  qIndex: number,
  state: QuestionState,
  updateState: StateUpdater,
  baseId: string,
): ReactElement {
  const selected = typeof state.selected === 'number' ? state.selected : null;
  const ariaLabel = typeof question.question === 'string' ? question.question : 'Question';

  return (
    <div role="radiogroup" aria-label={ariaLabel}>
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
            <RichText content={option} />
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
  updateState: StateUpdater,
  baseId: string,
): ReactElement {
  const selected = typeof state.selected === 'boolean' ? state.selected : null;
  const ariaLabel = typeof question.question === 'string' ? question.question : 'Question';

  return (
    <div role="radiogroup" aria-label={ariaLabel}>
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
  updateState: StateUpdater,
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
            <RichText content={option} />
          </label>
        );
      })}
    </div>
  );
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

  const updateState: StateUpdater = (index, patch) => {
    setStates((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const score = states.reduce((acc, s, i) => {
    const q = questions[i];
    if (!q || !s.submitted) return acc;
    return acc + (isCorrect(q, s.selected) ? 1 : 0);
  }, 0);
  const submittedCount = states.filter((s) => s.submitted).length;

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
          <RichText content={question.question} />
        </div>

        {question.type === 'multiple-choice' &&
          renderMultipleChoice(question, qIndex, state, updateState, baseId)}
        {question.type === 'true-false' &&
          renderTrueFalse(question, qIndex, state, updateState, baseId)}
        {question.type === 'multi-select' &&
          renderMultiSelect(question, qIndex, state, updateState)}

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
                    if (typeof state.selected === 'number') {
                      const opt = question.options[state.selected];
                      selected = [typeof opt === 'string' ? opt : String(state.selected)];
                    } else {
                      selected = [];
                    }
                    break;
                  case 'true-false':
                    selected =
                      typeof state.selected === 'boolean'
                        ? [state.selected ? 'True' : 'False']
                        : [];
                    break;
                  case 'multi-select':
                    selected = Array.isArray(state.selected)
                      ? state.selected.map((idx) => {
                          const opt = question.options[idx];
                          return typeof opt === 'string' ? opt : String(idx);
                        })
                      : [];
                    break;
                }

                const questionText =
                  typeof question.question === 'string' ? question.question : 'Question';

                onInteraction({
                  kind: 'quiz-submit',
                  timestamp: new Date().toISOString(),
                  blockId: block.id,
                  blockType: block.type,
                  payload: {
                    questionIndex: qIndex,
                    question: questionText,
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
            <div style={explanationStyle}>
              <RichText content={question.explanation} />
            </div>
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
