import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

function readSource(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

test('profile screen uses only currently available profile and public discovery data', () => {
  const source = readSource('src/features/profile/ProfileScreen.tsx');

  assert.equal(source.includes('마이페이지'), true);
  assert.equal(source.includes('나의 탐험 기록을 확인해보세요.'), true);
  assert.equal(source.includes('getUserProfile'), true);
  assert.equal(source.includes('getUserStats'), true);
  assert.equal(source.includes('getUserFootprints'), true);
  assert.equal(source.includes('getRecentObservations'), true);
  assert.equal(source.includes('listCommunityDiscoveries'), false);
  assert.equal(source.includes('buildFootprintStats'), true);
  assert.equal(source.includes('RecentDiscoveryStrip'), true);
  assert.equal(source.includes('UserFootprintCell'), true);
  assert.equal(source.includes('intensity'), true);
  assert.equal(source.includes('보고 횟수'), true);
  assert.equal(source.includes('발견 생물'), true);
  assert.equal(source.includes('업적 달성'), true);
  assert.equal(source.includes('탐험한 지역'), true);
  assert.equal(source.includes('발자국 통계'), true);
  assert.equal(source.includes('FootprintHeatmap'), true);
  assert.equal(source.includes('공개한 기록 기준'), true);
  assert.equal(source.includes('Lv.'), false);
  assert.equal(source.includes('XP'), false);
  assert.equal(source.includes('primaryActivityLocation'), false);
  assert.equal(source.includes('잠실 3동'), false);
  assert.equal(source.includes('Firebase 연결'), false);
  assert.equal(source.includes('Spring API'), false);
});

test('profile screen renders an explorer certificate card with data-driven title and Bookk fonts', () => {
  const source = readSource('src/features/profile/ProfileScreen.tsx');

  assert.equal(source.includes("from '../../theme/typography'"), true);
  assert.equal(source.includes('buildExplorerTitle'), true);
  assert.equal(source.includes('탐험가 인증 카드'), true);
  assert.equal(source.includes('styles.certificateCard'), true);
  assert.equal(source.includes('reportCount'), true);
  assert.equal(source.includes('discoveredSpeciesCount'), true);
  assert.equal(source.includes('fontWeights.bold'), true);
  assert.equal(source.includes('fontWeights.light'), true);
  assert.equal(source.includes('마이페이지 🌱'), false);
});
