import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildSpeciesPhotoGallery, isSameSpecies, type SpeciesPhotoSource, type SpeciesReference } from './codexDetailViewModel';

const otter: SpeciesReference = {
  id: 'otter-1',
  title: '수달',
  scientificName: 'Lutra lutra',
  speciesKey: 'lutra-lutra',
  imageUrl: 'https://example.test/my-otter.jpg',
};

test('isSameSpecies matches exact scientific names before display names', () => {
  assert.equal(
    isSameSpecies(otter, {
      id: 'community-otter',
      title: '다른 이름',
      scientificName: 'Lutra lutra',
      speciesKey: 'community-key',
      imageUrl: 'https://example.test/community-otter.jpg',
    }),
    true
  );
});

test('isSameSpecies rejects unrelated animals even when category is the same', () => {
  assert.equal(
    isSameSpecies(otter, {
      id: 'squirrel-1',
      title: '다람쥐',
      scientificName: 'Tamias sibiricus',
      speciesKey: 'tamias-sibiricus',
      imageUrl: 'https://example.test/squirrel.jpg',
    }),
    false
  );
});

test('isSameSpecies allows Korean fallback after removing uncertain estimate suffixes', () => {
  assert.equal(
    isSameSpecies(
      { id: 'otter-estimate', title: '수달로 추정', scientificName: null, speciesKey: 'unknown', imageUrl: null },
      { id: 'otter-public', title: '수달', scientificName: null, speciesKey: 'other', imageUrl: 'https://example.test/otter.jpg' }
    ),
    true
  );
});

test('buildSpeciesPhotoGallery orders selected and mine photos before public same-species photos and dedupes URLs', () => {
  const mine: SpeciesPhotoSource[] = [
    { ...otter, id: 'my-duplicate', imageUrl: 'https://example.test/my-otter.jpg' },
    { ...otter, id: 'my-second', imageUrl: 'https://example.test/my-second.jpg' },
  ];
  const publicSources: SpeciesPhotoSource[] = [
    { ...otter, id: 'public-1', imageUrl: 'https://example.test/public-1.jpg' },
    { id: 'squirrel', title: '다람쥐', scientificName: 'Tamias sibiricus', speciesKey: 'tamias-sibiricus', imageUrl: 'https://example.test/squirrel.jpg' },
  ];

  assert.deepEqual(
    buildSpeciesPhotoGallery({ selected: otter, mine, publicSources }).map((item) => `${item.source}:${item.url}`),
    [
      'mine:https://example.test/my-otter.jpg',
      'mine:https://example.test/my-second.jpg',
      'community:https://example.test/public-1.jpg',
    ]
  );
});
