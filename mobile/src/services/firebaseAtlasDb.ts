import { getPublicEnv } from '../config/env';
import { AnalysisCandidateResponse, AnalysisResponse, CodexEntryResponse, HabitatCell, ObservationResponse } from './api';
import { AtlasMediaType } from './firebaseStorageRest';

type FirestoreValue =
  | { nullValue: null }
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

type FirestoreListResponse = {
  documents?: FirestoreDocument[];
};

export type CodexCategory = 'PLANT' | 'ANIMAL' | 'OTHER';

export type FirebaseCodexEntry = {
  id: string;
  userId: string;
  habitatCellId: string;
  speciesKey: string;
  displayName: string;
  scientificName: string | null;
  category: CodexCategory;
  imageUrl: string | null;
  discoveryNumber: number;
  observationCount: number;
  bestConfidence: number;
  createdAt: string | null;
};

export type FirebaseUserProfile = {
  id: string;
  uid: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  reportCount: number;
  speciesCount: number;
  achievementCount: number;
  publicContributor: boolean;
};

export type FirebaseCommunityDiscovery = {
  id: string;
  observationId: string;
  cellKey: string;
  userId: string;
  contributorName: string;
  displayName: string;
  scientificName: string | null;
  category: CodexCategory;
  imageUrl: string | null;
  publicLat: number;
  publicLng: number;
  likeCount: number;
  commentCount: number;
  createdAt: string | null;
  distanceKm: number;
};

export type NearbyQuery = {
  latitude: number;
  longitude: number;
  radiusKm?: number;
};

export type FirebaseUserIdentity = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
};

export type FirebaseObservationMediaInput = {
  mediaType: AtlasMediaType;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
};

export type CreateFirebaseObservationDraftInput = {
  userId: string;
  media: FirebaseObservationMediaInput;
  latitude: number;
  longitude: number;
  locationAccuracyMeters: number;
  capturedAt: string;
};

export type FirebaseObservationDraft = {
  observation: ObservationResponse;
  analysis: AnalysisResponse;
};

export type PlantFirebaseObservationInput = {
  userId: string;
  observation: ObservationResponse;
  candidate: AnalysisCandidateResponse;
  visibility: 'PRIVATE' | 'CELL' | 'PUBLIC';
};

export type PlantFirebaseObservationResult = {
  plantedCell: HabitatCell;
  codexEntries: CodexEntryResponse[];
};

type CellResolution = {
  cellKey: string;
  centerLat: number;
  centerLng: number;
};

const firestoreBaseUrl = 'https://firestore.googleapis.com/v1';
const cellSizeDegrees = 0.0025;

export function firestoreFieldsFromData(data: Record<string, unknown>): Record<string, FirestoreValue> {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, firestoreValueFromData(value)]));
}

export function firestoreFieldsToData(fields: Record<string, FirestoreValue> = {}): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, dataFromFirestoreValue(value)]));
}

export async function listNearbyHabitatCells(idToken: string, query: NearbyQuery): Promise<HabitatCell[]> {
  const radiusKm = query.radiusKm ?? 5;
  const response = await listCollection(idToken, 'habitatCells', 100);
  return (response.documents ?? [])
    .map((document) => {
      const data = documentData(document);
      return {
        id: documentId(document.name),
        cellKey: stringField(data, 'cellKey', documentId(document.name)),
        centerLat: numberField(data, 'centerLat', 0),
        centerLng: numberField(data, 'centerLng', 0),
        bloomState: stringField(data, 'bloomState', 'UNOBSERVED'),
        bloomScore: numberField(data, 'bloomScore', 0),
        observationCount: numberField(data, 'observationCount', 0),
        speciesCount: numberField(data, 'speciesCount', 0),
        contributorCount: numberField(data, 'contributorCount', 0),
      } satisfies HabitatCell;
    })
    .filter((cell) => distanceKm(query.latitude, query.longitude, cell.centerLat, cell.centerLng) <= radiusKm);
}

