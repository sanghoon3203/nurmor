import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassPanel, RevealView } from '../atlas/glass';
import { ProgressBar } from '../atlas/ui';
import { useAuth } from '../auth/AuthProvider';
import { HabitatCell } from '../../services/api';
import { listNearbyHabitatCells } from '../../services/firebaseAtlasDb';
import { bloomColors, colors, glass, radii } from '../../theme/tokens';
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
      cells: current.cells,
      message: null,
    }));

    try {
      const nextCells = await listNearbyHabitatCells(
        auth.session.idToken,
        locationState.status === 'granted'
          ? {
              latitude: locationState.location.coords.latitude,
              longitude: locationState.location.coords.longitude,
              radiusKm: 5,
            }
          : {
              latitude: fallbackRegion.latitude,
              longitude: fallbackRegion.longitude,
              radiusKm: 5,
            }
      );
      setBackendState({ status: 'ready', cells: nextCells, message: null });
      setSelectedCellId((current) => current ?? nextCells[0]?.id ?? null);
    } catch (error) {
      setBackendState({
        status: 'error',
        cells: [],
        message: error instanceof Error ? error.message : 'Firestore 연결에 실패했습니다.',
      });
    }
  }, [auth.session?.idToken, locationState]);

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
              <Text style={styles.cellDotText}>{cell.observationCount || ''}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
        <View style={styles.topCluster}>
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.title}>내 생태 지도</Text>
            </View>
            <Pressable accessibilityLabel="알림" accessibilityRole="button" style={styles.iconButton}>
              <Text style={styles.iconText}>○</Text>
            </Pressable>
          </View>

          <GlassPanel style={styles.statusCapsule} contentStyle={styles.statusCapsuleContent}>
            <StatusChip symbol="☼" label={`오늘 밝힌 구역 ${visibleCellCount}`} tone="yellow" />
            <StatusChip symbol="⌖" label={locationCopy(locationState)} tone="blue" />
            <StatusChip symbol="▱" label={apiReady ? 'Firestore 연결' : backendState.status === 'loading' ? '데이터 확인 중' : '데이터 미리보기'} tone="green" />
          </GlassPanel>
        </View>

        <View style={styles.mapControls}>
          <MapControl symbol="⌖" label="현재 위치" />
          <MapControl symbol="▱" label="지도 레이어" />
        </View>

        <RevealView>
        <GlassPanel style={styles.bottomCard} contentStyle={styles.bottomCardContent}>
          <View style={styles.sheetHandle} />
          <View style={styles.cardTopRow}>
            <View style={styles.leafMedallion}>
              <View style={styles.leafIcon} />
              <View style={styles.leafStem} />
            </View>
            <View style={styles.cellTextGroup}>
              <Text style={styles.cardTitle}>주변 서식지를 더 밝혀보세요</Text>
              <Text style={styles.cardBody}>
                기록을 심을수록 더 많은 생명이 이 지도를 통해 연결됩니다.
              </Text>
            </View>
            <BotanicalAccent />
          </View>

          <View style={styles.selectedCellBox}>
            <View style={styles.selectedCellHeader}>
              <Text style={styles.selectedCellTitle}>개화도 {Math.max(selectedCell.bloomScore, 12)}%</Text>
              <View style={styles.bloomDot} />
            </View>
            <ProgressBar value={Math.max(selectedCell.bloomScore, 12)} />
          </View>

          <View style={styles.metricRow}>
            <Metric symbol="◜" label="기록" value={`${selectedCell.observationCount || discoveredCount}개`} />
            <Metric symbol="⌁" label="종" value={`${selectedCell.speciesCount}개`} />
            <Metric symbol="○○" label="기여자" value={`${selectedCell.contributorCount}명`} />
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
              title="Firestore 연결 실패"
              body={backendState.message ?? 'Firebase 설정과 네트워크 상태를 확인해 주세요.'}
              onPress={loadBackend}
              actionLabel="데이터 다시 연결"
            />
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.secondaryAction} onPress={() => router.push('/cell')}>
              <Text style={styles.secondaryActionText}>셀 도감 보기</Text>
            </Pressable>
            <Pressable style={styles.primaryAction} onPress={() => router.push('/(tabs)/record')}>
              <Text style={styles.primaryActionText}>기록 심기</Text>
            </Pressable>
          </View>
        </GlassPanel>
        </RevealView>
      </SafeAreaView>
    </View>
  );
}

