import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/slugify.mjs';

test('slugify lowercases words and joins them with hyphens', () => {
  assert.equal(slugify('Hello, World!'), 'hello-world');
});

test('slugify trims duplicate separators and removes accents', () => {
  assert.equal(slugify('  Café -- déjà vu  '), 'cafe-deja-vu');
});

test('slugify preserves git-holdpoint marker text in the output', () => {
  assert.equal(slugify('github.create_pr'), 'github-create_pr');
});
