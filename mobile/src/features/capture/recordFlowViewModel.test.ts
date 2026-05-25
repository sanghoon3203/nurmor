import assert from 'node:assert/strict';
import { test } from 'node:test';

import { defaultShareOption, shareOptions, visibilityForShareOption } from './recordFlowViewModel';

test('share options expose private and public planting without cell-facing UI', () => {
  assert.deepEqual(
    shareOptions.map((option) => `${option.id}:${option.visibility}`),
    ['private:PRIVATE', 'public:PUBLIC']
  );
  assert.equal(shareOptions.some((option) => /셀|cell/i.test(`${option.id} ${option.label} ${option.description}`)), false);
});

test('private saving is the default because coordinates stay server-side', () => {
  assert.equal(defaultShareOption.id, 'private');
  assert.equal(visibilityForShareOption('private'), 'PRIVATE');
});

test('unknown share option falls back to private visibility', () => {
  assert.equal(visibilityForShareOption('missing'), 'PRIVATE');
});
