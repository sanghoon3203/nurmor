import { getPublicEnv } from '../config/env';

export type HabitatCell = {
  id: string;
  cellKey: string;
  centerLat: number;
  centerLng: number;
  bloomState: string;
  bloomScore: number;
  observationCount: number;
  speciesCount: number;
  contributorCount: number;
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
  capturedAt: string;
};

export type ObservationResponse = {
  id: string;
  habitatCellId: string;
  status: string;
  publicLat: number;
  publicLng: number;
};

export type AnalysisCandidateResponse = {
  id: string;
  commonNameKo: string;
  scientificName: string | null;
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
  visibility: 'PRIVATE' | 'CELL' | 'PUBLIC';
};

export type CodexEntryResponse = {
  id: string;
  habitatCellId: string;
  speciesKey: string;
  displayName: string;
  scientificName?: string | null;
  category?: string;
  observationCount: number;
  bestConfidence: number;
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

function postJson<T>(path: string, idToken: string, body: unknown) {
  return requestJson<T>(path, idToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
