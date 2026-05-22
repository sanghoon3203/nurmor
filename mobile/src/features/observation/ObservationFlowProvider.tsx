import * as Location from 'expo-location';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { assertConfigured, getPublicEnv } from '../../config/env';
import { AnalysisResponse, CodexEntryResponse, HabitatCell, MediaAssetResponse, ObservationResponse } from '../../services/api';
import { createFirebaseObservationDraft, plantFirebaseObservation } from '../../services/firebaseAtlasDb';
import {
  AtlasMediaType,
  arrayBufferFromBlob,
  blobFromUri,
  buildStorageObjectPath,
  checksumHex,
  detectMediaType,
  inferMimeType,
  uploadFirebaseStorageObject,
} from '../../services/firebaseStorageRest';
import { useAuth } from '../auth/AuthProvider';

export type PickedObservationAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

type UploadedMediaSummary = {
  uri: string;
  mediaType: AtlasMediaType;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  storageKey: string;
};

type ObservationFlowStatus =
  | 'idle'
  | 'locating'
  | 'uploading'
  | 'creating-observation'
  | 'analyzing'
  | 'ready-for-review'
  | 'planting'
  | 'planted'
  | 'error';

type ObservationFlowState = {
  status: ObservationFlowStatus;
  message: string;
  errorMessage: string | null;
  media: UploadedMediaSummary | null;
  mediaAsset: MediaAssetResponse | null;
  observation: ObservationResponse | null;
  analysis: AnalysisResponse | null;
  plantedCell: HabitatCell | null;
  codexEntries: CodexEntryResponse[];
};

type ObservationFlowContextValue = {
  state: ObservationFlowState;
  isBusy: boolean;
  reset: () => void;
  startCaptureAnalysis: (asset: PickedObservationAsset) => Promise<void>;
  plantCandidate: (speciesCandidateId: string, visibility: 'PRIVATE' | 'CELL' | 'PUBLIC') => Promise<void>;
};

const initialState: ObservationFlowState = {
  status: 'idle',
  message: '관찰 기록을 기다리는 중',
  errorMessage: null,
  media: null,
  mediaAsset: null,
  observation: null,
  analysis: null,
  plantedCell: null,
  codexEntries: [],
};

const busyStatuses = new Set<ObservationFlowStatus>([
  'locating',
  'uploading',
  'creating-observation',
  'analyzing',
  'planting',
]);

const ObservationFlowContext = createContext<ObservationFlowContextValue | null>(null);

