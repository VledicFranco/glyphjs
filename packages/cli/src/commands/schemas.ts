import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { componentSchemas, getJsonSchema } from '@glyphjs/schemas';

export interface SchemasCommandOptions {
  all?: boolean;
  list?: boolean;
  output?: string;
}

export async function schemasCommand(
  type: string | undefined,
  options: SchemasCommandOptions,
): Promise<void> {
  const { all, list, output } = options;

  // No args, no flags → usage error
  if (!type && !all && !list) {
    process.stderr.write('error — specify a component type, --all, or --list\n');
    process.stderr.write('Usage: glyphjs schemas [type] [--all] [--list] [-o <path>]\n');
    process.exitCode = 2;
    return;
  }

  let result: string;

  if (list) {
    const names = [...componentSchemas.keys()].sort();
    result = names.join('\n') + '\n';
  } else if (all) {
    const schemas: Record<string, object> = {};
    for (const key of componentSchemas.keys()) {
      const schema = getJsonSchema(key);
      if (schema) schemas[`ui:${key}`] = schema;
    }
    result = JSON.stringify(schemas, null, 2) + '\n';
  } else {
    // Single type — strip optional "ui:" prefix
    // type is always defined here: the early-return above handles !type && !all && !list
    const rawType = type ?? '';
    const normalized = rawType.startsWith('ui:') ? rawType.slice(3) : rawType;
    const schema = getJsonSchema(normalized);
    if (!schema) {
      process.stderr.write(`error — unknown component type: "${normalized}"\n`);
      process.stderr.write(`Available types: ${[...componentSchemas.keys()].sort().join(', ')}\n`);
      process.exitCode = 2;
      return;
    }
    result = JSON.stringify(schema, null, 2) + '\n';
  }

  if (output) {
    try {
      const filePath = resolve(process.cwd(), output);
      await writeFile(filePath, result, 'utf-8');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`error — Could not write output: ${message}\n`);
      process.exitCode = 2;
    }
  } else {
    process.stdout.write(result);
  }
}
