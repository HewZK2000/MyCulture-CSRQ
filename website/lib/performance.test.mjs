import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findLeader, meanOptionGap } from './performance.ts';

const row = (id, scores, extra = {}) => ({
  id,
  family: 'Test',
  model: id,
  reasoning: false,
  scores: { mcq: null, csrqLoose: null, csrqStrict: null, crqLoose: null, crqStrict: null, ...scores },
  ...extra,
});

const strong = row('strong', { mcq: 90, csrqStrict: 60 });
const weak = row('weak', { mcq: 70, csrqStrict: 50 });
const failed = row('failed', { mcq: 0, csrqStrict: 0 }, { formatFailure: true });
const baseline = row('baseline', { mcq: 25, csrqStrict: 95 }, { family: 'Baseline' });

test('findLeader returns the highest score even when rows are sorted ascending', () => {
  assert.equal(findLeader([failed, weak, strong], 'csrqStrict')?.id, 'strong');
});

test('findLeader ignores the random baseline', () => {
  assert.equal(findLeader([baseline, weak], 'csrqStrict')?.id, 'weak');
});

test('findLeader skips missing scores and returns undefined when nothing is scored', () => {
  assert.equal(findLeader([weak], 'crqLoose'), undefined);
  assert.equal(findLeader([], 'mcq'), undefined);
});

test('meanOptionGap excludes the baseline and format-failure rows', () => {
  assert.equal(meanOptionGap([strong, weak, failed, baseline]), 25);
});

test('meanOptionGap returns null when no row has both scores', () => {
  assert.equal(meanOptionGap([failed, baseline, row('crq-only', { crqLoose: 40 })]), null);
});