function StatusChip({ symbol, label, tone }: { symbol: string; label: string; tone: 'green' | 'blue' | 'yellow' }) {
  const toneStyle = tone === 'blue' ? styles.statusSymbolBlue : tone === 'yellow' ? styles.statusSymbolYellow : styles.statusSymbolGreen;
  return (
    <View style={styles.statusChip}>
      <Text style={[styles.statusSymbol, toneStyle]}>{symbol}</Text>
      <Text style={styles.statusChipText} numberOfLines={1}>
        {label}
      </Text>
      {tone !== 'yellow' ? <View style={[styles.statusDot, tone === 'blue' ? styles.statusDotBlue : styles.statusDotGreen]} /> : null}
    </View>
  );
}

function MapControl({ symbol, label }: { symbol: string; label: string }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" style={styles.mapControl}>
      <Text style={styles.mapControlText}>{symbol}</Text>
    </Pressable>
  );
}

function Metric({ symbol, label, value }: { symbol: string; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricSymbol}>{symbol}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function BotanicalAccent() {
  return (
    <View pointerEvents="none" style={styles.botanicalAccent}>
      <View style={[styles.accentLeaf, styles.accentLeafTop]} />
      <View style={[styles.accentLeaf, styles.accentLeafBottom]} />
      <View style={styles.accentStem} />
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
    paddingHorizontal: 18,
    paddingBottom: 108,
  },
  topCluster: {
    gap: 14,
    paddingTop: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  iconButton: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.surfaceStrong,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  iconText: {
    color: colors.canopy,
    fontSize: 27,
    fontWeight: '500',
    lineHeight: 30,
  },
  titleGroup: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  title: {
    color: colors.ink,
    fontSize: 39,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '700',
  },
  statusCapsule: {
    borderRadius: radii.round,
  },
  statusCapsuleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  statusChip: {
    flex: 1,
    minWidth: 0,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: radii.round,
    paddingHorizontal: 8,
  },
  statusSymbol: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusSymbolGreen: {
    color: colors.canopy,
  },
  statusSymbolBlue: {
    color: '#267eea',
  },
  statusSymbolYellow: {
    color: colors.pollen,
  },
  statusChipText: {
    minWidth: 0,
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotBlue: {
    backgroundColor: '#267eea',
  },
  statusDotGreen: {
    backgroundColor: colors.leaf,
  },
  mapControls: {
    position: 'absolute',
    right: 18,
    top: 218,
    gap: 14,
  },
  mapControl: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.surfaceStrong,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  mapControlText: {
    color: colors.canopy,
    fontSize: 27,
    fontWeight: '600',
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
    fontWeight: '800',
  },
  bottomCard: {
    borderRadius: radii.sheet,
  },
  bottomCardContent: {
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 54,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(22, 63, 45, 0.24)',
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  leafMedallion: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: 'rgba(223, 241, 207, 0.78)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  leafIcon: {
    width: 34,
    height: 22,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 3,
    borderColor: colors.moss,
    transform: [{ rotate: '-38deg' }],
  },
  leafStem: {
    position: 'absolute',
    width: 3,
    height: 32,
    borderRadius: 2,
    backgroundColor: colors.moss,
    transform: [{ rotate: '42deg' }, { translateY: 5 }],
  },
  cellTextGroup: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: 0,
  },
  cardBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  botanicalAccent: {
    width: 62,
    height: 76,
    opacity: 0.42,
  },
  accentStem: {
    position: 'absolute',
    left: 30,
    top: 10,
    width: 2,
    height: 58,
    borderRadius: 1,
    backgroundColor: colors.moss,
    transform: [{ rotate: '18deg' }],
  },
  accentLeaf: {
    position: 'absolute',
    width: 34,
    height: 18,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: colors.sprout,
  },
  accentLeafTop: {
    top: 12,
    right: 0,
    transform: [{ rotate: '-18deg' }],
  },
  accentLeafBottom: {
    left: 4,
    top: 42,
    transform: [{ rotate: '162deg' }],
  },
  selectedCellBox: {
    gap: 10,
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.82)',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
  },
  selectedCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectedCellTitle: {
    flex: 1,
    color: colors.canopy,
    fontSize: 16,
    fontWeight: '800',
  },
  bloomDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.bloom,
    borderWidth: 2,
    borderColor: colors.white,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    flex: 1,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: 'rgba(22, 63, 45, 0.08)',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
  },
  metricSymbol: {
    color: colors.moss,
    fontSize: 19,
    fontWeight: '700',
  },
  metricValue: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
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
    fontWeight: '800',
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
    fontWeight: '800',
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
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryAction: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: 'rgba(255, 255, 255, 0.64)',
  },
  secondaryActionText: {
    color: colors.canopy,
    fontSize: 15,
    fontWeight: '800',
  },
});
