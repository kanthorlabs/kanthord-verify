import test from 'node:test';
import assert from 'node:assert/strict';
import { truncate } from '../src/truncate.mjs';

test('truncate returns original text when within limit', () => {
  assert.equal(truncate('hello', 5), 'hello');
});

test('truncate counts unicode code points instead of UTF-16 code units', () => {
  assert.equal(truncate('🙂🙂🙂', 2), '🙂…');
});

test('truncate preserves whole characters with custom suffix', () => {
  assert.equal(truncate('naïve café', 8, '...'), 'naïv...');
});

test('truncate handles zero limit and long suffixes safely', () => {
  assert.equal(truncate('hello', 0), '');
  assert.equal(truncate('hello', 2, '🙂🙂🙂'), '🙂🙂');
});

test('truncate rejects invalid lengths', () => {
  assert.throws(() => truncate('hello', -1), RangeError);
});
