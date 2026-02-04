import { quizSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Quiz } from './Quiz.js';
import type { QuizData } from './Quiz.js';

export const quizDefinition: GlyphComponentDefinition<QuizData> = {
  type: 'ui:quiz',
  schema: quizSchema,
  render: Quiz,
};

export { Quiz };
export type {
  QuizData,
  QuizQuestion,
  QuizMultipleChoice,
  QuizTrueFalse,
  QuizMultiSelect,
} from './Quiz.js';
