import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveLaunchRoute } from './launchFlow';

test('resolveLaunchRoute sends existing sessions to the map tabs', () => {
  assert.equal(resolveLaunchRoute('authenticated'), '/(tabs)');
});

test('resolveLaunchRoute sends missing sessions and recoverable auth states to login', () => {
  assert.equal(resolveLaunchRoute('unauthenticated'), '/login');
  assert.equal(resolveLaunchRoute('missing-config'), '/login');
  assert.equal(resolveLaunchRoute('error'), '/login');
});

test('resolveLaunchRoute waits while auth bootstrap is loading', () => {
  assert.equal(resolveLaunchRoute('loading'), null);
});
