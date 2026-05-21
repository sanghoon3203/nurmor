import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CellGlyph, ProgressBar, StatusBadge } from '../atlas/ui';
import { useAuth } from '../auth/AuthProvider';
import { HabitatCell, getHealth, getNearbyHabitatCells } from '../../services/api';
import { bloomColors, colors, radii } from '../../theme/tokens';
import { BackendState, LocationState } from './types';

const fallbackRegion: Region = {
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.033,
  longitudeDelta: 0.033,
};

function regionFromLocation(locationState: LocationState): Region {
  if (locationState.status !== 'granted') {
    return fallbackRegion;
  }

  return {
    latitude: locationState.location.coords.latitude,
    longitude: locationState.location.coords.longitude,
    latitudeDelta: 0.018,
    longitudeDelta: 0.018,
  };
}

function hexPolygon(cell: HabitatCell) {
  const latRadius = 0.00185;
  const lngRadius = 0.00225;

  return Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 6 + index * (Math.PI / 3);
    return {
      latitude: cell.centerLat + Math.sin(angle) * latRadius,
      longitude: cell.centerLng + Math.cos(angle) * lngRadius,
    };
  });
}

function demoCells(region: Region): HabitatCell[] {
  const offsets = [
    { id: 'demo-1', lat: 0, lng: 0, state: 'VISITED', score: 18 },
    { id: 'demo-2', lat: 0.0026, lng: 0.0028, state: 'SEEDED', score: 32 },
    { id: 'demo-3', lat: -0.0028, lng: 0.0032, state: 'GROWING', score: 52 },
    { id: 'demo-4', lat: 0.0032, lng: -0.003, state: 'BLOOMED', score: 64 },
    { id: 'demo-5', lat: -0.0032, lng: -0.0025, state: 'UNOBSERVED', score: 0 },
  ];

  return offsets.map((item, index) => ({
    id: item.id,
    cellKey: `preview-${index + 1}-${item.state.toLowerCase()}`,
    centerLat: region.latitude + item.lat,
    centerLng: region.longitude + item.lng,
    bloomState: item.state,
    bloomScore: item.score,
    observationCount: item.state === 'UNOBSERVED' ? 0 : index + 1,
    speciesCount: item.state === 'UNOBSERVED' ? 0 : Math.max(1, index),
    contributorCount: item.state === 'UNOBSERVED' ? 0 : index + 1,
  }));
}

function shortCellKey(cellKey: string) {
  if (cellKey.length <= 24) {
    return cellKey;
  }
  return `${cellKey.slice(0, 12)}...${cellKey.slice(-8)}`;
}

function locationCopy(locationState: LocationState) {
  switch (locationState.status) {
    case 'granted':
      return '현재 위치 기록 중';
    case 'denied':
      return '위치 권한 필요';
    case 'error':
      return '위치 확인 실패';
    default:
      return '위치 확인 중';
  }
}

