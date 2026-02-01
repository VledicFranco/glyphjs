import { createHash } from 'node:crypto';

// ─── Hashing Helpers ─────────────────────────────────────────

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

// ─── Block ID Generation ─────────────────────────────────────

/**
 * Generates a content-addressed block ID.
 *
 * Returns `"b-"` + first 12 hex chars of SHA-256(documentId + blockType + SHA-256(content)).
 */
export function generateBlockId(
  documentId: string,
  blockType: string,
  content: string,
): string {
  const contentFingerprint = sha256Hex(content);
  const hash = sha256Hex(documentId + blockType + contentFingerprint);
  return `b-${hash.slice(0, 12)}`;
}

// ─── Document ID Generation ──────────────────────────────────

/**
 * Generates a document ID from the given options.
 *
 * Priority:
 * 1. If `glyphId` is present, return it directly.
 * 2. If `filePath` is present, normalize to forward slashes and return.
 * 3. If `content` is present, return `"doc-"` + first 16 hex chars of SHA-256(content).
 */
export function generateDocumentId(options: {
  glyphId?: string;
  filePath?: string;
  content?: string;
}): string {
  if (options.glyphId) {
    return options.glyphId;
  }

  if (options.filePath) {
    return options.filePath.replace(/\\/g, '/');
  }

  if (options.content) {
    const hash = sha256Hex(options.content);
    return `doc-${hash.slice(0, 16)}`;
  }

  return `doc-${sha256Hex('')}`.slice(0, 20);
}

// ─── Collision Resolution ────────────────────────────────────

/**
 * Resolves duplicate block IDs by appending `-1`, `-2`, etc. to collisions.
 *
 * The first occurrence of an ID is left unchanged; subsequent duplicates
 * receive numeric suffixes.
 */
export function resolveBlockIdCollisions(ids: string[]): string[] {
  const seen = new Map<string, number>();
  const result: string[] = [];

  for (const id of ids) {
    const count = seen.get(id);
    if (count === undefined) {
      seen.set(id, 1);
      result.push(id);
    } else {
      seen.set(id, count + 1);
      result.push(`${id}-${String(count)}`);
    }
  }

  return result;
}