export async function listCodexEntries(idToken: string, category?: CodexCategory): Promise<FirebaseCodexEntry[]> {
  const response = await listCollection(idToken, 'codexEntries', 100);
  return (response.documents ?? [])
    .map(toCodexEntry)
    .filter((entry) => (category ? entry.category === category : true))
    .sort((left, right) => right.discoveryNumber - left.discoveryNumber);
}

export async function listCommunityDiscoveries(idToken: string, query: NearbyQuery): Promise<FirebaseCommunityDiscovery[]> {
  const radiusKm = query.radiusKm ?? 5;
  const response = await listCollection(idToken, 'communityDiscoveries', 100);
  return (response.documents ?? [])
    .map((document) => toCommunityDiscovery(document, query.latitude, query.longitude))
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((left, right) => (right.createdAt ?? '').localeCompare(left.createdAt ?? ''));
}

export async function createFirebaseObservationDraft(
  idToken: string,
  input: CreateFirebaseObservationDraftInput
): Promise<FirebaseObservationDraft> {
  const now = new Date().toISOString();
  const cell = resolveCell(input.latitude, input.longitude);
  const observationId = stableDocumentId('obs', [input.userId, input.capturedAt, input.media.checksum]);

  await patchDocument(idToken, documentPath('observations', observationId), {
    userId: input.userId,
    cellKey: cell.cellKey,
    mediaStorageKey: input.media.storageKey,
    mediaType: input.media.mediaType,
    mediaMimeType: input.media.mimeType,
    mediaSizeBytes: input.media.sizeBytes,
    mediaChecksum: input.media.checksum,
    privateLat: input.latitude,
    privateLng: input.longitude,
    publicLat: cell.centerLat,
    publicLng: cell.centerLng,
    locationAccuracyMeters: input.locationAccuracyMeters,
    visibility: 'PRIVATE',
    analysisStatus: 'READY_FOR_REVIEW',
    status: 'READY_FOR_REVIEW',
    capturedAt: input.capturedAt,
    createdAt: now,
    updatedAt: now,
  });

  const observation: ObservationResponse = {
    id: observationId,
    habitatCellId: cell.cellKey,
    status: 'READY_FOR_REVIEW',
    publicLat: cell.centerLat,
    publicLng: cell.centerLng,
  };

  return {
    observation,
    analysis: localAnalysisForObservation(observation, input.media.mediaType),
  };
}

