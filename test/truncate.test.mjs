import test from 'node:test';
import assert from 'node:assert/strict';
import { truncate } from '../src/truncate.mjs';

test('truncate returns the original string when within limit', () => {
  assert.equal(truncate('hello', 5), 'hello');
});

test('truncate preserves unicode surrogate pairs', () => {
  assert.equal(truncate('😀😃😄', 2), '😀…');
});

test('truncate respects custom ellipsis length', () => {
  assert.equal(truncate('abcdef', 4, '..'), 'ab..');
});

test('truncate rejects invalid lengths', () => {
  assert.throws(() => truncate('abc', -1), RangeError);
});