export function ObservationFlowProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [state, setState] = useState<ObservationFlowState>(initialState);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const startCaptureAnalysis = useCallback(
    async (asset: PickedObservationAsset) => {
      try {
        if (!auth.session?.idToken) {
          throw new Error('Firebase 로그인이 완료된 뒤 다시 시도해 주세요.');
        }

        const env = getPublicEnv();
        assertConfigured(env);

        const capturedAt = new Date();
        const mimeType = inferMimeType(asset.uri, asset.mimeType);
        const mediaType = detectMediaType(mimeType);

        setState({
          ...initialState,
          status: 'locating',
          message: '현재 위치 metadata를 확인하는 중',
        });

        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          throw new Error('위치 권한이 있어야 관찰 기록을 지도 셀에 심을 수 있습니다.');
        }
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setState((current) => ({
          ...current,
          status: 'uploading',
          message: 'Firebase Storage에 원본 기록을 업로드하는 중',
        }));

        const blob = await blobFromUri(asset.uri);
        const checksum = await checksumHex(await arrayBufferFromBlob(blob));
        const objectPath = buildStorageObjectPath({
          firebaseUid: auth.session.localId,
          originalName: asset.fileName ?? defaultNameForMime(mimeType),
          capturedAt,
        });
        const uploadResult = await uploadFirebaseStorageObject({
          bucket: env.firebaseStorageBucket,
          firebaseIdToken: auth.session.idToken,
          objectPath,
          blob,
          mimeType,
        });
        const sizeBytes = asset.fileSize ?? blob.size ?? 0;

        const mediaSummary: UploadedMediaSummary = {
          uri: asset.uri,
          mediaType,
          mimeType,
          sizeBytes,
          checksum,
          storageKey: uploadResult.storageKey,
        };

        const mediaAsset: MediaAssetResponse = {
          id: `firebase-${checksum}`,
          type: mediaType,
          storageKey: uploadResult.storageKey,
          mimeType,
        };

        setState((current) => ({
          ...current,
          status: 'creating-observation',
          message: '정확 좌표를 private Firestore 기록으로 저장하는 중',
          media: mediaSummary,
          mediaAsset,
        }));

        const draft = await createFirebaseObservationDraft(auth.session.idToken, {
          userId: auth.session.localId,
          media: {
            mediaType,
            storageKey: uploadResult.storageKey,
            mimeType,
            sizeBytes,
            checksum,
          },
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          locationAccuracyMeters: location.coords.accuracy ?? 0,
          capturedAt: capturedAt.toISOString(),
        });

        setState((current) => ({
          ...current,
          status: 'analyzing',
          message: 'Firebase-only MVP 후보를 준비하는 중',
          observation: draft.observation,
        }));

        setState((current) => ({
          ...current,
          status: 'ready-for-review',
          message: '임시 후보를 확인하고 지도에 심어주세요.',
          analysis: draft.analysis,
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          status: 'error',
          message: '관찰 기록 처리에 실패했습니다.',
          errorMessage: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        }));
      }
    },
    [auth.session]
  );

  const plantCandidate = useCallback(
    async (speciesCandidateId: string, visibility: 'PRIVATE' | 'CELL' | 'PUBLIC') => {
      try {
        if (!auth.session?.idToken) {
          throw new Error('Firebase 로그인이 완료된 뒤 다시 시도해 주세요.');
        }
        if (!state.observation?.id) {
          throw new Error('심을 ObservationRecord가 없습니다.');
        }
        const candidate = state.analysis?.candidates.find((item) => item.id === speciesCandidateId);
        if (!candidate) {
          throw new Error('선택한 생물 후보를 찾지 못했습니다.');
        }

        setState((current) => ({
          ...current,
          status: 'planting',
          message: '선택한 후보를 Firestore 셀 도감에 심는 중',
          errorMessage: null,
        }));

        const planted = await plantFirebaseObservation(auth.session.idToken, {
          userId: auth.session.localId,
          observation: state.observation,
          candidate,
          visibility,
        });

        setState((current) => ({
          ...current,
          status: 'planted',
          message: 'Firestore 셀 도감에 기록이 반영되었습니다.',
          plantedCell: planted.plantedCell,
          codexEntries: planted.codexEntries,
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          status: 'error',
          message: '지도에 심기 요청에 실패했습니다.',
          errorMessage: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        }));
      }
    },
    [auth.session?.idToken, auth.session?.localId, state.analysis?.candidates, state.observation]
  );

  const value = useMemo<ObservationFlowContextValue>(
    () => ({
      state,
      isBusy: busyStatuses.has(state.status),
      reset,
      startCaptureAnalysis,
      plantCandidate,
    }),
    [plantCandidate, reset, startCaptureAnalysis, state]
  );

  return <ObservationFlowContext.Provider value={value}>{children}</ObservationFlowContext.Provider>;
}

export function useObservationFlow() {
  const context = useContext(ObservationFlowContext);
  if (!context) {
    throw new Error('useObservationFlow must be used inside ObservationFlowProvider');
  }
  return context;
}

function defaultNameForMime(mimeType: string): string {
  if (mimeType.startsWith('video/')) {
    return 'capture.mp4';
  }
  if (mimeType === 'image/png') {
    return 'capture.png';
  }
  if (mimeType === 'image/heic') {
    return 'capture.heic';
  }
  if (mimeType.startsWith('audio/')) {
    return 'capture.m4a';
  }
  return 'capture.jpg';
}