export async function plantFirebaseObservation(
  idToken: string,
  input: PlantFirebaseObservationInput
): Promise<PlantFirebaseObservationResult> {
  const now = new Date().toISOString();
  const cellKey = input.observation.habitatCellId;
  const speciesKey = speciesKeyFromCandidate(input.candidate);
  const codexId = stableDocumentId('codex', [cellKey, speciesKey]);
  const category = inferCategoryFromCandidate(input.candidate);
  const confidence = normalizedConfidence(input.candidate.confidence);

  const [cellDocument, codexDocument, profileDocument] = await Promise.all([
    tryGetDocument(idToken, documentPath('habitatCells', cellKey)),
    tryGetDocument(idToken, documentPath('codexEntries', codexId)),
    tryGetDocument(idToken, documentPath('users', input.userId)),
  ]);

  const existingCell = cellDocument ? toHabitatCell(cellDocument) : null;
  const existingCodex = codexDocument ? toCodexEntry(codexDocument) : null;
  const existingProfile = profileDocument ? toUserProfile(profileDocument, input.userId) : null;
  const isNewSpecies = !existingCodex;
  const plantedCell = nextPlantedCell({
    cellKey,
    publicLat: input.observation.publicLat,
    publicLng: input.observation.publicLng,
    existingCell,
    isNewSpecies,
  });

  await patchDocument(
    idToken,
    documentPath('observations', input.observation.id),
    {
      status: 'PLANTED',
      analysisStatus: 'SUCCEEDED',
      visibility: input.visibility,
      selectedCandidateId: input.candidate.id,
      selectedSpeciesKey: speciesKey,
      selectedDisplayName: input.candidate.commonNameKo,
      updatedAt: now,
    },
    {
      updateMask: [
        'status',
        'analysisStatus',
        'visibility',
        'selectedCandidateId',
        'selectedSpeciesKey',
        'selectedDisplayName',
        'updatedAt',
      ],
    }
  );

  const codexData = {
    userId: input.userId,
    habitatCellId: cellKey,
    cellKey,
    speciesKey,
    displayName: input.candidate.commonNameKo,
    scientificName: input.candidate.scientificName,
    category,
    // Media upload is stored on the observation draft today. Wire that Storage URL here
    // before expecting the codex detail gallery to show real captured photos.
    imageUrl: null,
    discoveryNumber: existingCodex?.discoveryNumber ?? Date.now(),
    observationCount: (existingCodex?.observationCount ?? 0) + 1,
    bestConfidence: Math.max(existingCodex?.bestConfidence ?? 0, confidence),
    createdAt: existingCodex?.createdAt ?? now,
    updatedAt: now,
  };
  const codexEntryDocument = await patchDocument(idToken, documentPath('codexEntries', codexId), codexData);

  if (input.visibility !== 'PRIVATE') {
    await patchDocument(idToken, documentPath('communityDiscoveries', input.observation.id), {
      observationId: input.observation.id,
      cellKey,
      userId: input.userId,
      contributorName: existingProfile?.publicContributor ? existingProfile.displayName : '익명 관찰자',
      displayName: input.candidate.commonNameKo,
      scientificName: input.candidate.scientificName,
      category,
      // Public same-species galleries read this field. It remains null until the
      // planted observation carries a shareable Storage image URL.
      imageUrl: null,
      publicLat: input.observation.publicLat,
      publicLng: input.observation.publicLng,
      likeCount: 0,
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  await patchDocument(idToken, documentPath('habitatCells', cellKey), {
    cellKey,
    centerLat: plantedCell.centerLat,
    centerLng: plantedCell.centerLng,
    bloomState: plantedCell.bloomState,
    bloomScore: plantedCell.bloomScore,
    observationCount: plantedCell.observationCount,
    speciesCount: plantedCell.speciesCount,
    contributorCount: plantedCell.contributorCount,
    updatedAt: now,
  });

  await patchDocument(idToken, documentPath('users', input.userId), nextProfileStats(existingProfile, input.userId, isNewSpecies, now));

  return {
    plantedCell,
    codexEntries: [toCodexEntryResponse(codexEntryDocument)],
  };
}

export async function getOrCreateUserProfile(idToken: string, user: FirebaseUserIdentity): Promise<FirebaseUserProfile> {
  try {
    return toUserProfile(await getDocument(idToken, documentPath('users', user.uid)), user.uid);
  } catch (error) {
    if (!(error instanceof FirestoreRestError) || error.status !== 404) {
      throw error;
    }
  }

  const now = new Date().toISOString();
  const displayName = user.displayName?.trim() || 'Atlas 탐험가';
  const created = await patchDocument(idToken, documentPath('users', user.uid), {
    uid: user.uid,
    email: user.email ?? null,
    displayName,
    avatarUrl: null,
    reportCount: 0,
    speciesCount: 0,
    achievementCount: 0,
    publicContributor: false,
    createdAt: now,
    updatedAt: now,
  });
  return toUserProfile(created, user.uid);
}

async function listCollection(idToken: string, collectionPath: string, pageSize: number): Promise<FirestoreListResponse> {
  return firestoreRequest<FirestoreListResponse>(idToken, `${collectionPath}?pageSize=${pageSize}`);
}

async function getDocument(idToken: string, documentPath: string): Promise<FirestoreDocument> {
  return firestoreRequest<FirestoreDocument>(idToken, documentPath);
}

async function tryGetDocument(idToken: string, path: string): Promise<FirestoreDocument | null> {
  try {
    return await getDocument(idToken, path);
  } catch (error) {
    if (error instanceof FirestoreRestError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function patchDocument(
  idToken: string,
  path: string,
  data: Record<string, unknown>,
  options?: { updateMask?: string[] }
): Promise<FirestoreDocument> {
  const updateMask = options?.updateMask?.length
    ? `?${new URLSearchParams(options.updateMask.map((field) => ['updateMask.fieldPaths', field])).toString()}`
    : '';
  return firestoreRequest<FirestoreDocument>(idToken, `${path}${updateMask}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: firestoreFieldsFromData(data) }),
  });
}

async function firestoreRequest<T>(idToken: string, path: string, init?: RequestInit): Promise<T> {
  const env = getPublicEnv();
  if (!env.firebaseProjectId) {
    throw new Error('Missing mobile env: EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  }

  const response = await fetch(`${firestoreBaseUrl}/projects/${env.firebaseProjectId}/databases/(default)/documents/${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new FirestoreRestError(`Firestore request failed: ${path}`, response.status);
  }

  return (await response.json()) as T;
}

class FirestoreRestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function firestoreValueFromData(value: unknown): FirestoreValue {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === 'string') {
    return looksLikeTimestamp(value) ? { timestampValue: value } : { stringValue: value };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(firestoreValueFromData) } };
  }
  if (typeof value === 'object') {
    return { mapValue: { fields: firestoreFieldsFromData(value as Record<string, unknown>) } };
  }
  return { stringValue: String(value) };
}

function dataFromFirestoreValue(value: FirestoreValue): unknown {
  if ('nullValue' in value) {
    return null;
  }
  if ('stringValue' in value) {
    return value.stringValue;
  }
  if ('booleanValue' in value) {
    return value.booleanValue;
  }
  if ('integerValue' in value) {
    return Number(value.integerValue);
  }
  if ('doubleValue' in value) {
    return value.doubleValue;
  }
  if ('timestampValue' in value) {
    return value.timestampValue;
  }
  if ('arrayValue' in value) {
    return (value.arrayValue.values ?? []).map(dataFromFirestoreValue);
  }
  return firestoreFieldsToData(value.mapValue.fields ?? {});
}

function documentData(document: FirestoreDocument) {
  return firestoreFieldsToData(document.fields ?? {});
}

function documentId(name: string) {
  return decodeURIComponent(name.split('/').pop() ?? name);
}

function toCodexEntry(document: FirestoreDocument): FirebaseCodexEntry {
  const data = documentData(document);
  return {
    id: documentId(document.name),
    userId: stringField(data, 'userId', ''),
    habitatCellId: stringField(data, 'habitatCellId', stringField(data, 'cellKey', '')),
    speciesKey: stringField(data, 'speciesKey', documentId(document.name)),
    displayName: stringField(data, 'displayName', '이름 없는 기록'),
    scientificName: nullableStringField(data, 'scientificName'),
    category: categoryField(data, 'category'),
    imageUrl: nullableStringField(data, 'imageUrl'),
    discoveryNumber: numberField(data, 'discoveryNumber', 0),
    observationCount: numberField(data, 'observationCount', 0),
    bestConfidence: numberField(data, 'bestConfidence', 0),
    createdAt: nullableStringField(data, 'createdAt'),
  };
}

function toCodexEntryResponse(document: FirestoreDocument): CodexEntryResponse {
  const entry = toCodexEntry(document);
  return {
    id: entry.id,
    habitatCellId: entry.habitatCellId,
    speciesKey: entry.speciesKey,
    displayName: entry.displayName,
    scientificName: entry.scientificName,
    category: entry.category,
    observationCount: entry.observationCount,
    bestConfidence: entry.bestConfidence,
  };
}

function toHabitatCell(document: FirestoreDocument): HabitatCell {
  const data = documentData(document);
  return {
    id: documentId(document.name),
    cellKey: stringField(data, 'cellKey', documentId(document.name)),
    centerLat: numberField(data, 'centerLat', 0),
    centerLng: numberField(data, 'centerLng', 0),
    bloomState: stringField(data, 'bloomState', 'UNOBSERVED'),
    bloomScore: numberField(data, 'bloomScore', 0),
    observationCount: numberField(data, 'observationCount', 0),
    speciesCount: numberField(data, 'speciesCount', 0),
    contributorCount: numberField(data, 'contributorCount', 0),
  };
}

function toCommunityDiscovery(document: FirestoreDocument, lat: number, lng: number): FirebaseCommunityDiscovery {
  const data = documentData(document);
  const publicLat = numberField(data, 'publicLat', 0);
  const publicLng = numberField(data, 'publicLng', 0);
  return {
    id: documentId(document.name),
    observationId: stringField(data, 'observationId', documentId(document.name)),
    cellKey: stringField(data, 'cellKey', ''),
    userId: stringField(data, 'userId', ''),
    contributorName: stringField(data, 'contributorName', '익명 관찰자'),
    displayName: stringField(data, 'displayName', '이름 없는 발견'),
    scientificName: nullableStringField(data, 'scientificName'),
    category: categoryField(data, 'category'),
    imageUrl: nullableStringField(data, 'imageUrl'),
    publicLat,
    publicLng,
    likeCount: numberField(data, 'likeCount', 0),
    commentCount: numberField(data, 'commentCount', 0),
    createdAt: nullableStringField(data, 'createdAt'),
    distanceKm: Math.round(distanceKm(lat, lng, publicLat, publicLng) * 10) / 10,
  };
}

function toUserProfile(document: FirestoreDocument, fallbackUid: string): FirebaseUserProfile {
  const data = documentData(document);
  return {
    id: documentId(document.name),
    uid: stringField(data, 'uid', fallbackUid),
    email: nullableStringField(data, 'email'),
    displayName: stringField(data, 'displayName', 'Atlas 탐험가'),
    avatarUrl: nullableStringField(data, 'avatarUrl'),
    reportCount: numberField(data, 'reportCount', 0),
    speciesCount: numberField(data, 'speciesCount', 0),
    achievementCount: numberField(data, 'achievementCount', 0),
    publicContributor: booleanField(data, 'publicContributor', false),
  };
}

function stringField(data: Record<string, unknown>, key: string, fallback: string) {
  const value = data[key];
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function nullableStringField(data: Record<string, unknown>, key: string) {
  const value = data[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function numberField(data: Record<string, unknown>, key: string, fallback: number) {
  const value = data[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function booleanField(data: Record<string, unknown>, key: string, fallback: boolean) {
  const value = data[key];
  return typeof value === 'boolean' ? value : fallback;
}

function categoryField(data: Record<string, unknown>, key: string): CodexCategory {
  const value = data[key];
  return value === 'PLANT' || value === 'ANIMAL' || value === 'OTHER' ? value : 'OTHER';
}

function looksLikeTimestamp(value: string) {
  return /^\d{4}-\d{2}-\d{2}T/.test(value);
}

function localAnalysisForObservation(observation: ObservationResponse, mediaType: AtlasMediaType): AnalysisResponse {
  const label = mediaType === 'AUDIO' ? '소리 기록 후보' : mediaType === 'VIDEO' ? '영상 기록 후보' : '사진 기록 후보';
  return {
    jobId: `local_${observation.id}`,
    observationRecordId: observation.id,
    model: 'Firebase-only MVP',
    status: 'SUCCEEDED',
    candidates: [
      {
        id: `candidate_${observation.id}`,
        commonNameKo: label,
        scientificName: null,
        confidence: 0.5,
        evidence: 'Firebase-only MVP에서는 미디어 업로드와 위치 등록을 먼저 검증합니다.; 실제 생물 판정은 Gemini 서버 재개 후 연결합니다.',
      },
    ],
  };
}

function nextPlantedCell({
  cellKey,
  publicLat,
  publicLng,
  existingCell,
  isNewSpecies,
}: {
  cellKey: string;
  publicLat: number;
  publicLng: number;
  existingCell: HabitatCell | null;
  isNewSpecies: boolean;
}): HabitatCell {
  const observationCount = (existingCell?.observationCount ?? 0) + 1;
  const speciesCount = (existingCell?.speciesCount ?? 0) + (isNewSpecies ? 1 : 0);
  const contributorCount = Math.max(1, (existingCell?.contributorCount ?? 0) + 1);
  const bloomScore = Math.min(100, observationCount * 12 + speciesCount * 18 + contributorCount * 8);
  return {
    id: cellKey,
    cellKey,
    centerLat: existingCell?.centerLat ?? publicLat,
    centerLng: existingCell?.centerLng ?? publicLng,
    bloomState: bloomStateFor(observationCount, speciesCount),
    bloomScore,
    observationCount,
    speciesCount,
    contributorCount,
  };
}

function nextProfileStats(profile: FirebaseUserProfile | null, userId: string, isNewSpecies: boolean, now: string) {
  const speciesCount = (profile?.speciesCount ?? 0) + (isNewSpecies ? 1 : 0);
  return {
    uid: profile?.uid ?? userId,
    email: profile?.email ?? null,
    displayName: profile?.displayName ?? 'Atlas 탐험가',
    avatarUrl: profile?.avatarUrl ?? null,
    reportCount: (profile?.reportCount ?? 0) + 1,
    speciesCount,
    achievementCount: Math.max(profile?.achievementCount ?? 0, speciesCount >= 3 ? 1 : 0),
    publicContributor: profile?.publicContributor ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

function bloomStateFor(observationCount: number, speciesCount: number) {
  if (observationCount <= 0) {
    return 'UNOBSERVED';
  }
  if (observationCount === 1) {
    return 'SEEDED';
  }
  if (observationCount >= 4 || speciesCount >= 3) {
    return 'BLOOMED';
  }
  return 'GROWING';
}

function resolveCell(latitude: number, longitude: number): CellResolution {
  if (latitude < -90 || latitude > 90) {
    throw new Error('latitude must be between -90 and 90');
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error('longitude must be between -180 and 180');
  }

  const latIndex = Math.floor(latitude / cellSizeDegrees);
  const lngIndex = Math.floor(longitude / cellSizeDegrees);
  return {
    cellKey: `h:${latIndex}:${lngIndex}`,
    centerLat: roundCoordinate(latIndex * cellSizeDegrees + cellSizeDegrees / 2),
    centerLng: roundCoordinate(lngIndex * cellSizeDegrees + cellSizeDegrees / 2),
  };
}

function documentPath(collection: string, id: string) {
  return `${collection}/${encodeURIComponent(id)}`;
}

function stableDocumentId(prefix: string, parts: string[]) {
  const seed = parts.join('_');
  const safe = seed
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 120);
  return `${prefix}_${safe || 'document'}`;
}

function speciesKeyFromCandidate(candidate: AnalysisCandidateResponse) {
  return stableDocumentId('species', [candidate.scientificName ?? candidate.commonNameKo]).replace(/^species_/, '');
}

function inferCategoryFromCandidate(candidate: AnalysisCandidateResponse): CodexCategory {
  const source = `${candidate.commonNameKo} ${candidate.scientificName ?? ''}`.toLowerCase();
  if (/꽃|풀|나무|초|plant|erigeron|daisy/.test(source)) {
    return 'PLANT';
  }
  if (/나비|새|조류|동물|곤충|animal|butterfly|pieris|eurema|hypsipetes/.test(source)) {
    return 'ANIMAL';
  }
  return 'OTHER';
}

function normalizedConfidence(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return value > 1 ? Math.min(1, value / 100) : Math.max(0, Math.min(1, value));
}

function roundCoordinate(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function distanceKm(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const earthRadiusKm = 6371;
  const latDistance = radians(toLat - fromLat);
  const lngDistance = radians(toLng - fromLng);
  const startLat = radians(fromLat);
  const endLat = radians(toLat);
  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function radians(value: number) {
  return (value * Math.PI) / 180;
}
