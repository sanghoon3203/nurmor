import assert from 'node:assert/strict';
import { test } from 'node:test';

import { defaultShareOption, shareOptions, visibilityForShareOption } from './recordFlowViewModel';

test('share options expose private, cell, and public planting visibility', () => {
  assert.deepEqual(
    shareOptions.map((option) => `${option.id}:${option.visibility}`),
    ['private:PRIVATE', 'cell:CELL', 'public:PUBLIC']
  );
});

test('cell sharing is the default because it updates the habitat codex without exact coordinates', () => {
  assert.equal(defaultShareOption.id, 'cell');
  assert.equal(visibilityForShareOption('cell'), 'CELL');
});

test('unknown share option falls back to cell visibility', () => {
  assert.equal(visibilityForShareOption('missing'), 'CELL');
});
