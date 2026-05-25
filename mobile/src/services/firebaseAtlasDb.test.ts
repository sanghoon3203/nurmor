import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import {
  firestoreFieldsFromData,
  firestoreFieldsToData,
  createFirebaseObservationDraft,
  getOrCreateUserProfile,
  listCodexEntries,
  listNearbyHabitatCells,
  plantFirebaseObservation,
} from './firebaseAtlasDb';

const originalFetch = global.fetch;
const originalProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

beforeEach(() => {
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'atlas-dex';
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalProjectId === undefined) {
    delete process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  } else {
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = originalProjectId;
  }
});

test('firestoreFieldsFromData and firestoreFieldsToData round-trip Atlas data', () => {
  const fields = firestoreFieldsFromData({
    displayName: '노랑나비',
    observationCount: 3,
    bestConfidence: 0.87,
    publicContributor: true,
    tags: ['animal', 'butterfly'],
    missing: null,
  });

  assert.deepEqual(firestoreFieldsToData(fields), {
    displayName: '노랑나비',
    observationCount: 3,
    bestConfidence: 0.87,
    publicContributor: true,
    tags: ['animal', 'butterfly'],
    missing: null,
  });
});

test('listNearbyHabitatCells reads Firestore habitatCells with Firebase bearer auth', async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  global.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    return jsonResponse({
      documents: [
        firestoreDocument('habitatCells/cell-a', {
          cellKey: 'cell-a',
          centerLat: 37.5665,
          centerLng: 126.978,
          bloomState: 'SEEDED',
          bloomScore: 24,
          observationCount: 1,
          speciesCount: 1,
          contributorCount: 1,
        }),
      ],
    });
  };

  const cells = await listNearbyHabitatCells('token-123', {
    latitude: 37.5665,
    longitude: 126.978,
    radiusKm: 5,
  });

  assert.equal(requests[0].url, 'https://firestore.googleapis.com/v1/projects/atlas-dex/databases/(default)/documents/habitatCells?pageSize=100');
  assert.deepEqual(requests[0].init?.headers, {
    Accept: 'application/json',
    Authorization: 'Bearer token-123',
  });
  assert.equal(cells[0].id, 'cell-a');
  assert.equal(cells[0].bloomState, 'SEEDED');
});

test('listCodexEntries filters category client-side for Firebase Spark MVP', async () => {
  global.fetch = async () =>
    jsonResponse({
      documents: [
        firestoreDocument('codexEntries/plant-1', {
          habitatCellId: 'cell-a',
          speciesKey: 'flower',
          displayName: '개망초',
          scientificName: 'Erigeron annuus',
          category: 'PLANT',
          discoveryNumber: 2,
          observationCount: 1,
          bestConfidence: 0.92,
        }),
        firestoreDocument('codexEntries/animal-1', {
          habitatCellId: 'cell-a',
          speciesKey: 'butterfly',
          displayName: '노랑나비',
          scientificName: 'Eurema hecabe',
          category: 'ANIMAL',
          discoveryNumber: 1,
          observationCount: 1,
          bestConfidence: 0.87,
        }),
      ],
    });

  const entries = await listCodexEntries('token-123', 'ANIMAL');

  assert.equal(entries.length, 1);
  assert.equal(entries[0].displayName, '노랑나비');
});

test('getOrCreateUserProfile creates users document after Firestore 404', async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  global.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    if (requests.length === 1) {
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: { message: 'not found' } }),
      } as Response;
    }
    return jsonResponse(
      firestoreDocument('users/user-1', {
        displayName: 'Atlas 탐험가',
        reportCount: 0,
        speciesCount: 0,
        achievementCount: 0,
        publicContributor: false,
      })
    );
  };

  const profile = await getOrCreateUserProfile('token-123', {
    uid: 'user-1',
    email: 'user@example.com',
    displayName: null,
  });

  assert.equal(requests[0].url, 'https://firestore.googleapis.com/v1/projects/atlas-dex/databases/(default)/documents/users/user-1');
  assert.equal(requests[1].init?.method, 'PATCH');
  assert.equal(profile.displayName, 'Atlas 탐험가');
  assert.equal(profile.reportCount, 0);
});

