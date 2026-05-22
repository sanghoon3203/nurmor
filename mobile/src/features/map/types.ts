import { LocationObject } from 'expo-location';

import { HabitatCell } from '../../services/api';

export type LocationState =
  | { status: 'loading'; location: null; message: string | null }
  | { status: 'granted'; location: LocationObject; message: null }
  | { status: 'denied'; location: null; message: string }
  | { status: 'error'; location: null; message: string };

export type BackendState =
  | { status: 'idle'; cells: HabitatCell[]; message: null }
  | { status: 'loading'; cells: HabitatCell[]; message: null }
  | { status: 'ready'; cells: HabitatCell[]; message: null }
  | { status: 'error'; cells: HabitatCell[]; message: string };
