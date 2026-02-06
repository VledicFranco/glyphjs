import { z } from 'zod';

const multipleChoiceQuestion = z.object({
  type: z.literal('multiple-choice'),
  question: z.string(),
  options: z.array(z.string()).min(2).max(6),
  answer: z.number(),
  explanation: z.string().optional(),
});

const trueFalseQuestion = z.object({
  type: z.literal('true-false'),
  question: z.string(),
  answer: z.boolean(),
  explanation: z.string().optional(),
});

const multiSelectQuestion = z.object({
  type: z.literal('multi-select'),
  question: z.string(),
  options: z.array(z.string()).min(2).max(8),
  answer: z.array(z.number()),
  explanation: z.string().optional(),
});

const quizQuestion = z.discriminatedUnion('type', [
  multipleChoiceQuestion,
  trueFalseQuestion,
  multiSelectQuestion,
]);

export const quizSchema = z.object({
  questions: z.array(quizQuestion).min(1),
  showScore: z.boolean().default(true),
  title: z.string().optional(),
  markdown: z.boolean().default(false),
});
