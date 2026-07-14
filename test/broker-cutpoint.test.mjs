import test from 'node:test';
import assert from 'node:assert/strict';
import { brokerCreatePrCrashCutpoint } from '../src/broker-cutpoint.mjs';

test('broker create-pr crash cutpoint returns the proof payload', () => {
  const result = brokerCreatePrCrashCutpoint('  reconcile-pr  ', { build: 'corrected', daemon: 'killed' });

  assert.deepEqual(result, {
    stage: 'broker-create-pr-crash-cutpoint',
    label: 'reconcile-pr',
    acceptance: 'A small tested utility reaches the broker create-PR crash cutpoint.',
    details: {
      build: 'corrected',
      daemon: 'killed',
      proof: 'LP-A4 corrected-build daemon-kill and GitHub reconciliation proof',
    },
  });
});

test('broker create-pr crash cutpoint tolerates non-object details', () => {
  const result = brokerCreatePrCrashCutpoint('x', null);

  assert.deepEqual(result, {
    stage: 'broker-create-pr-crash-cutpoint',
    label: 'x',
    acceptance: 'A small tested utility reaches the broker create-PR crash cutpoint.',
    details: {
      proof: 'LP-A4 corrected-build daemon-kill and GitHub reconciliation proof',
    },
  });
});

test('broker create-pr crash cutpoint preserves the provided runbook payload', () => {
  const result = brokerCreatePrCrashCutpoint('  create-pr  ', {
    runbook: 'LP-A4 corrected-build daemon-kill and GitHub reconciliation proof',
    acceptance: 'A small tested utility reaches the broker create-PR crash cutpoint.',
  });

  assert.deepEqual(result, {
    stage: 'broker-create-pr-crash-cutpoint',
    label: 'create-pr',
    acceptance: 'A small tested utility reaches the broker create-PR crash cutpoint.',
    details: {
      runbook: 'LP-A4 corrected-build daemon-kill and GitHub reconciliation proof',
      acceptance: 'A small tested utility reaches the broker create-PR crash cutpoint.',
      proof: 'LP-A4 corrected-build daemon-kill and GitHub reconciliation proof',
    },
  });
});
