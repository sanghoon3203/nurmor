import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import {
  analyzeObservation,
  createObservation,
  getAnalysisJob,
  getCodexEntries,
  getHabitatCellReport,
  getMapDiscoveries,
  getNearbyHabitatCells,
  getRecentObservations,
  getUserFootprints,
  getUserProfile,
  getUserStats,
  plantObservation,
  registerMediaAsset,
} from './api';

const originalFetch = global.fetch;
const originalApiBaseUrl = process.env.EXPO_PUBLIC_ATLAS_API_BASE_URL;

beforeEach(() => {
  process.env.EXPO_PUBLIC_ATLAS_API_BASE_URL = 'http://atlas.test';
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalApiBaseUrl === undefined) {
    delete process.env.EXPO_PUBLIC_ATLAS_API_BASE_URL;
  } else {
    process.env.EXPO_PUBLIC_ATLAS_API_BASE_URL = originalApiBaseUrl;
  }
});

test('registerMediaAsset posts Firebase Storage metadata with bearer auth', async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  global.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    return jsonResponse({ id: 'media-1', type: 'PHOTO', storageKey: 'firebase://bucket/path.jpg', mimeType: 'image/jpeg' });
  };

  await registerMediaAsset('token-123', {
    type: 'PHOTO',
    storageKey: 'firebase://bucket/path.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 42,
    checksum: 'abcd1234',
  });

  assert.equal(requests[0].url, 'http://atlas.test/api/media/register');
  assert.equal(requests[0].init?.method, 'POST');
  assert.deepEqual(requests[0].init?.headers, {
    Accept: 'application/json',
    Authorization: 'Bearer token-123',
    'Content-Type': 'application/json',
  });
  assert.deepEqual(JSON.parse(String(requests[0].init?.body)), {
    type: 'PHOTO',
    storageKey: 'firebase://bucket/path.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 42,
    checksum: 'abcd1234',
  });
});

test('createObservation posts media ids and exact private coordinates', async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  global.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    return jsonResponse({ id: 'obs-1', habitatCellId: 'cell-1', status: 'CAPTURED', publicLat: 37.5, publicLng: 127 });
  };

  await createObservation('token-123', {
    mediaAssetIds: ['media-1'],
    latitude: 37.5665,
    longitude: 126.978,
    locationAccuracyMeters: 12,
    locationName: '서울특별시 중구 명동',
    capturedAt: '2026-05-21T02:00:00.000Z',
  });

  assert.equal(requests[0].url, 'http://atlas.test/api/observations');
  assert.equal(requests[0].init?.method, 'POST');
  assert.deepEqual(JSON.parse(String(requests[0].init?.body)), {
    mediaAssetIds: ['media-1'],
    latitude: 37.5665,
    longitude: 126.978,
    locationAccuracyMeters: 12,
    locationName: '서울특별시 중구 명동',
    capturedAt: '2026-05-21T02:00:00.000Z',
  });
});

test('analysis, plant, and codex clients call the backend contract paths', async () => {
  const paths: string[] = [];
  global.fetch = async (url, init) => {
    paths.push(`${init?.method ?? 'GET'} ${String(url).replace('http://atlas.test', '')}`);
    if (String(url).includes('/codex')) {
      return jsonResponse([]);
    }
    if (String(url).includes('/plant')) {
      return jsonResponse({ id: 'cell-1', cellKey: 'c', centerLat: 0, centerLng: 0, bloomState: 'SEEDED', bloomScore: 20, observationCount: 1, speciesCount: 1, contributorCount: 1 });
    }
    return jsonResponse({ jobId: 'job-1', observationRecordId: 'obs-1', model: 'gemini-3.1-flash-lite', status: 'SUCCEEDED', candidates: [] });
  };

  await analyzeObservation('token-123', 'obs-1');
  await getAnalysisJob('token-123', 'job-1');
  await plantObservation('token-123', 'obs-1', { speciesCandidateId: 'candidate-1', visibility: 'PRIVATE' });
  await getCodexEntries('token-123', 'cell-1');

  assert.deepEqual(paths, [
    'POST /api/observations/obs-1/analyze',
    'GET /api/analysis-jobs/job-1',
    'POST /api/observations/obs-1/plant',
    'GET /api/habitat-cells/cell-1/codex',
  ]);
});

test('getNearbyHabitatCells serializes location and radius query parameters', async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  global.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    return jsonResponse([]);
  };

  await getNearbyHabitatCells('token-123', {
    latitude: 37.5665,
    longitude: 126.978,
    radiusKm: 5,
  });

  assert.equal(requests[0].url, 'http://atlas.test/api/habitat-cells/nearby?lat=37.5665&lng=126.978&radiusKm=5');
  assert.deepEqual(requests[0].init?.headers, {
    Accept: 'application/json',
    Authorization: 'Bearer token-123',
  });
});

test('map discovery and habitat report clients call Java API contracts', async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  global.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    if (String(url).includes('/report')) {
      return jsonResponse({ habitatCellId: 'cell-1', featuredSpecies: [] });
    }
    return jsonResponse([]);
  };

  await getMapDiscoveries('token-123', {
    latitude: 37.5665,
    longitude: 126.978,
    radiusKm: 5,
  });
  await getHabitatCellReport('token-123', 'cell-1');

  assert.equal(requests[0].url, 'http://atlas.test/api/map/discoveries?lat=37.5665&lng=126.978&radiusKm=5');
  assert.equal(requests[1].url, 'http://atlas.test/api/habitat-cells/cell-1/report');
  assert.deepEqual(requests[0].init?.headers, {
    Accept: 'application/json',
    Authorization: 'Bearer token-123',
  });
});

test('profile clients call Java API contracts for unified profile data', async () => {
  const paths: string[] = [];
  global.fetch = async (url, init) => {
    paths.push(`${init?.method ?? 'GET'} ${String(url).replace('http://atlas.test', '')}`);
    if (String(url).includes('/stats')) {
      return jsonResponse({ reportCount: 1, discoveredSpeciesCount: 1, plantedObservationCount: 1, achievementCount: 1 });
    }
    if (String(url).includes('/recent-observations') || String(url).includes('/footprints')) {
      return jsonResponse([]);
    }
    return jsonResponse({ userId: 'user-1', displayName: 'Atlas 탐험가', publicContributor: false });
  };

  await getUserProfile('token-123');
  await getUserStats('token-123');
  await getRecentObservations('token-123');
  await getUserFootprints('token-123');

  assert.deepEqual(paths, [
    'GET /api/me',
    'GET /api/me/stats',
    'GET /api/me/recent-observations',
    'GET /api/me/footprints',
  ]);
});

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}
