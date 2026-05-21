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

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
  }
}

async function requestJson<T>(path: string, idToken?: string): Promise<T> {
  const env = getPublicEnv();
  const response = await fetch(`${env.atlasApiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
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

export function getNearbyHabitatCells(idToken: string) {
  return requestJson<HabitatCell[]>('/api/habitat-cells/nearby', idToken);
}
