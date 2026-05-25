import { CodexCategory } from '../../services/firebaseAtlasDb';

export type CodexFamily = 'ALL' | 'PLANT' | 'ANIMAL' | 'BIRD' | 'FISH' | 'INSECT' | 'OTHER';
export type CodexIllustration = Exclude<CodexFamily, 'ALL'>;
export type CodexIcon = 'leaf' | 'paw' | 'bird' | 'fish' | 'bug' | 'question';

export type CodexFilterOption = {
  value: CodexFamily;
  label: string;
  icon: CodexIcon;
};

export type CodexFamilyInput = {
  category?: string | null;
  displayGroup?: string | null;
  title: string;
  scientificName?: string | null;
};

export type CodexCardViewModel = {
  id: string;
  displayNumber: string;
  title: string;
  scientificName: string;
  speciesKey?: string | null;
  category: Exclude<CodexFamily, 'ALL'>;
  categoryLabel: string;
  categoryIcon: CodexIcon;
  illustration: CodexIllustration;
  date: string;
  place: string;
  imageUrl?: string | null;
  isLatest?: boolean;
};

export const codexFilters: CodexFilterOption[] = [
  { value: 'ALL', label: '전체', icon: 'leaf' },
  { value: 'PLANT', label: '식물', icon: 'leaf' },
  { value: 'ANIMAL', label: '동물', icon: 'paw' },
  { value: 'BIRD', label: '조류', icon: 'bird' },
  { value: 'FISH', label: '어류', icon: 'fish' },
  { value: 'INSECT', label: '곤충', icon: 'bug' },
  { value: 'OTHER', label: '기타', icon: 'question' },
];

const familyLabels: Record<Exclude<CodexFamily, 'ALL'>, string> = {
  PLANT: '식물',
  ANIMAL: '동물',
  BIRD: '조류',
  FISH: '어류',
  INSECT: '곤충',
  OTHER: '기타',
};

const familyIcons: Record<Exclude<CodexFamily, 'ALL'>, CodexIcon> = {
  PLANT: 'leaf',
  ANIMAL: 'paw',
  BIRD: 'bird',
  FISH: 'fish',
  INSECT: 'bug',
  OTHER: 'question',
};

const birdPattern = /새|조류|참새|직박구리|까치|비둘기|bird|sparrow|passer|hypsipetes|pigeon|magpie/i;
const fishPattern = /어류|물고기|생선|붕어|잉어|송사리|메기|미꾸라지|농어|참돔|fish|carp|minnow|catfish|bass|pseudorasbora|cyprinus/i;
const insectPattern =
  /곤충|벌레|나비|나방|풍뎅이|장수풍뎅이|사슴벌레|무당벌레|잠자리|벌|개미|메뚜기|insect|bug|beetle|butterfly|moth|dragonfly|ladybug|ant|allomyrina|lucanus/i;

export function inferCodexFamily(entry: CodexFamilyInput): Exclude<CodexFamily, 'ALL'> {
  const source = `${entry.title} ${entry.scientificName ?? ''}`.trim();
  const category = normalizeBackendCategory(entry.category);
  const displayGroup = normalizeDisplayGroup(entry.displayGroup);

  if (displayGroup === 'PLANT' || category === 'PLANT') {
    return 'PLANT';
  }
  if (displayGroup === 'BIRD' || birdPattern.test(source)) {
    return 'BIRD';
  }
  if (displayGroup === 'FISH' || fishPattern.test(source)) {
    return 'FISH';
  }
  if (displayGroup === 'INSECT' || insectPattern.test(source)) {
    return 'INSECT';
  }
  if (displayGroup === 'ANIMAL' || displayGroup === 'MAMMAL' || displayGroup === 'AMPHIBIAN' || displayGroup === 'REPTILE') {
    return 'ANIMAL';
  }
  if (category === 'ANIMAL') {
    return 'ANIMAL';
  }
  return 'OTHER';
}

export function filterCodexCards(cards: CodexCardViewModel[], filter: CodexFamily) {
  if (filter === 'ALL') {
    return cards;
  }
  return cards.filter((card) => card.category === filter);
}

export function remoteCategoryForFilter(filter: CodexFamily): CodexCategory | undefined {
  if (filter === 'PLANT' || filter === 'ANIMAL' || filter === 'OTHER') {
    return filter;
  }
  return undefined;
}

export function toDisplayNumber(index: number) {
  return `No.${String(index + 1).padStart(3, '0')}`;
}

export function codexFamilyLabel(family: Exclude<CodexFamily, 'ALL'>) {
  return familyLabels[family];
}

export function codexFamilyIcon(family: Exclude<CodexFamily, 'ALL'>) {
  return familyIcons[family];
}

export function normalizeBackendCategory(category?: string | null): CodexCategory | 'UNKNOWN' {
  if (category === 'PLANT' || category === 'ANIMAL' || category === 'OTHER') {
    return category;
  }
  return 'UNKNOWN';
}

function normalizeDisplayGroup(displayGroup?: string | null) {
  if (
    displayGroup === 'PLANT' ||
    displayGroup === 'ANIMAL' ||
    displayGroup === 'BIRD' ||
    displayGroup === 'FISH' ||
    displayGroup === 'INSECT' ||
    displayGroup === 'AMPHIBIAN' ||
    displayGroup === 'REPTILE' ||
    displayGroup === 'MAMMAL' ||
    displayGroup === 'FUNGI' ||
    displayGroup === 'OTHER'
  ) {
    return displayGroup;
  }
  return 'UNKNOWN';
}
