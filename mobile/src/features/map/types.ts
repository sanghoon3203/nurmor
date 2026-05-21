import { LocationObject } from 'expo-location';

import { HabitatCell, HealthResponse } from '../../services/api';

export type LocationState =
  | { status: 'loading'; location: null; message: string | null }
  | { status: 'granted'; location: LocationObject; message: null }
  | { status: 'denied'; location: null; message: string }
  | { status: 'error'; location: null; message: string };

export type BackendState =
  | { status: 'idle'; health: null; cells: HabitatCell[]; message: null }
  | { status: 'loading'; health: null; cells: HabitatCell[]; message: null }
  | { status: 'ready'; health: HealthResponse; cells: HabitatCell[]; message: null }
  | { status: 'error'; health: null; cells: HabitatCell[]; message: string };
