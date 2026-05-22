import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  codexFilters,
  filterCodexCards,
  inferCodexFamily,
  remoteCategoryForFilter,
  toDisplayNumber,
  type CodexCardViewModel,
} from './codexViewModel';

const baseCard: CodexCardViewModel = {
  id: 'entry-1',
  displayNumber: 'No.001',
  title: '참새',
  scientificName: 'Passer montanus',
  category: 'ANIMAL',
  categoryLabel: '동물',
  categoryIcon: 'paw',
  illustration: 'ANIMAL',
  date: '2026.05.22',
  place: '잠실 3동',
  isLatest: true,
};

test('codex filter options include all requested biological groups', () => {
  assert.deepEqual(
    codexFilters.map((filter) => filter.label),
    ['전체', '식물', '동물', '어류', '곤충', '기타']
  );
});

test('inferCodexFamily separates plants, broad animals, fish, insects, and other entries', () => {
  assert.equal(inferCodexFamily({ category: 'PLANT', title: '개망초', scientificName: 'Erigeron annuus' }), 'PLANT');
  assert.equal(inferCodexFamily({ category: 'ANIMAL', title: '수달', scientificName: 'Lutra lutra' }), 'ANIMAL');
  assert.equal(inferCodexFamily({ category: 'ANIMAL', title: '참붕어', scientificName: 'Pseudorasbora parva' }), 'FISH');
  assert.equal(inferCodexFamily({ category: 'OTHER', title: '장수풍뎅이', scientificName: 'Allomyrina dichotoma' }), 'INSECT');
  assert.equal(inferCodexFamily({ category: 'OTHER', title: '알 수 없는 흔적', scientificName: 'Unknown trace' }), 'OTHER');
});

test('filterCodexCards keeps fish and insect out of the broad animal filter', () => {
  const cards: CodexCardViewModel[] = [
    baseCard,
    { ...baseCard, id: 'entry-2', category: 'FISH', categoryLabel: '어류', title: '참붕어' },
    { ...baseCard, id: 'entry-3', category: 'INSECT', categoryLabel: '곤충', title: '장수풍뎅이' },
  ];

  assert.deepEqual(filterCodexCards(cards, 'ANIMAL').map((card) => card.id), ['entry-1']);
  assert.deepEqual(filterCodexCards(cards, 'FISH').map((card) => card.id), ['entry-2']);
  assert.deepEqual(filterCodexCards(cards, 'INSECT').map((card) => card.id), ['entry-3']);
  assert.deepEqual(filterCodexCards(cards, 'ALL').map((card) => card.id), ['entry-1', 'entry-2', 'entry-3']);
});

test('remoteCategoryForFilter only narrows Firestore queries when the backend category is exact enough', () => {
  assert.equal(remoteCategoryForFilter('ALL'), undefined);
  assert.equal(remoteCategoryForFilter('PLANT'), 'PLANT');
  assert.equal(remoteCategoryForFilter('ANIMAL'), 'ANIMAL');
  assert.equal(remoteCategoryForFilter('FISH'), undefined);
  assert.equal(remoteCategoryForFilter('INSECT'), undefined);
  assert.equal(remoteCategoryForFilter('OTHER'), 'OTHER');
});

test('toDisplayNumber formats codex numbers like the reference screen', () => {
  assert.equal(toDisplayNumber(0), 'No.001');
  assert.equal(toDisplayNumber(41), 'No.042');
  assert.equal(toDisplayNumber(127), 'No.128');
});
