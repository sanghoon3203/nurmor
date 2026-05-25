import { CodexEntryResponse, SpeciesDisplayGroup } from '../../services/api';
import { FirebaseCodexEntry } from '../../services/firebaseAtlasDb';
import { SpeciesCard } from '../../types/species';
import { inferCodexFamily } from './codexViewModel';

type SpeciesCardOptions = {
  description?: string;
  regionName?: string;
  imageBaseUrl?: string;
};

export function toSpeciesCard(entry: CodexEntryResponse, options: SpeciesCardOptions = {}): SpeciesCard {
  const displayGroup = entry.displayGroup ?? displayGroupFromEntry(entry);
  const description = options.description ?? getDefaultDescription(displayGroup, entry.displayName);
  const imageBaseUrl = options.imageBaseUrl ?? '';
  return {
    codexEntryId: entry.id,
    habitatCellId: entry.habitatCellId,
    codexNumber: entry.discoveryNumber ?? 0,
    displayName: entry.displayName,
    scientificName: entry.scientificName ?? null,
    displayGroup,
    description,
    imageUrl: mediaUrl(entry.representativeMediaKey, imageBaseUrl),
    regionName: options.regionName ?? entry.regionName ?? '미확인 지역',
    observationCount: entry.observationCount,
    firstObservedAt: entry.firstObservedAt ?? null,
    lastObservedAt: entry.lastObservedAt ?? null,
  };
}

export function firebaseCodexToSpeciesCard(entry: FirebaseCodexEntry): SpeciesCard {
  return {
    codexEntryId: entry.id,
    habitatCellId: entry.habitatCellId,
    codexNumber: entry.discoveryNumber,
    displayName: entry.displayName,
    scientificName: entry.scientificName,
    displayGroup: displayGroupFromEntry({
      category: entry.category,
      displayGroup: entry.displayGroup,
      displayName: entry.displayName,
      scientificName: entry.scientificName,
    }),
    description: getDefaultDescription(undefined, entry.displayName),
    imageUrl: entry.imageUrl,
    regionName: entry.regionName,
    observationCount: entry.observationCount,
    firstObservedAt: entry.createdAt,
    lastObservedAt: entry.createdAt,
  };
}

export function sampleCodexToSpeciesCard(entry: {
  id: string;
  title: string;
  scientificName: string;
  category: string;
  date: string;
  place: string;
}, index: number): SpeciesCard {
  const displayGroup = displayGroupFromEntry({
    category: entry.category,
    displayName: entry.title,
    scientificName: entry.scientificName,
  });
  return {
    codexEntryId: entry.id,
    habitatCellId: `sample-${index + 1}`,
    codexNumber: index + 1,
    displayName: entry.title,
    scientificName: entry.scientificName,
    displayGroup,
    description: getDefaultDescription(displayGroup, entry.title),
    imageUrl: null,
    regionName: entry.place,
    observationCount: 1,
    firstObservedAt: entry.date,
    lastObservedAt: entry.date,
  };
}

export function displayGroupFromEntry(entry: {
  category?: string | null;
  displayGroup?: SpeciesDisplayGroup | null;
  displayName: string;
  scientificName?: string | null;
}): SpeciesDisplayGroup {
  if (entry.displayGroup) {
    return entry.displayGroup;
  }
  const family = inferCodexFamily({
    category: entry.category,
    displayGroup: entry.displayGroup,
    title: entry.displayName,
    scientificName: entry.scientificName,
  });
  if (family === 'FISH') return 'FISH';
  if (family === 'INSECT') return 'INSECT';
  if (family === 'PLANT') return 'PLANT';
  if (family === 'ANIMAL') return 'ANIMAL';
  return 'OTHER';
}

export function getDefaultDescription(group: SpeciesDisplayGroup | undefined, name: string): string {
  const map: Partial<Record<SpeciesDisplayGroup, string>> = {
    MAMMAL: '포유류 동물로, 주변 환경에 잘 적응하여 서식하고 있습니다.',
    BIRD: '조류로, 해당 지역에서 관찰된 대표적인 종입니다.',
    FISH: '수생 생물로, 수질 환경에 민감하게 반응합니다.',
    PLANT: '해당 지역에서 자생하는 식물 종입니다.',
    INSECT: '곤충류로, 생태계의 중요한 구성원입니다.',
    REPTILE: '파충류로, 특정 서식지에서 관찰되었습니다.',
    AMPHIBIAN: '양서류로, 습한 환경을 선호합니다.',
    FUNGI: '균류로, 생태계 물질 순환에 기여합니다.',
    ANIMAL: '동물로, 지역 생태 흐름을 보여주는 기록입니다.',
    OTHER: '추가 확인이 필요한 생태 기록입니다.',
  };
  return map[group ?? 'OTHER'] ?? `${name}은 해당 지역에서 관찰된 생물입니다.`;
}

function mediaUrl(key?: string | null, imageBaseUrl = '') {
  if (!key) {
    return null;
  }
  if (/^https?:\/\//.test(key)) {
    return key;
  }
  if (!imageBaseUrl) {
    return key;
  }
  return `${imageBaseUrl.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}
