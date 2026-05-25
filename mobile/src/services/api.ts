import { getPublicEnv } from '../config/env';

export type HabitatCell = {
  id: string;
  cellKey: string;
  regionName?: string;
  description?: string;
  centerLat: number;
  centerLng: number;
  bloomState: string;
  bloomScore: number;
  observationCount: number;
  speciesCount: number;
  contributorCount: number;
  habitatTypes?: string[];
  boundaryCoordinates?: Array<{ latitude: number; longitude: number }>;
};

export type HealthResponse = {
  status: string;
};

export type NearbyHabitatCellQuery = {
  latitude: number;
  longitude: number;
  radiusKm?: number;
};

export type RegisterMediaAssetRequest = {
  type: 'PHOTO' | 'VIDEO' | 'AUDIO';
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
};

export type MediaAssetResponse = {
  id: string;
  type: string;
  storageKey: string;
  mimeType: string;
};

export type CreateObservationRequest = {
  mediaAssetIds: string[];
  latitude: number;
  longitude: number;
  locationAccuracyMeters: number;
  locationName?: string;
  capturedAt: string;
};

export type ObservationResponse = {
  id: string;
  habitatCellId: string;
  status: string;
  visibility?: 'PRIVATE' | 'PUBLIC' | string;
  locationName?: string;
  publicLat: number;
  publicLng: number;
  capturedAt?: string;
};

export type AnalysisCandidateResponse = {
  id: string;
  commonNameKo: string;
  scientificName: string | null;
  category: 'PLANT' | 'ANIMAL' | 'OTHER' | string;
  displayGroup: SpeciesDisplayGroup;
  confidence: number;
  evidence: string;
};

export type AnalysisResponse = {
  jobId: string;
  observationRecordId: string;
  model: string;
  status: string;
  candidates: AnalysisCandidateResponse[];
};

export type PlantObservationRequest = {
  speciesCandidateId: string;
  visibility: 'PRIVATE' | 'PUBLIC';
};

export type CodexEntryResponse = {
  id: string;
  habitatCellId: string;
  speciesKey: string;
  displayName: string;
  scientificName?: string | null;
  category?: string;
  displayGroup: SpeciesDisplayGroup;
  regionName?: string;
  representativeMediaKey?: string | null;
  discoveryNumber?: number;
  observationCount: number;
  bestConfidence: number;
  firstObservedAt?: string | null;
  lastObservedAt?: string | null;
};

export type SpeciesDisplayGroup =
  | 'PLANT'
  | 'ANIMAL'
  | 'BIRD'
  | 'FISH'
  | 'INSECT'
  | 'AMPHIBIAN'
  | 'REPTILE'
  | 'MAMMAL'
  | 'FUNGI'
  | 'OTHER';

export type MapDiscoveryResponse = {
  discoveryId: string;
  habitatCellId: string;
  codexNumber: number;
  displayName: string;
  scientificName: string | null;
  displayGroup: SpeciesDisplayGroup;
  confidence: number;
  distanceKm: number;
  publicLat: number;
  publicLng: number;
  capturedAt: string | null;
  contributorName: string;
  imageUrl: string | null;
  regionName: string;
  likeCount: number;
  commentCount: number;
};

export type HabitatCellReportSpecies = {
  codexEntryId: string;
  displayName: string;
  scientificName: string | null;
  displayGroup: SpeciesDisplayGroup;
  description: string;
  imageUrl: string | null;
  observationCount: number;
};

export type HabitatCellReport = {
  habitatCellId: string;
  regionName: string;
  summary: string;
  terrainDescription: string;
  habitatTypes: string[];
  bloomScore: number;
  observationCount: number;
  speciesCount: number;
  featuredSpecies: HabitatCellReportSpecies[];
  representativeImages: Array<{ imageUrl: string; label: string }>;
  recentDiscoveries: MapDiscoveryResponse[];
};

