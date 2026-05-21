export type AtlasCodexEntry = {
  id: string;
  title: string;
  scientificName: string;
  confidence: number;
  date: string;
  contributor: string;
  tone: 'butterfly' | 'flower' | 'bird';
  isLatest?: boolean;
};

export const discoveryCandidate = {
  commonName: '노랑나비로 추정',
  scientificName: 'Pieris rapae',
  confidence: 87,
  evidence: ['날개 색과 무늬 패턴 일치', '계절적 출현 시기와 서식지 일치', '지역 내 기존 기록과 유사'],
};

export const codexEntries: AtlasCodexEntry[] = [
  {
    id: 'pieris-rapae',
    title: '노랑나비로 추정',
    scientificName: 'Pieris rapae',
    confidence: 87,
    date: '2026.05.21',
    contributor: '김상훈',
    tone: 'butterfly',
    isLatest: true,
  },
  {
    id: 'daisy',
    title: '개망초',
    scientificName: 'Erigeron annuus',
    confidence: 92,
    date: '2026.05.18',
    contributor: '김성완',
    tone: 'flower',
  },
  {
    id: 'sparrow',
    title: '직박구리',
    scientificName: 'Hypsipetes amaurotis',
    confidence: 90,
    date: '2026.05.18',
    contributor: '지 민',
    tone: 'bird',
  },
];

export const habitatStates = [
  { key: 'UNOBSERVED', title: '비어 있음', body: '기록 없음' },
  { key: 'VISITED', title: '방문함', body: '방문한 셀' },
  { key: 'SEEDED', title: '씨앗', body: '첫 기록이 심어진 셀' },
  { key: 'GROWING', title: '자라는 중', body: '여러 기록으로 개화 준비 중' },
  { key: 'BLOOMED', title: '피어남', body: '다양한 생명으로 풍성해진 셀' },
] as const;
