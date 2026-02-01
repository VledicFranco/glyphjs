// ─── Preset Markdown Strings ────────────────────────────────

export const simple = `\
# Hello Glyph

This is a simple document with standard Markdown elements.

## Features

- Fast compilation
- React rendering
- Theme support

> Glyph JS turns Markdown into interactive documents.

---

Here is some \`inline code\` and a [link](https://github.com).
`;

export const callout = `\
# Callout Demo

Callouts are highlighted blocks for drawing attention to important information.

\`\`\`ui:callout
type: info
title: Getting Started
content: |
  Welcome to Glyph JS! This callout uses the **info** type
  to highlight introductory information.
\`\`\`

\`\`\`ui:callout
type: warning
title: Caution
content: |
  Be careful when editing YAML frontmatter directly.
  Invalid syntax will produce a diagnostic warning.
\`\`\`

\`\`\`ui:callout
type: error
title: Breaking Change
content: |
  The v2 API removed the \`renderSync\` method.
  Please migrate to the async \`compile\` function.
\`\`\`

\`\`\`ui:callout
type: tip
title: Pro Tip
content: |
  Use the **kitchen sink** preset to see all components at once.
\`\`\`
`;

export const tabs = `\
# Tabs Demo

Tabs let you organize content into switchable panels.

\`\`\`ui:tabs
tabs:
  - label: Overview
    content: |
      This is the **overview** tab with standard Markdown.

      It can contain multiple paragraphs and inline formatting.
  - label: Installation
    content: |
      Install via your preferred package manager:

      \`npm install @glyphjs/runtime\`
  - label: Usage
    content: |
      Import and use the runtime:

      \`import { createGlyphRuntime } from '@glyphjs/runtime'\`
\`\`\`
`;

export const steps = `\
# Steps Demo

Steps provide sequential guides with progress indication.

\`\`\`ui:steps
steps:
  - title: Install Dependencies
    status: completed
    content: |
      Run \`pnpm install\` to install all workspace packages.
  - title: Configure the Runtime
    status: active
    content: |
      Create a runtime instance and register your components.
  - title: Render Documents
    status: pending
    content: |
      Pass compiled IR to the \`GlyphDocument\` component.
\`\`\`
`;

export const table = `\
# Table Demo

Data tables support sorting, filtering, and aggregation.

\`\`\`ui:table
columns:
  - key: name
    label: Package
    sortable: true
    filterable: true
    type: string
  - key: version
    label: Version
    sortable: true
    type: string
  - key: size
    label: Size (KB)
    sortable: true
    type: number
rows:
  - name: "@glyphjs/compiler"
    version: "1.0.0"
    size: 12
  - name: "@glyphjs/runtime"
    version: "1.0.0"
    size: 18
  - name: "@glyphjs/components"
    version: "1.0.0"
    size: 24
  - name: "@glyphjs/parser"
    version: "1.0.0"
    size: 8
  - name: "@glyphjs/types"
    version: "1.0.0"
    size: 3
aggregation:
  - column: size
    function: sum
\`\`\`
`;

export const graph = `\
# Graph Demo

Graphs visualize relationships between nodes.

\`\`\`ui:graph
type: dag
layout: top-down
nodes:
  - id: parser
    label: Parser
  - id: compiler
    label: Compiler
  - id: runtime
    label: Runtime
  - id: components
    label: Components
  - id: types
    label: Types
  - id: schemas
    label: Schemas
edges:
  - from: parser
    to: compiler
    label: AST
  - from: compiler
    to: runtime
    label: IR
  - from: components
    to: runtime
    label: registers
  - from: types
    to: parser
  - from: types
    to: compiler
  - from: types
    to: runtime
  - from: schemas
    to: compiler
    label: validates
  - from: schemas
    to: components
\`\`\`
`;

export const chart = `\
# Chart Demo

Charts render data visualizations for line, bar, area, and OHLC types.

\`\`\`ui:chart
type: bar
series:
  - name: Downloads
    data:
      - month: Jan
        value: 1200
      - month: Feb
        value: 1900
      - month: Mar
        value: 3100
      - month: Apr
        value: 5200
      - month: May
        value: 4800
      - month: Jun
        value: 6100
xAxis:
  key: month
  label: Month
yAxis:
  key: value
  label: Downloads
legend: true
\`\`\`
`;

export const timeline = `\
# Timeline Demo

Timelines display events in chronological order.

\`\`\`ui:timeline
orientation: vertical
events:
  - date: "2024-01"
    title: Project Kickoff
    description: Initial concept and RFC drafted.
    type: milestone
  - date: "2024-03"
    title: Parser & Compiler
    description: Markdown parsing and IR compilation implemented.
  - date: "2024-05"
    title: Runtime & Components
    description: React runtime with all 8 component types shipped.
    type: milestone
  - date: "2024-07"
    title: Theme System
    description: Light and dark theme support with CSS variable resolution.
  - date: "2024-09"
    title: Demo App
    description: Vite + React demo app with live preview and presets.
    type: milestone
\`\`\`
`;

export const kitchenSink = `\
---
title: Kitchen Sink
description: A demo showcasing multiple Glyph component types together.
tags:
  - demo
  - showcase
---

# Kitchen Sink

This document demonstrates **multiple Glyph components** working together in a single document.

## Important Note

\`\`\`ui:callout
type: info
title: About This Demo
content: |
  This preset combines several component types to show
  how they render together in one document.
\`\`\`

## Architecture

\`\`\`ui:graph
type: dag
layout: top-down
nodes:
  - id: markdown
    label: Markdown
  - id: ir
    label: Glyph IR
  - id: react
    label: React Tree
edges:
  - from: markdown
    to: ir
    label: compile
  - from: ir
    to: react
    label: render
\`\`\`

## Package Sizes

\`\`\`ui:table
columns:
  - key: pkg
    label: Package
    sortable: true
    type: string
  - key: kb
    label: Size (KB)
    sortable: true
    type: number
rows:
  - pkg: compiler
    kb: 12
  - pkg: runtime
    kb: 18
  - pkg: components
    kb: 24
\`\`\`

## Monthly Growth

\`\`\`ui:chart
type: line
series:
  - name: Users
    data:
      - month: Jan
        count: 100
      - month: Feb
        count: 250
      - month: Mar
        count: 480
      - month: Apr
        count: 910
xAxis:
  key: month
  label: Month
yAxis:
  key: count
  label: Users
legend: true
\`\`\`

## Setup Guide

\`\`\`ui:tabs
tabs:
  - label: npm
    content: |
      \`npm install @glyphjs/runtime @glyphjs/compiler\`
  - label: pnpm
    content: |
      \`pnpm add @glyphjs/runtime @glyphjs/compiler\`
\`\`\`

## Getting Started

\`\`\`ui:steps
steps:
  - title: Install
    status: completed
    content: |
      Add the packages to your project.
  - title: Configure
    status: active
    content: |
      Set up the runtime and register components.
  - title: Render
    status: pending
    content: |
      Pass compiled IR into the GlyphDocument component.
\`\`\`

## Project Timeline

\`\`\`ui:timeline
orientation: vertical
events:
  - date: "2024-01"
    title: Concept
    description: RFC drafted and approved.
  - date: "2024-06"
    title: v1.0
    description: First stable release.
    type: milestone
\`\`\`

---

*Built with Glyph JS*
`;

export const presets: Record<string, string> = {
  simple,
  callout,
  tabs,
  steps,
  table,
  graph,
  chart,
  timeline,
  kitchenSink,
};
