import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

test('community screen uses the simplified feed header and hides removed location chrome', () => {
  const source = readFileSync(join(projectRoot, 'src/features/community/CommunityScreen.tsx'), 'utf8');

  assert.equal(source.includes('RevealView'), true);
  assert.equal(source.includes('근방 5km 생태 소식'), false);
  assert.equal(source.includes('정확한 좌표 없이'), false);
  assert.equal(source.includes('현재 위치 기준'), false);
  assert.equal(source.includes('radiusPanel'), false);
  assert.equal(source.includes('좋아요 {item.likeCount}'), false);
  assert.equal(source.includes('댓글 {item.commentCount}'), false);
});

test('community cards use photo-led card news layout and scroll-linked reveal motion', () => {
  const source = readFileSync(join(projectRoot, 'src/features/community/CommunityScreen.tsx'), 'utf8');

  assert.equal(source.includes("backgroundColor: '#FDF8F2'"), true);
  assert.equal(source.includes('styles.discoveryPhoto'), true);
  assert.equal(source.includes('styles.userRow'), true);
  assert.equal(source.includes('fontSize: 16'), true);
  assert.equal(source.includes('fontWeights.bold'), true);
  assert.equal(source.includes('fontSize: 12'), true);
  assert.equal(source.includes('fontWeights.light'), true);
  assert.equal(source.includes('Animated.ScrollView'), true);
  assert.equal(source.includes('CardNewsReveal'), true);
  assert.equal(source.includes('scrollY'), true);
});

test('community screen removes card overflow menu and tightens recent discovery spacing with Bookk fonts', () => {
  const source = readFileSync(join(projectRoot, 'src/features/community/CommunityScreen.tsx'), 'utf8');

  assert.equal(source.includes("from '../../theme/typography'"), true);
  assert.equal(source.includes('styles.moreButton'), false);
  assert.equal(source.includes('styles.moreText'), false);
  assert.equal(source.includes('•••'), false);
  assert.equal(source.includes('fontWeights.bold'), true);
  assert.equal(source.includes('fontWeights.light'), true);
  assert.equal(source.includes('marginBottom: -20'), true);
});
