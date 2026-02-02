import type { Diagnostic, DiagnosticSource, SourcePosition } from '@glyphjs/types';

// ─── Diagnostic Creation Helpers ─────────────────────────────

/**
 * Create a diagnostic with the given source, severity, message, and optional position.
 *
 * @param source - The subsystem that produced the diagnostic (e.g., 'compiler', 'parser', 'schema').
 * @param severity - Severity level: 'error', 'warning', or 'info'.
 * @param code - Machine-readable diagnostic code (e.g., 'YAML_PARSE_ERROR').
 * @param message - Human-readable description of the issue.
 * @param position - Optional source position where the issue was detected.
 * @param details - Optional structured details (e.g., Zod issue objects).
 * @returns A fully constructed Diagnostic object.
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
 *
 * @param componentType - The ui: component type that failed validation (without the `ui:` prefix).
 * @param message - Concatenated validation error messages from Zod.
 * @param position - Optional source position of the component block.
 * @param details - Optional raw Zod issue objects.
 * @returns A Diagnostic with severity 'error' and code 'SCHEMA_VALIDATION_FAILED'.
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
 *
 * @param componentType - The unrecognized component type (without the `ui:` prefix).
 * @param position - Optional source position of the component block.
 * @returns A Diagnostic with severity 'info' and code 'UNKNOWN_COMPONENT_TYPE'.
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
 *
 * @param componentType - The ui: component type whose YAML failed to parse (without the `ui:` prefix).
 * @param yamlError - The YAML parser error message.
 * @param position - Optional source position of the fenced code block.
 * @returns A Diagnostic with severity 'error' and code 'YAML_PARSE_ERROR'.
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
