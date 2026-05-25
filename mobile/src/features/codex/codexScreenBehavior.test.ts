import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

function readSource(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

test('codex screen renders the requested 350x390 bottom-anchored blurred glass card', () => {
  const source = readSource('src/features/codex/CodexScreen.tsx');

  assert.equal(source.includes("import { BlurView } from 'expo-blur';"), true);
  assert.equal(source.includes('CodexFeaturedGlassCard'), true);
  assert.equal(source.includes('featuredCard'), true);
  assert.equal(source.includes('width: 350'), true);
  assert.equal(source.includes('height: 390'), true);
  assert.equal(source.includes('featuredImageLayer'), true);
  assert.equal(source.includes('bottom: 0'), true);
  assert.equal(source.includes('height: 130'), true);
  assert.equal(source.includes('featuredBlurPanel'), true);
  assert.equal(source.includes('featuredBlurGradient'), true);
  assert.equal(source.includes('intensity={90}'), true);
  assert.equal(source.includes('tint="dark"'), true);
  assert.equal(source.includes('featuredRegionGlass'), true);
  assert.equal(source.includes('featuredFollowGlass'), true);
  assert.equal(source.includes('Follow +'), true);
});
