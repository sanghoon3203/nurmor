export type SpeciesReference = {
  id: string;
  title: string;
  scientificName?: string | null;
  speciesKey?: string | null;
  imageUrl?: string | null;
};

export type SpeciesPhotoSource = SpeciesReference;

export type SpeciesPhoto = {
  id: string;
  url: string;
  source: 'mine' | 'community';
};

export function isSameSpecies(reference: SpeciesReference, candidate: SpeciesReference) {
  const referenceScientificName = normalizeIdentifier(reference.scientificName);
  const candidateScientificName = normalizeIdentifier(candidate.scientificName);
  if (referenceScientificName && candidateScientificName) {
    return referenceScientificName === candidateScientificName;
  }

  const referenceSpeciesKey = normalizeIdentifier(reference.speciesKey);
  const candidateSpeciesKey = normalizeIdentifier(candidate.speciesKey);
  if (referenceSpeciesKey && candidateSpeciesKey && referenceSpeciesKey !== 'unknown' && candidateSpeciesKey !== 'unknown') {
    return referenceSpeciesKey === candidateSpeciesKey;
  }

  return normalizeDisplayName(reference.title) === normalizeDisplayName(candidate.title);
}

export function buildSpeciesPhotoGallery({
  selected,
  mine,
  publicSources,
}: {
  selected: SpeciesReference;
  mine: SpeciesPhotoSource[];
  publicSources: SpeciesPhotoSource[];
}) {
  const seen = new Set<string>();
  const gallery: SpeciesPhoto[] = [];

  function add(source: SpeciesPhotoSource, sourceType: SpeciesPhoto['source']) {
    if (!source.imageUrl || !isSameSpecies(selected, source) || seen.has(source.imageUrl)) {
      return;
    }
    seen.add(source.imageUrl);
    gallery.push({
      id: source.id,
      url: source.imageUrl,
      source: sourceType,
    });
  }

  add(selected, 'mine');
  mine.forEach((source) => add(source, 'mine'));
  publicSources.forEach((source) => add(source, 'community'));

  return gallery;
}

export function buildSpeciesShareSummary(reference: SpeciesReference) {
  const scientificName = reference.scientificName ? `\n학명: ${reference.scientificName}` : '';
  return `Atlas 도감 기록\n${reference.title}${scientificName}`;
}

function normalizeIdentifier(value?: string | null) {
  return value?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';
}

function normalizeDisplayName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, '')
    .replace(/으로추정$/, '')
    .replace(/로추정$/, '')
    .replace(/추정$/, '');
}