test('createFirebaseObservationDraft writes a private observation with cell metadata', async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  global.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    return echoPatchDocument(String(url), init);
  };

  const draft = await createFirebaseObservationDraft('token-123', {
    userId: 'user-1',
    media: {
      mediaType: 'PHOTO',
      storageKey: 'firebase://atlas-dex.firebasestorage.app/users/user-1/observations/capture.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 128,
      checksum: 'abcd1234',
    },
    latitude: 37.5665,
    longitude: 126.978,
    locationAccuracyMeters: 12,
    capturedAt: '2026-05-22T03:00:00.000Z',
  });

  const body = JSON.parse(String(requests[0].init?.body)) as { fields: ReturnType<typeof firestoreFieldsFromData> };
  const data = firestoreFieldsToData(body.fields);

  assert.match(requests[0].url, /\/documents\/observations\/obs_/);
  assert.equal(requests[0].init?.method, 'PATCH');
  assert.equal(data.userId, 'user-1');
  assert.equal(data.cellKey, 'h:15026:50791');
  assert.equal(data.privateLat, 37.5665);
  assert.equal(data.publicLat, 37.56625);
  assert.equal(draft.observation.habitatCellId, 'h:15026:50791');
  assert.equal(draft.analysis.candidates[0].id, `candidate_${draft.observation.id}`);
  assert.equal(draft.analysis.model, 'Firebase-only MVP');
});

test('plantFirebaseObservation writes codex, community, cell aggregate, and profile stats', async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  global.fetch = async (url, init) => {
    const request = { url: String(url), init };
    requests.push(request);

    if (!init?.method && request.url.includes('/documents/habitatCells/')) {
      return jsonResponse(
        firestoreDocument('habitatCells/h%3A15026%3A50791', {
          cellKey: 'h:15026:50791',
          centerLat: 37.56625,
          centerLng: 126.97875,
          bloomState: 'SEEDED',
          bloomScore: 24,
          observationCount: 1,
          speciesCount: 1,
          contributorCount: 1,
        })
      );
    }

    if (!init?.method && request.url.includes('/documents/users/user-1')) {
      return jsonResponse(
        firestoreDocument('users/user-1', {
          uid: 'user-1',
          displayName: '김상훈',
          reportCount: 1,
          speciesCount: 1,
          achievementCount: 0,
          publicContributor: true,
        })
      );
    }

    if (!init?.method) {
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: { message: 'not found' } }),
      } as Response;
    }

    return echoPatchDocument(request.url, init);
  };

  const result = await plantFirebaseObservation('token-123', {
    userId: 'user-1',
    observation: {
      id: 'obs-1',
      habitatCellId: 'h:15026:50791',
      status: 'READY_FOR_REVIEW',
      publicLat: 37.56625,
      publicLng: 126.97875,
      locationName: '서울특별시 중구 명동',
    },
    candidate: {
      id: 'candidate-1',
      commonNameKo: '노랑나비',
      scientificName: 'Eurema hecabe',
      category: 'ANIMAL',
      displayGroup: 'INSECT',
      confidence: 0.87,
      evidence: '날개 색과 무늬 패턴 일치',
    },
    visibility: 'PUBLIC',
  });

  assert.equal(result.plantedCell.id, 'h:15026:50791');
  assert.equal(result.plantedCell.observationCount, 2);
  assert.equal(result.codexEntries[0].displayName, '노랑나비');
  assert.equal(result.codexEntries[0].displayGroup, 'INSECT');
  assert.equal(result.codexEntries[0].regionName, '서울특별시 중구 명동');
  assert.ok(requests.some((request) => request.url.includes('/documents/observations/obs-1?updateMask.fieldPaths=status')));
  assert.ok(requests.some((request) => request.url.includes('/documents/codexEntries/codex_')));
  assert.ok(requests.some((request) => request.url.includes('/documents/communityDiscoveries/obs-1')));
  assert.ok(requests.some((request) => request.url.includes('/documents/habitatCells/h%3A15026%3A50791')));
  assert.ok(requests.some((request) => request.url.includes('/documents/users/user-1')));
  assert.ok(
    requests.some((request) => {
      if (!request.url.includes('/documents/codexEntries/codex_')) {
        return false;
      }
      const fields = JSON.parse(String(request.init?.body ?? '{}')).fields;
      return firestoreFieldsToData(fields).displayGroup === 'INSECT';
    })
  );
  assert.ok(
    requests.some((request) => {
      if (!request.url.includes('/documents/communityDiscoveries/obs-1')) {
        return false;
      }
      const fields = JSON.parse(String(request.init?.body ?? '{}')).fields;
      return firestoreFieldsToData(fields).displayGroup === 'INSECT';
    })
  );
});

function firestoreDocument(path: string, data: Record<string, unknown>) {
  return {
    name: `projects/atlas-dex/databases/(default)/documents/${path}`,
    fields: firestoreFieldsFromData(data),
  };
}

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

function echoPatchDocument(url: string, init?: RequestInit): Response {
  const body = JSON.parse(String(init?.body ?? '{}')) as { fields?: ReturnType<typeof firestoreFieldsFromData> };
  return jsonResponse({
    name: `projects/atlas-dex/databases/(default)/documents/${documentPathFromUrl(url)}`,
    fields: body.fields ?? {},
  });
}

function documentPathFromUrl(url: string): string {
  const [, pathWithQuery = 'unknown/document'] = url.split('/documents/');
  return pathWithQuery.split('?')[0];
}
