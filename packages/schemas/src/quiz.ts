import { z } from 'zod';
import { inlineContentSchema } from './inline-content.js';

const multipleChoiceQuestion = z.object({
  type: z.literal('multiple-choice'),
  question: inlineContentSchema,
  options: z.array(inlineContentSchema).min(2).max(6),
  answer: z.number(),
  explanation: inlineContentSchema.optional(),
});

const trueFalseQuestion = z.object({
  type: z.literal('true-false'),
  question: inlineContentSchema,
  answer: z.boolean(),
  explanation: inlineContentSchema.optional(),
});

const multiSelectQuestion = z.object({
  type: z.literal('multi-select'),
  question: inlineContentSchema,
  options: z.array(inlineContentSchema).min(2).max(8),
  answer: z.array(z.number()),
  explanation: inlineContentSchema.optional(),
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
});
