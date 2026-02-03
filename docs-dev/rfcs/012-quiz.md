# RFC-012: Quiz

- **Status:** Draft
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P10
- **Complexity:** M
- **Block type:** `ui:quiz`

---

## 1. Summary

An interactive quiz/assessment component supporting multiple-choice, true/false, and multi-select questions with immediate feedback. This is the first bidirectional Glyph component — the human responds, and the component reacts.

## 2. Motivation

LLMs are widely used for education and training. Today, an LLM can ask questions in text, but the human can only answer by typing a response. A Quiz component makes this interactive: the LLM presents structured questions, the human clicks answers, and gets immediate feedback with explanations. This turns passive reading into active learning.

## 3. Schema

````yaml
```ui:quiz
title: JavaScript Basics
questions:
  - question: "Which keyword declares a block-scoped variable?"
    type: multiple-choice
    options:
      - var
      - let
      - const
      - both let and const
    answer: 3
    explanation: >
      Both let and const are block-scoped. var is function-scoped.

  - question: "Array.isArray([]) returns true"
    type: true-false
    answer: true
    explanation: >
      Array.isArray() correctly identifies arrays, even across frames.

  - question: "Which are primitive types in JavaScript?"
    type: multi-select
    options:
      - string
      - array
      - number
      - object
      - boolean
    answer: [0, 2, 4]
    explanation: >
      string, number, and boolean are primitives.
      Arrays and objects are reference types.
````

````

### Zod schema

```typescript
const questionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('multiple-choice'),
    question: z.string(),
    options: z.array(z.string()).min(2).max(6),
    answer: z.number(),
    explanation: z.string().optional(),
  }),
  z.object({
    type: z.literal('true-false'),
    question: z.string(),
    answer: z.boolean(),
    explanation: z.string().optional(),
  }),
  z.object({
    type: z.literal('multi-select'),
    question: z.string(),
    options: z.array(z.string()).min(2).max(8),
    answer: z.array(z.number()),
    explanation: z.string().optional(),
  }),
]);

const quizSchema = z.object({
  title: z.string().optional(),
  questions: z.array(questionSchema).min(1),
  showScore: z.boolean().default(true),
});
````

## 4. Visual design

### Question card

- Each question rendered as a card with the question text, numbered (Q1, Q2, ...).
- Options rendered as clickable buttons/chips (multiple-choice, multi-select) or True/False toggle (true-false).
- Before answering: all options in neutral state (`--glyph-surface` background).

### After answering

- Correct selection: green background (`--glyph-callout-tip-bg`).
- Incorrect selection: red background (`--glyph-callout-error-bg`).
- The correct answer highlighted if the user got it wrong.
- Explanation text revealed below the options in a muted callout.
- Cannot change answer after submission (per-question lock).

### Score summary

- If `showScore: true`, a summary bar at the bottom shows "X / Y correct" with a fill-bar visual.
- Score updates as each question is answered.

## 5. Accessibility

- Questions use `role="group"` with `aria-label` for the question text.
- Multiple-choice/multi-select: options are `role="radio"` or `role="checkbox"` within a `role="radiogroup"` or `role="group"`.
- True/false: two radio buttons.
- After answering, `aria-live="polite"` region announces "Correct" or "Incorrect" with the explanation.
- Full keyboard navigation: Tab to options, Enter/Space to select, arrow keys within option groups.

## 6. Implementation notes

- State management: each question tracks `{ selected: number | number[] | boolean | null, submitted: boolean }`.
- The `answer` field is the index (0-based) for multiple-choice, an array of indices for multi-select, or a boolean for true-false. This keeps the schema simple and unambiguous. The renderer should validate that answer indices are within the `options` array bounds and show a schema error if not.
- Multi-select submission: needs an explicit "Check answer" button since clicking an option is a toggle, not a submission.
- The explanation should remain hidden until the user submits their answer — no peeking.
- This is the first component with meaningful user interaction state. Other components are display-only. Consider whether this pattern should emit events (stretch goal: quiz completion callback).
- Security note: answers are in the YAML source, visible in DOM. This is not for secure assessments — it's for learning and self-testing.
