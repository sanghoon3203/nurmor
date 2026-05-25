import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bookkFonts } from './typography';

test('Bookk font tokens expose light and bold families used by Atlas screens', () => {
  assert.equal(bookkFonts.light, 'BookkGothic-Light');
  assert.equal(bookkFonts.bold, 'BookkGothic-Bold');
});
