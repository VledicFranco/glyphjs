import type { GlyphComponentDefinition } from '@glyphjs/types';

// ─── Validation Result ───────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ─── Pattern for ui:* type ───────────────────────────────────

const UI_TYPE_PATTERN = /^ui:.+$/;

/**
 * Validates a GlyphComponentDefinition before registration.
 *
 * Checks:
 * 1. `type` must match the `ui:${string}` format
 * 2. `schema` must be present with `parse` and `safeParse` methods
 * 3. `render` must be present and be a function or class
 *
 * Returns an object with `valid` (boolean) and `errors` (string[]).
 */
export function validateComponentDefinition(
  definition: GlyphComponentDefinition,
): ValidationResult {
  const errors: string[] = [];

  // 1. Validate type field
  if (!definition.type) {
    errors.push('Component definition must have a "type" field.');
  } else if (!UI_TYPE_PATTERN.test(definition.type)) {
    errors.push(
      `Component type "${definition.type}" must match the "ui:*" format (e.g. "ui:chart", "ui:graph").`,
    );
  }

  // 2. Validate schema field
  if (!definition.schema) {
    errors.push('Component definition must have a "schema" field.');
  } else {
    if (typeof definition.schema.parse !== 'function') {
      errors.push(
        'Component schema must have a "parse" method (expected a Zod-compatible schema).',
      );
    }
    if (typeof definition.schema.safeParse !== 'function') {
      errors.push(
        'Component schema must have a "safeParse" method (expected a Zod-compatible schema).',
      );
    }
  }

  // 3. Validate render field
  if (!definition.render) {
    errors.push(
      'Component definition must have a "render" field (function or class component).',
    );
  } else if (
    typeof definition.render !== 'function'
  ) {
    errors.push(
      'Component "render" must be a function (functional component) or a class (class component).',
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
