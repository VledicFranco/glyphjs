# @glyphjs/ir

IR (Intermediate Representation) utilities for Glyph JS: validation, diffing, patching, and migration.

## Install

```bash
pnpm add @glyphjs/ir
```

## Usage

```ts
import { validateIR, diffIR, applyPatch, createEmptyIR } from '@glyphjs/ir';

// Create a blank document
const doc = createEmptyIR();

// Validate an IR document
const diagnostics = validateIR(doc);

// Diff two IR documents
const patch = diffIR(oldDoc, newDoc);

// Apply a patch
const updated = applyPatch(oldDoc, patch);
```

## API

- `validateIR(ir)` -- validate an IR document and return diagnostics
- `diffIR(a, b)` -- compute a patch that transforms `a` into `b`
- `applyPatch(ir, patch)` -- apply a patch to an IR document
- `composePatch(a, b)` -- compose two patches into one
- `registerMigration(migration)` / `migrateIR(ir)` -- version migration support
- `generateBlockId()` / `generateDocumentId()` -- deterministic ID generation
- `createEmptyIR()` -- factory for a blank IR document

## Docs

https://github.com/nicholasgriffintn/glyphjs
