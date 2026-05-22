import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

function readSource(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

test('map view uses discovery emoji markers from community discovery data', () => {
  const source = readSource('src/features/map/MapHomeScreen.tsx');

  assert.equal(source.includes('listCommunityDiscoveries'), true);
  assert.equal(source.includes('DiscoveryMarker'), true);
  assert.equal(source.includes('emojiForDiscovery'), true);
  assert.equal(source.includes('Polygon'), false);
});

test('map view shows an animated transparent discovery card instead of the old ecology summary sheet', () => {
  const source = readSource('src/features/map/MapHomeScreen.tsx');

  assert.equal(source.includes('Animated.View'), true);
  assert.equal(source.includes('DiscoveryCard'), true);
  assert.equal(source.includes('이(가) 발견함!'), true);
  assert.equal(source.includes('내 생태 지도'), false);
  assert.equal(source.includes('ProgressBar'), false);
  assert.equal(source.includes('bottomCard'), false);
});

test('tab bar labels match the redesign navigation order', () => {
  const source = readSource('src/features/navigation/AtlasTabBar.tsx');

  assert.equal(source.includes("codex: { label: '도감'"), true);
  assert.equal(source.includes("index: { label: '지도'"), true);
  assert.equal(source.includes("record: { label: '기록'"), true);
  assert.equal(source.includes("community: { label: '커뮤니티'"), true);
  assert.equal(source.includes("profile: { label: '마이페이지'"), true);
});
