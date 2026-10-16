export type ScoreKey = 'mcq' | 'csrqLoose' | 'csrqStrict' | 'crqLoose' | 'crqStrict';

export type ModelResult = {
  id: string;
  family: string;
  model: string;
  reasoning: boolean;
  formatFailure?: boolean;
  scores: Record<ScoreKey, number | null>;
};

const isBaseline = (row: ModelResult) => row.family === 'Baseline';

// Highest-scoring model for a metric, independent of the table's sort direction.
export function findLeader(rows: ModelResult[], metric: ScoreKey): ModelResult | undefined {
  return rows
    .filter((row) => !isBaseline(row) && row.scores[metric] !== null)
    .reduce<ModelResult | undefined>(
      (best, row) => (!best || (row.scores[metric] ?? -1) > (best.scores[metric] ?? -1) ? row : best),
      undefined,
    );
}

// Mean MCQ − strict CSRQ gap. Format failures score 0 on both and would hide the real gap.
export function meanOptionGap(rows: ModelResult[]): number | null {
  const gaps = rows
    .filter((row) => !isBaseline(row) && !row.formatFailure)
    .flatMap(({ scores: { mcq, csrqStrict } }) => (mcq === null || csrqStrict === null ? [] : [mcq - csrqStrict]));
  return gaps.length ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : null;
}
