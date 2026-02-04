import type { Meta, StoryObj } from '@storybook/react';
import { Quiz } from './Quiz.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { QuizData } from './Quiz.js';

const meta: Meta<typeof Quiz> = {
  component: Quiz,
  title: 'Components/Quiz',
};

export default meta;
type Story = StoryObj<typeof Quiz>;

// ─── Default ──────────────────────────────────────────────────

export const Default: Story = {
  args: mockProps<QuizData>(
    {
      title: 'JavaScript Fundamentals',
      questions: [
        {
          type: 'multiple-choice',
          question: 'Which keyword declares a block-scoped variable?',
          options: ['var', 'let', 'function', 'declare'],
          answer: 1,
          explanation: 'The "let" keyword declares a block-scoped local variable.',
        },
        {
          type: 'true-false',
          question: 'JavaScript is a statically typed language.',
          answer: false,
          explanation: 'JavaScript is dynamically typed. TypeScript adds static types.',
        },
        {
          type: 'multi-select',
          question: 'Which of these are primitive types in JavaScript?',
          options: ['string', 'object', 'number', 'array', 'boolean'],
          answer: [0, 2, 4],
          explanation:
            'string, number, and boolean are primitives. object and array are reference types.',
        },
      ],
    },
    { block: mockBlock({ id: 'quiz-default', type: 'ui:quiz' }) },
  ),
};

// ─── SingleQuestion ──────────────────────────────────────────

export const SingleQuestion: Story = {
  args: mockProps<QuizData>(
    {
      questions: [
        {
          type: 'multiple-choice',
          question: 'What does HTML stand for?',
          options: [
            'Hyper Text Markup Language',
            'High Tech Modern Language',
            'Hyper Transfer Markup Language',
          ],
          answer: 0,
        },
      ],
    },
    { block: mockBlock({ id: 'quiz-single', type: 'ui:quiz' }) },
  ),
};

// ─── TrueFalse ───────────────────────────────────────────────

export const TrueFalse: Story = {
  args: mockProps<QuizData>(
    {
      title: 'True or False',
      questions: [
        {
          type: 'true-false',
          question: 'CSS stands for Cascading Style Sheets.',
          answer: true,
        },
        {
          type: 'true-false',
          question: 'HTTP is a stateful protocol.',
          answer: false,
          explanation: 'HTTP is stateless. State is managed through cookies and sessions.',
        },
      ],
    },
    { block: mockBlock({ id: 'quiz-truefalse', type: 'ui:quiz' }) },
  ),
};

// ─── MultiSelect ─────────────────────────────────────────────

export const MultiSelect: Story = {
  args: mockProps<QuizData>(
    {
      title: 'Select All That Apply',
      questions: [
        {
          type: 'multi-select',
          question: 'Which of these are JavaScript frameworks or libraries?',
          options: ['React', 'Django', 'Vue', 'Rails', 'Angular', 'Flask'],
          answer: [0, 2, 4],
          explanation:
            'React, Vue, and Angular are JavaScript frameworks/libraries. Django, Rails, and Flask are backend frameworks.',
        },
      ],
    },
    { block: mockBlock({ id: 'quiz-multiselect', type: 'ui:quiz' }) },
  ),
};

// ─── NoScore ─────────────────────────────────────────────────

export const NoScore: Story = {
  args: mockProps<QuizData>(
    {
      title: 'Practice Quiz (No Score)',
      showScore: false,
      questions: [
        {
          type: 'multiple-choice',
          question: 'Which planet is closest to the sun?',
          options: ['Venus', 'Mercury', 'Mars', 'Earth'],
          answer: 1,
        },
        {
          type: 'true-false',
          question: 'Water boils at 100 degrees Celsius at sea level.',
          answer: true,
        },
      ],
    },
    { block: mockBlock({ id: 'quiz-noscore', type: 'ui:quiz' }) },
  ),
};

// ─── WithExplanations ────────────────────────────────────────

export const WithExplanations: Story = {
  args: mockProps<QuizData>(
    {
      title: 'Quiz with Explanations',
      questions: [
        {
          type: 'multiple-choice',
          question: 'What is the time complexity of binary search?',
          options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
          answer: 1,
          explanation:
            'Binary search halves the search space each iteration, giving O(log n) time complexity.',
        },
        {
          type: 'true-false',
          question: 'A stack uses FIFO (First In, First Out) ordering.',
          answer: false,
          explanation: 'A stack uses LIFO (Last In, First Out). A queue uses FIFO.',
        },
        {
          type: 'multi-select',
          question: 'Which data structures support O(1) average-case lookup?',
          options: ['Hash Table', 'Linked List', 'Array (by index)', 'Binary Search Tree'],
          answer: [0, 2],
          explanation:
            'Hash tables and arrays (by index) provide O(1) average-case lookup. Linked lists are O(n) and BSTs are O(log n).',
        },
      ],
    },
    { block: mockBlock({ id: 'quiz-explanations', type: 'ui:quiz' }) },
  ),
};
