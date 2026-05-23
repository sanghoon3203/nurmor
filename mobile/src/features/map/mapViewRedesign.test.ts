import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

function readSource(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

test('map view uses discovery emoji markers and habitat cell polygons', () => {
  const source = readSource('src/features/map/MapHomeScreen.tsx');

  assert.equal(source.includes('listCommunityDiscoveries'), true);
  assert.equal(source.includes('DiscoveryMarker'), true);
  assert.equal(source.includes('emojiForDiscovery'), true);
  assert.equal(source.includes('Polygon'), true);
  assert.equal(source.includes('demoHabitatCells'), true);
});

test('map view opens an ecology report as a vertical toggle panel', () => {
  const source = readSource('src/features/map/MapHomeScreen.tsx');

  assert.equal(source.includes('Animated.View'), true);
  assert.equal(source.includes('CellEcologyReport'), true);
  assert.equal(source.includes('reportPanelMotion'), true);
  assert.equal(source.includes('selectedCellId'), true);
  assert.equal(source.includes('togglePanelTranslateY'), true);
  assert.equal(source.includes('blurRadius'), true);
  assert.equal(source.includes('outputRange: [94, 0]'), true);
  assert.equal(source.includes('useSafeAreaInsets'), true);
  assert.equal(source.includes('bottom: Math.max(insets.bottom + 86, 108)'), true);
  assert.equal(source.includes('PanResponder'), true);
  assert.equal(source.includes('reportHandleResponder'), true);
  assert.equal(source.includes('gesture.dy > 36'), true);
  assert.equal(source.includes('width: 150'), true);
  assert.equal(source.includes('paddingTop: 8'), true);
  assert.equal(source.includes('생태 보고서'), true);
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
