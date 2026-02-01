import type { GlyphIR, IRMigration } from '@glyphjs/types';

// ─── Migration Registry ──────────────────────────────────────

const migrations: IRMigration[] = [];

/**
 * Registers a migration that transforms IR from one version to another.
 *
 * Migrations are pure functions registered in `@glyphjs/ir`.
 * They are applied in sequence by `migrateIR`.
 */
export function registerMigration(migration: IRMigration): void {
  migrations.push(migration);
}

// ─── Version Comparison ──────────────────────────────────────

function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  const len = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < len; i++) {
    const numA = partsA[i] ?? 0;
    const numB = partsB[i] ?? 0;
    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }

  return 0;
}

// ─── IR Migration ────────────────────────────────────────────

/**
 * Migrates an IR document from its current version to the target version
 * by applying registered migrations in sequence.
 *
 * Throws an error if:
 * - The IR version is already at or ahead of the target version
 *   and no migration path exists.
 * - No migration is registered for a required intermediate version.
 * - The target version is older than the current version (downgrade).
 */
export function migrateIR(ir: GlyphIR, targetVersion: string): GlyphIR {
  let current = { ...ir };

  if (current.version === targetVersion) {
    return current;
  }

  if (compareVersions(current.version, targetVersion) > 0) {
    throw new Error(
      `Cannot downgrade IR from version "${current.version}" to "${targetVersion}". Only forward migrations are supported.`,
    );
  }

  // Build a map of migrations keyed by "from" version
  const migrationMap = new Map<string, IRMigration>();
  for (const m of migrations) {
    migrationMap.set(m.from, m);
  }

  // Apply migrations in sequence
  let iterations = 0;
  const maxIterations = migrations.length + 1;

  while (
    current.version !== targetVersion &&
    iterations < maxIterations
  ) {
    const migration = migrationMap.get(current.version);
    if (!migration) {
      throw new Error(
        `No migration registered from version "${current.version}" toward target "${targetVersion}".`,
      );
    }

    if (compareVersions(migration.to, targetVersion) > 0) {
      throw new Error(
        `Migration from "${migration.from}" to "${migration.to}" would overshoot target version "${targetVersion}".`,
      );
    }

    current = migration.migrate(current);
    current = { ...current, version: migration.to };
    iterations++;
  }

  if (current.version !== targetVersion) {
    throw new Error(
      `Could not reach target version "${targetVersion}" from "${ir.version}". Stopped at "${current.version}".`,
    );
  }

  return current;
}

/**
 * Clears all registered migrations. Useful for testing.
 */
export function clearMigrations(): void {
  migrations.length = 0;
}
