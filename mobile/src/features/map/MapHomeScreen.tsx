import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_DEFAULT, Region } from 'react-native-maps';

import { useAuth } from '../auth/AuthProvider';
import { HabitatCell, getHealth, getNearbyHabitatCells } from '../../services/api';
import { bloomColors, colors, radii } from '../../theme/tokens';
import { BackendState, LocationState } from './types';

const fallbackRegion: Region = {
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.035,
  longitudeDelta: 0.035,
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

function cellPolygon(cell: HabitatCell) {
  const half = 0.0025 / 2;
  return [
    { latitude: cell.centerLat - half, longitude: cell.centerLng - half },
    { latitude: cell.centerLat - half, longitude: cell.centerLng + half },
    { latitude: cell.centerLat + half, longitude: cell.centerLng + half },
    { latitude: cell.centerLat + half, longitude: cell.centerLng - half },
  ];
}

function statusCopy(status: string) {
  switch (status) {
    case 'authenticated':
      return '익명 관찰자 연결됨';
    case 'missing-config':
      return '모바일 env 설정 필요';
    case 'error':
      return '인증 실패';
    default:
      return '인증 준비 중';
  }
}

function shortCellKey(cellKey: string) {
  if (cellKey.length <= 22) {
    return cellKey;
  }
  return `${cellKey.slice(0, 10)}...${cellKey.slice(-8)}`;
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

  const selectedCell = useMemo(
    () => backendState.cells.find((cell) => cell.id === selectedCellId) ?? backendState.cells[0] ?? null,
    [backendState.cells, selectedCellId]
  );

  const region = useMemo(() => regionFromLocation(locationState), [locationState]);

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
      const [health, cells] = await Promise.all([
        getHealth(),
        getNearbyHabitatCells(auth.session.idToken),
      ]);
      setBackendState({ status: 'ready', health, cells, message: null });
      setSelectedCellId((current) => current ?? cells[0]?.id ?? null);
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
      <View style={styles.mapWrap}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={region}
          region={region}
          showsUserLocation={locationState.status === 'granted'}
          showsMyLocationButton
          mapType="standard"
        >
          {backendState.cells.map((cell) => (
            <Polygon
              key={cell.id}
              coordinates={cellPolygon(cell)}
              fillColor={`${bloomColors[cell.bloomState] ?? colors.sprout}55`}
              strokeColor={selectedCell?.id === cell.id ? colors.clay : colors.canopy}
              strokeWidth={selectedCell?.id === cell.id ? 3 : 1}
              tappable
              onPress={() => setSelectedCellId(cell.id)}
            />
          ))}
          {backendState.cells.map((cell) => (
            <Marker
              key={`${cell.id}-marker`}
              coordinate={{ latitude: cell.centerLat, longitude: cell.centerLng }}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => setSelectedCellId(cell.id)}
            >
              <View style={[styles.cellDot, { backgroundColor: bloomColors[cell.bloomState] ?? colors.sprout }]} />
            </Marker>
          ))}
        </MapView>

        <View style={styles.brandPlate}>
          <Text style={styles.brand}>Atlas</Text>
          <Text style={styles.brandSub}>서식지 기록 지도</Text>
        </View>
      </View>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
        <View style={styles.statusGrid}>
          <StatusPill label="Auth" value={statusCopy(auth.status)} tone={auth.status === 'authenticated' ? 'good' : 'warn'} />
          <StatusPill
            label="API"
            value={backendState.status === 'ready' ? backendState.health.status : backendState.status}
            tone={backendState.status === 'ready' ? 'good' : backendState.status === 'error' ? 'bad' : 'warn'}
          />
          <StatusPill
            label="Location"
            value={locationState.status === 'granted' ? '위치 확인됨' : locationState.status}
            tone={locationState.status === 'granted' ? 'good' : locationState.status === 'error' ? 'bad' : 'warn'}
          />
        </View>

        {auth.status === 'missing-config' ? (
          <InfoPanel
            title="모바일 env 설정 필요"
            body={`mobile/.env에 ${auth.missingKeys.join(', ')} 값을 넣어야 Firebase 로그인과 API 연결이 시작됩니다.`}
            actionLabel="다시 로그인"
            onAction={auth.signIn}
          />
        ) : null}

        {auth.status === 'error' ? (
          <InfoPanel
            title="Firebase 로그인 실패"
            body={auth.errorMessage ?? '익명 로그인을 다시 시도해 주세요.'}
            actionLabel="다시 시도"
            onAction={auth.signIn}
          />
        ) : null}

        {locationState.status === 'denied' || locationState.status === 'error' ? (
          <InfoPanel
            title="위치 권한 확인"
            body={locationState.message ?? '위치 상태를 확인해 주세요.'}
            actionLabel="위치 다시 요청"
            onAction={loadLocation}
          />
        ) : null}

        {backendState.status === 'loading' ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.canopy} />
            <Text style={styles.loadingText}>Atlas API에서 주변 셀을 불러오는 중</Text>
          </View>
        ) : null}

        {backendState.status === 'error' ? (
          <InfoPanel
            title="백엔드 연결 실패"
            body={backendState.message}
            actionLabel="API 다시 연결"
            onAction={loadBackend}
          />
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>주변 서식지 셀</Text>
          <Text style={styles.sectionMeta}>{backendState.cells.length} cells</Text>
        </View>

        {selectedCell ? (
          <View style={styles.cellCard}>
            <View style={styles.cellCardHeader}>
              <View style={[styles.bloomSwatch, { backgroundColor: bloomColors[selectedCell.bloomState] ?? colors.sprout }]} />
              <View style={styles.cellTitleGroup}>
                <Text style={styles.cellTitle}>{shortCellKey(selectedCell.cellKey)}</Text>
                <Text style={styles.cellSubtitle}>{selectedCell.bloomState}</Text>
              </View>
            </View>
            <View style={styles.metricRow}>
              <Metric label="Bloom" value={String(selectedCell.bloomScore)} />
              <Metric label="Records" value={String(selectedCell.observationCount)} />
              <Metric label="Species" value={String(selectedCell.speciesCount)} />
              <Metric label="People" value={String(selectedCell.contributorCount)} />
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>아직 보이는 셀이 없습니다.</Text>
            <Text style={styles.emptyBody}>
              백엔드가 비어 있으면 정상입니다. 첫 관찰을 심으면 이 지도에 셀이 피어납니다.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: 'good' | 'warn' | 'bad' }) {
  const toneColor = tone === 'good' ? colors.moss : tone === 'warn' ? colors.bloom : colors.danger;
  return (
    <View style={styles.statusPill}>
      <View style={[styles.statusLight, { backgroundColor: toneColor }]} />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.statusValue}>
        {value}
      </Text>
    </View>
  );
}

function InfoPanel({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.infoPanel}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoBody}>{body}</Text>
      <Pressable style={styles.actionButton} onPress={onAction}>
        <Text style={styles.actionText}>{actionLabel}</Text>
      </Pressable>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.field,
  },
  mapWrap: {
    flex: 1,
    minHeight: 360,
    backgroundColor: colors.water,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  brandPlate: {
    position: 'absolute',
    left: 18,
    top: 58,
    gap: 2,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: '#ffffffaa',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fffdf4ee',
  },
  brand: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  brandSub: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  cellDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
  },
  sheet: {
    maxHeight: 350,
    backgroundColor: colors.paper,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  sheetContent: {
    gap: 16,
    padding: 18,
    paddingBottom: 32,
  },
  statusGrid: {
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.small,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: colors.white,
  },
  statusLight: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  statusLabel: {
    width: 66,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusValue: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
  },
  infoPanel: {
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.medium,
    padding: 14,
    backgroundColor: colors.white,
  },
  infoTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  infoBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    alignSelf: 'flex-start',
    borderRadius: radii.round,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.canopy,
  },
  actionText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  sectionMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cellCard: {
    gap: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.medium,
    padding: 16,
    backgroundColor: colors.white,
  },
  cellCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bloomSwatch: {
    width: 42,
    height: 42,
    borderRadius: radii.small,
    borderWidth: 1,
    borderColor: '#00000018',
  },
  cellTitleGroup: {
    flex: 1,
    gap: 2,
  },
  cellTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  cellSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metric: {
    flex: 1,
    gap: 2,
    borderRadius: radii.small,
    padding: 10,
    backgroundColor: colors.field,
  },
  metricValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.medium,
    padding: 16,
    backgroundColor: colors.white,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
