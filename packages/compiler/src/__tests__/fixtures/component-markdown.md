---
title: Component Markdown Test
---

# Markdown in Components

Test inline markdown formatting in component text fields.

## Callout with Markdown

```ui:callout
type: info
content: "This is **bold** and *italic* with a [link](https://example.com) and `code`"
```

## Card with Markdown

```ui:card
cards:
  - title: First Card
    subtitle: "A **bold** subtitle"
    body: "Body with *italic* text and [links](https://example.com)"
```

## Accordion with Markdown

```ui:accordion
sections:
  - title: Section 1
    content: "Content with **bold** and *italic* formatting"
  - title: Section 2
    content: "More content with `inline code` and [links](https://example.com)"
```

## Steps with Markdown

```ui:steps
steps:
  - title: Step 1
    content: "First step with **bold** text"
  - title: Step 2
    content: "Second step with *italic* and `code`"
```

## Timeline with Markdown

```ui:timeline
events:
  - date: "2024-01-01"
    title: "Event with **bold** title"
    description: "Description with *italic* and [link](https://example.com)"
  - date: "2024-01-02"
    title: "Another event"
    description: "More **formatted** text"
```

## Quiz with Markdown

```ui:quiz
questions:
  - type: multiple-choice
    question: "What is **bold** formatting?"
    options:
      - "Option with *italic*"
      - "Option with `code`"
      - "Plain option"
    answer: 0
    explanation: "Explanation with **bold** and *italic*"
```

## Poll with Markdown

```ui:poll
question: "Which **feature** do you prefer?"
options:
  - "*Feature* A"
  - "Feature `B`"
  - "[Feature C](https://example.com)"
```

## Always-On (No Flag Required)

Plain callout with bold text and no flag — markdown is always parsed now:

```ui:callout
type: tip
content: "Always works: **bold** and *italic* without any flag"
```

## Multiple Formatting Types

```ui:callout
type: info
content: "Combined: **bold**, *italic*, `code`, ~~strikethrough~~, and [link](https://example.com)"
```

## Nested Formatting

```ui:callout
type: tip
content: "Nested: **bold with *italic inside* text** and more"
```