export function MapHomeScreen() {
  const auth = useAuth();
  const [locationState, setLocationState] = useState<LocationState>({
    status: 'loading',
    location: null,
    message: null,
  });
  const [backendState, setBackendState] = useState<BackendState>({
    status: 'idle',
    health: null,
    cells: [],
    message: null,
  });
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  const region = useMemo(() => regionFromLocation(locationState), [locationState]);
  const cells = useMemo(
    () => (backendState.cells.length > 0 ? backendState.cells : demoCells(region)),
    [backendState.cells, region]
  );
  const selectedCell = useMemo(
    () => cells.find((cell) => cell.id === selectedCellId) ?? cells[0],
    [cells, selectedCellId]
  );

  const discoveredCount = backendState.cells.reduce((sum, cell) => sum + cell.observationCount, 0);
  const visibleCellCount = backendState.cells.length > 0 ? backendState.cells.length : 3;
  const apiReady = backendState.status === 'ready';

  const loadLocation = useCallback(async () => {
    setLocationState({ status: 'loading', location: null, message: null });
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setLocationState({
          status: 'denied',
          location: null,
          message: '위치 권한이 있어야 주변 서식지 셀을 볼 수 있습니다.',
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocationState({ status: 'granted', location, message: null });
    } catch (error) {
      setLocationState({
        status: 'error',
        location: null,
        message: error instanceof Error ? error.message : '현재 위치를 가져오지 못했습니다.',
      });
    }
  }, []);

  const loadBackend = useCallback(async () => {
    if (!auth.session?.idToken) {
      return;
    }

    setBackendState((current) => ({
      status: 'loading',
      health: null,
      cells: current.cells,
      message: null,
    }));

    try {
      const [health, nextCells] = await Promise.all([
        getHealth(),
        getNearbyHabitatCells(auth.session.idToken),
      ]);
      setBackendState({ status: 'ready', health, cells: nextCells, message: null });
      setSelectedCellId((current) => current ?? nextCells[0]?.id ?? null);
    } catch (error) {
      setBackendState({
        status: 'error',
        health: null,
        cells: [],
        message: error instanceof Error ? error.message : 'Atlas API 연결에 실패했습니다.',
      });
    }
  }, [auth.session?.idToken]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    if (auth.status === 'authenticated') {
      loadBackend();
    }
  }, [auth.status, loadBackend]);

  return (
    <View style={styles.screen}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        region={region}
        showsUserLocation={locationState.status === 'granted'}
        showsMyLocationButton
        mapType="standard"
      >
        {cells.map((cell) => {
          const selected = selectedCell?.id === cell.id;
          return (
            <Polygon
              key={cell.id}
              coordinates={hexPolygon(cell)}
              fillColor={`${bloomColors[cell.bloomState] ?? colors.sprout}${selected ? 'aa' : '66'}`}
              strokeColor={selected ? colors.pollen : colors.moss}
              strokeWidth={selected ? 4 : 1}
              tappable
              onPress={() => setSelectedCellId(cell.id)}
            />
          );
        })}
        {cells.map((cell) => (
          <Marker
            key={`${cell.id}-marker`}
            coordinate={{ latitude: cell.centerLat, longitude: cell.centerLng }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => setSelectedCellId(cell.id)}
          >
            <View style={[styles.cellDot, { backgroundColor: bloomColors[cell.bloomState] ?? colors.sprout }]}>
              <Text style={styles.cellDotText}>{cell.bloomState === 'BLOOMED' ? '꽃' : cell.observationCount}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
        <View style={styles.topCluster}>
          <View style={styles.topBar}>
            <Pressable accessibilityRole="button" style={styles.iconButton}>
              <Text style={styles.iconText}>☰</Text>
            </Pressable>
            <View style={styles.titleGroup}>
              <Text style={styles.title}>내 생태 지도</Text>
              <Text style={styles.subtitle}>오늘 밝힌 구역 {visibleCellCount}</Text>
            </View>
            <Pressable accessibilityRole="button" style={styles.iconButton}>
              <Text style={styles.iconText}>알림</Text>
            </Pressable>
          </View>

          <View style={styles.statusRail}>
            <StatusBadge label={auth.status === 'authenticated' ? '로그인됨' : '로그인 확인'} />
            <StatusBadge label={apiReady ? 'Atlas API 연결' : backendState.status === 'loading' ? 'API 확인 중' : 'API 미리보기'} tone="blue" />
            <StatusBadge label={locationCopy(locationState)} tone="yellow" />
          </View>
        </View>

        <View style={styles.bottomCard}>
          <View style={styles.cardTopRow}>
            <CellGlyph state={selectedCell.bloomState} selected />
            <View style={styles.cellTextGroup}>
              <Text style={styles.cardTitle}>주변 서식지를 더 밝혀보세요</Text>
              <Text style={styles.cardBody}>
                사진·영상·소리를 기록하면 Gemini가 생물 후보를 읽고, 확인 후 이 셀의 도감에 심습니다.
              </Text>
            </View>
          </View>

          <View style={styles.selectedCellBox}>
            <View style={styles.selectedCellHeader}>
              <Text style={styles.selectedCellTitle}>{shortCellKey(selectedCell.cellKey)}</Text>
              <Text style={styles.selectedCellState}>{selectedCell.bloomState}</Text>
            </View>
            <ProgressBar value={Math.max(selectedCell.bloomScore, 12)} />
            <View style={styles.metricRow}>
              <Metric label="기록" value={String(selectedCell.observationCount || discoveredCount)} />
              <Metric label="종" value={String(selectedCell.speciesCount)} />
              <Metric label="기여자" value={String(selectedCell.contributorCount)} />
            </View>
          </View>

          {auth.status === 'missing-config' ? (
            <Notice
              title="모바일 env 설정 필요"
              body={`mobile/.env에 ${auth.missingKeys.join(', ')} 값을 넣어야 실제 연결이 시작됩니다.`}
              onPress={auth.signIn}
              actionLabel="다시 로그인"
            />
          ) : null}

          {backendState.status === 'loading' ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.canopy} />
              <Text style={styles.loadingText}>주변 셀을 불러오는 중</Text>
            </View>
          ) : null}

          {backendState.status === 'error' ? (
            <Notice
              title="백엔드 연결 실패"
              body={backendState.message ?? 'Atlas API 주소와 네트워크 상태를 확인해 주세요.'}
              onPress={loadBackend}
              actionLabel="API 다시 연결"
            />
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.secondaryAction} onPress={() => router.push('/cell')}>
              <Text style={styles.secondaryActionText}>셀 도감 보기</Text>
            </Pressable>
            <Pressable style={styles.primaryAction} onPress={() => router.push('/capture')}>
              <Text style={styles.primaryActionText}>기록 심기</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Notice({
  title,
  body,
  actionLabel,
  onPress,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.notice}>
      <View style={styles.noticeTextGroup}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeBody}>{body}</Text>
      </View>
      <Pressable style={styles.noticeButton} onPress={onPress}>
        <Text style={styles.noticeButtonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.field,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topCluster: {
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: '#ffffffcc',
    padding: 10,
    backgroundColor: '#fffdf4ee',
  },
  iconButton: {
    minWidth: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.cream,
  },
  iconText: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '900',
  },
  titleGroup: {
    alignItems: 'center',
    gap: 3,
  },
  title: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  statusRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  cellDot: {
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: colors.white,
    paddingHorizontal: 5,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cellDotText: {
    color: colors.canopy,
    fontSize: 10,
    fontWeight: '900',
  },
  bottomCard: {
    gap: 14,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.warmLine,
    padding: 16,
    backgroundColor: '#fffdf4f5',
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  cellTextGroup: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cardBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  selectedCellBox: {
    gap: 10,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: colors.field,
  },
  selectedCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectedCellTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  selectedCellState: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: '900',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metric: {
    flex: 1,
    gap: 2,
    borderRadius: radii.small,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  metricValue: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.warmLine,
    padding: 12,
    backgroundColor: colors.cream,
  },
  noticeTextGroup: {
    flex: 1,
    gap: 3,
  },
  noticeTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  noticeBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  noticeButton: {
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.canopy,
  },
  noticeButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    flex: 1.15,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.leaf,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryAction: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  secondaryActionText: {
    color: colors.canopy,
    fontSize: 15,
    fontWeight: '900',
  },
});