export type UserProfileResponse = {
  userId: string;
  email?: string | null;
  displayName: string;
  avatarUrl?: string | null;
  publicContributor: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UserStatsResponse = {
  reportCount: number;
  discoveredSpeciesCount: number;
  plantedObservationCount: number;
  achievementCount: number;
};

export type RecentObservationResponse = {
  observationId: string;
  habitatCellId: string;
  displayName: string;
  status: string;
  publicLat: number;
  publicLng: number;
  capturedAt: string;
};

export type UserFootprintCell = {
  habitatCellId: string;
  regionName: string;
  centerLat: number;
  centerLng: number;
  reportCount: number;
  intensity: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
  }
}

async function requestJson<T>(path: string, idToken?: string, init?: RequestInit): Promise<T> {
  const env = getPublicEnv();
  const response = await fetch(`${env.atlasApiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(`Atlas API request failed: ${path}`, response.status);
  }

  return (await response.json()) as T;
}

export function getHealth() {
  return requestJson<HealthResponse>('/actuator/health');
}

export function getUserProfile(idToken: string) {
  return requestJson<UserProfileResponse>('/api/me', idToken);
}

export function getUserStats(idToken: string) {
  return requestJson<UserStatsResponse>('/api/me/stats', idToken);
}

export function getRecentObservations(idToken: string) {
  return requestJson<RecentObservationResponse[]>('/api/me/recent-observations', idToken);
}

export function getUserFootprints(idToken: string) {
  return requestJson<UserFootprintCell[]>('/api/me/footprints', idToken);
}

export function getNearbyHabitatCells(idToken: string, query?: NearbyHabitatCellQuery) {
  const path = query
    ? `/api/habitat-cells/nearby?${new URLSearchParams({
        lat: String(query.latitude),
        lng: String(query.longitude),
        radiusKm: String(query.radiusKm ?? 5),
      }).toString()}`
    : '/api/habitat-cells/nearby';
  return requestJson<HabitatCell[]>(path, idToken);
}

export function getMapDiscoveries(idToken: string, query: NearbyHabitatCellQuery) {
  return requestJson<MapDiscoveryResponse[]>(
    `/api/map/discoveries?${new URLSearchParams({
      lat: String(query.latitude),
      lng: String(query.longitude),
      radiusKm: String(query.radiusKm ?? 5),
    }).toString()}`,
    idToken
  );
}

export function registerMediaAsset(idToken: string, request: RegisterMediaAssetRequest) {
  return postJson<MediaAssetResponse>('/api/media/register', idToken, request);
}

export function createObservation(idToken: string, request: CreateObservationRequest) {
  return postJson<ObservationResponse>('/api/observations', idToken, request);
}

export function analyzeObservation(idToken: string, observationId: string) {
  return requestJson<AnalysisResponse>(`/api/observations/${encodeURIComponent(observationId)}/analyze`, idToken, {
    method: 'POST',
  });
}

export function getAnalysisJob(idToken: string, analysisJobId: string) {
  return requestJson<AnalysisResponse>(`/api/analysis-jobs/${encodeURIComponent(analysisJobId)}`, idToken);
}

export function plantObservation(idToken: string, observationId: string, request: PlantObservationRequest) {
  return postJson<HabitatCell>(`/api/observations/${encodeURIComponent(observationId)}/plant`, idToken, request);
}

export function getCodexEntries(idToken: string, habitatCellId: string) {
  return requestJson<CodexEntryResponse[]>(`/api/habitat-cells/${encodeURIComponent(habitatCellId)}/codex`, idToken);
}

export function getHabitatCellReport(idToken: string, habitatCellId: string) {
  return requestJson<HabitatCellReport>(`/api/habitat-cells/${encodeURIComponent(habitatCellId)}/report`, idToken);
}

function postJson<T>(path: string, idToken: string, body: unknown) {
  return requestJson<T>(path, idToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
