import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

test('RevealView replays its entrance animation when a tab screen receives focus again', () => {
  const source = readFileSync(join(projectRoot, 'src/features/atlas/glass.tsx'), 'utf8');

  assert.equal(source.includes("from '@react-navigation/native'"), true);
  assert.equal(source.includes('useFocusEffect'), true);
  assert.equal(source.includes('runReveal'), true);
  assert.equal(source.includes('value.setValue(0)'), true);
});

test('GradientScreen keeps non-map tab backgrounds fixed to Atlas paper', () => {
  const source = readFileSync(join(projectRoot, 'src/features/atlas/glass.tsx'), 'utf8');

  assert.equal(source.includes('backgroundColor: colors.paper'), true);
  assert.equal(source.includes('topMist'), false);
  assert.equal(source.includes('fieldVeil'), false);
  assert.equal(source.includes('waterVeil'), false);
});
