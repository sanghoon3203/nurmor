import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

const brandedScreens = [
  'src/features/launch/AppLaunchGate.tsx',
  'src/features/auth/LoginScreen.tsx',
];

test('opening and login screens use provided svg brand assets instead of png files', () => {
  for (const file of brandedScreens) {
    const source = readFileSync(join(projectRoot, file), 'utf8');

    assert.equal(source.includes("assets/brand/logo.png"), false, `${file} should not import logo.png`);
    assert.equal(source.includes("assets/brand/leaves.png"), false, `${file} should not import leaves.png`);
  }
});

test('brand asset module imports the provided logo_sum and leaves svg files', () => {
  const source = readFileSync(join(projectRoot, 'src/features/brand/BrandAssets.tsx'), 'utf8');

  assert.equal(source.includes('../../../../logo_sum.svg'), true, 'BrandAssets should import logo_sum.svg');
  assert.equal(source.includes('../../../../leaves.svg'), true, 'BrandAssets should import leaves.svg');
  assert.equal(source.includes('function LeafBody'), false, 'BrandAssets should not redraw custom leaf paths');
});

test('launch gate keeps logo_sum visible for 1.5 seconds before the leaf curtain', () => {
  const source = readFileSync(join(projectRoot, 'src/features/launch/AppLaunchGate.tsx'), 'utf8');

  assert.equal(source.includes('const LOGO_HOLD_MS = 1500'), true);
  assert.equal(source.includes('Animated.delay(LOGO_HOLD_MS)'), true);
});

test('launch leaf curtain fills densely before route replacement and uncovers after route change', () => {
  const source = readFileSync(join(projectRoot, 'src/features/launch/AppLaunchGate.tsx'), 'utf8');

  assert.equal(source.includes('const LEAF_LAYER_COUNT = 4'), true);
  assert.equal(source.includes('const POST_ROUTE_UNCOVER_DELAY_MS = 320'), true);
  assert.equal(source.includes('baseTileCount * LEAF_LAYER_COUNT'), true);
  assert.equal(source.includes('Animated.delay(POST_ROUTE_UNCOVER_DELAY_MS)'), true);
});
