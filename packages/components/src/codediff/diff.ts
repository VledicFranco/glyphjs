// ─── Line-based diff algorithm (LCS-based) ─────────────────────

export type DiffLineKind = 'add' | 'del' | 'eq';

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
  oldLineNo?: number;
  newLineNo?: number;
}

/**
 * Computes a line-based diff between two strings.
 * Uses a longest common subsequence (LCS) approach via dynamic programming.
 * Returns a minimal edit script as an array of DiffLine entries.
 */
export function computeDiff(before: string, after: string): DiffLine[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const n = a.length;
  const m = b.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const edits: DiffLine[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      edits.unshift({ kind: 'eq', text: a[i - 1], oldLineNo: i, newLineNo: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      edits.unshift({ kind: 'add', text: b[j - 1], newLineNo: j });
      j--;
    } else {
      edits.unshift({ kind: 'del', text: a[i - 1], oldLineNo: i });
      i--;
    }
  }

  return edits;
}
