import type { Diagnostic, DiagnosticSource, SourcePosition } from '@glyphjs/types';

// ─── Diagnostic Creation Helpers ─────────────────────────────

/**
 * Create a diagnostic with the given source, severity, message, and optional position.
 */
export function createDiagnostic(
  source: DiagnosticSource,
  severity: Diagnostic['severity'],
  code: string,
  message: string,
  position?: SourcePosition,
  details?: unknown,
): Diagnostic {
  const diag: Diagnostic = { severity, code, message, source };
  if (position) {
    diag.position = position;
  }
  if (details !== undefined) {
    diag.details = details;
  }
  return diag;
}

/**
 * Create a schema validation error diagnostic.
 */
export function createSchemaError(
  componentType: string,
  message: string,
  position?: SourcePosition,
  details?: unknown,
): Diagnostic {
  return createDiagnostic(
    'schema',
    'error',
    'SCHEMA_VALIDATION_FAILED',
    `Schema validation failed for ui:${componentType}: ${message}`,
    position,
    details,
  );
}

/**
 * Create an info diagnostic for unknown component types.
 */
export function createUnknownComponentInfo(
  componentType: string,
  position?: SourcePosition,
): Diagnostic {
  return createDiagnostic(
    'compiler',
    'info',
    'UNKNOWN_COMPONENT_TYPE',
    `Unknown component type "ui:${componentType}". Block preserved as-is.`,
    position,
  );
}

/**
 * Create a diagnostic for YAML parse errors on ui: blocks.
 */
export function createYamlError(
  componentType: string,
  yamlError: string,
  position?: SourcePosition,
): Diagnostic {
  return createDiagnostic(
    'parser',
    'error',
    'YAML_PARSE_ERROR',
    `YAML parse error in ui:${componentType}: ${yamlError}`,
    position,
  );
}
