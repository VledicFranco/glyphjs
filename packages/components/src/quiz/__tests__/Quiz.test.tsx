import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Quiz } from '../Quiz.js';
import type { QuizData } from '../Quiz.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Quiz', () => {
  it('renders question text', () => {
    const props = createMockProps<QuizData>(
      {
        questions: [
          {
            type: 'multiple-choice',
            question: 'What is 2 + 2?',
            options: ['3', '4', '5'],
            answer: 1,
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
  });

  it('renders options as radio buttons for multiple-choice', () => {
    const props = createMockProps<QuizData>(
      {
        questions: [
          {
            type: 'multiple-choice',
            question: 'Pick one',
            options: ['Alpha', 'Beta', 'Gamma'],
            answer: 0,
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('renders True/False options for true-false type', () => {
    const props = createMockProps<QuizData>(
      {
        questions: [
          {
            type: 'true-false',
            question: 'The sky is blue',
            answer: true,
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(screen.getAllByText('True')).toHaveLength(1);
    expect(screen.getAllByText('False')).toHaveLength(1);
  });

  it('renders checkboxes for multi-select type', () => {
    const props = createMockProps<QuizData>(
      {
        questions: [
          {
            type: 'multi-select',
            question: 'Select all that apply',
            options: ['A', 'B', 'C', 'D'],
            answer: [0, 2],
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
  });

  it('selecting option updates visual state', () => {
    const props = createMockProps<QuizData>(
      {
        questions: [
          {
            type: 'multiple-choice',
            question: 'Choose one',
            options: ['Option A', 'Option B'],
            answer: 0,
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[1]);
    expect(radios[1]).toBeChecked();
    expect(radios[0]).not.toBeChecked();
  });

  it('submitting shows correct feedback (green)', () => {
    const props = createMockProps<QuizData>(
      {
        questions: [
          {
            type: 'multiple-choice',
            question: 'What is 1 + 1?',
            options: ['1', '2', '3'],
            answer: 1,
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[1]);
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Correct!')).toBeInTheDocument();
  });

  it('submitting shows incorrect feedback (red)', () => {
    const props = createMockProps<QuizData>(
      {
        questions: [
          {
            type: 'multiple-choice',
            question: 'What is 1 + 1?',
            options: ['1', '2', '3'],
            answer: 1,
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]);
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
  });

  it('explanation revealed after submit', () => {
    const props = createMockProps<QuizData>(
      {
        questions: [
          {
            type: 'multiple-choice',
            question: 'What is 5 * 5?',
            options: ['20', '25', '30'],
            answer: 1,
            explanation: 'Five times five equals twenty-five.',
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);
    expect(screen.queryByText('Five times five equals twenty-five.')).not.toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[1]);
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Five times five equals twenty-five.')).toBeInTheDocument();
  });

  it('score counter updates correctly', () => {
    const props = createMockProps<QuizData>(
      {
        questions: [
          {
            type: 'multiple-choice',
            question: 'Q1',
            options: ['A', 'B'],
            answer: 0,
          },
          {
            type: 'multiple-choice',
            question: 'Q2',
            options: ['C', 'D'],
            answer: 1,
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);

    // Answer Q1 correctly
    const radioGroups = screen.getAllByRole('radiogroup');
    const q1Radios = radioGroups[0].querySelectorAll('input[type="radio"]');
    fireEvent.click(q1Radios[0]);
    const submitButtons = screen.getAllByText('Submit');
    fireEvent.click(submitButtons[0]);

    expect(screen.getByText('Score: 1 / 2')).toBeInTheDocument();

    // Answer Q2 incorrectly
    const q2Radios = radioGroups[1].querySelectorAll('input[type="radio"]');
    fireEvent.click(q2Radios[0]);
    const remainingSubmit = screen.getByText('Submit');
    fireEvent.click(remainingSubmit);

    expect(screen.getByText('Score: 1 / 2')).toBeInTheDocument();
  });

  it('ARIA roles present (role="group", aria-live="polite")', () => {
    const props = createMockProps<QuizData>(
      {
        questions: [
          {
            type: 'multiple-choice',
            question: 'ARIA test',
            options: ['X', 'Y'],
            answer: 0,
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);

    const groups = screen.getAllByRole('group');
    expect(groups.length).toBeGreaterThanOrEqual(1);

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Quiz');

    const liveRegions = document.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBeGreaterThanOrEqual(1);
  });

  it('renders title when provided', () => {
    const props = createMockProps<QuizData>(
      {
        title: 'JavaScript Fundamentals',
        questions: [
          {
            type: 'true-false',
            question: 'JS is typed',
            answer: false,
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'JavaScript Fundamentals');
  });

  it('hides score when showScore is false', () => {
    const props = createMockProps<QuizData>(
      {
        showScore: false,
        questions: [
          {
            type: 'multiple-choice',
            question: 'No score',
            options: ['A', 'B'],
            answer: 0,
          },
        ],
      },
      'ui:quiz',
    );
    render(<Quiz {...props} />);
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]);
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
  });
});
