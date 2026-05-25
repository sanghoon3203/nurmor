import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

function readSource(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

test('codex screen renders unified SpeciesCard data with the shared codex card component', () => {
  const source = readSource('src/features/codex/CodexScreen.tsx');
  const cardSource = readSource('src/features/codex/SpeciesCodexCard.tsx');
  const mapperSource = readSource('src/features/codex/codexMapper.ts');

  assert.equal(source.includes('SpeciesCodexCard'), true);
  assert.equal(source.includes('toSpeciesCard'), true);
  assert.equal(source.includes('firebaseCodexToSpeciesCard'), true);
  assert.equal(source.includes('sampleCodexToSpeciesCard'), true);
  assert.equal(source.includes('CodexFeaturedGlassCard'), false);
  assert.equal(source.includes('CodexFieldCard'), false);
  assert.equal(cardSource.includes("import { BlurView } from 'expo-blur';"), true);
  assert.equal(cardSource.includes('width: 350'), true);
  assert.equal(cardSource.includes('height: 300'), true);
  assert.equal(cardSource.includes('minHeight: 130'), true);
  assert.equal(cardSource.includes('tint="dark"'), true);
  assert.equal(cardSource.includes('Follow +'), true);
  assert.equal(mapperSource.includes('export function toSpeciesCard'), true);
  assert.equal(mapperSource.includes('export function getDefaultDescription'), true);
});

test('codex screen uses compact Bookk typography header and one-line filter chips', () => {
  const source = readSource('src/features/codex/CodexScreen.tsx');

  assert.equal(source.includes("from '../../theme/typography'"), true);
  assert.equal(source.includes('내가 근처에서 발견한 도감들'), true);
  assert.equal(source.includes('styles.leafMark'), false);
  assert.equal(source.includes('fontSize: 24'), true);
  assert.equal(source.includes('fontFamily: bookkFonts.light'), true);
  assert.equal(source.includes('fontWeights.bold'), true);
  assert.equal(source.includes('styles.filterBar'), true);
  assert.equal(source.includes("backgroundColor: '#F0F0F0'"), true);
  assert.equal(source.includes('styles.filterChipSelected'), true);
  assert.equal(source.includes('LatestSortMenu'), true);
  assert.equal(source.includes('최신순'), false);
});
