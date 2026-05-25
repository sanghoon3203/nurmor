import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthProvider';
import { getHabitatCellReport, getMapDiscoveries, getNearbyHabitatCells, HabitatCell, HabitatCellReport, MapDiscoveryResponse, SpeciesDisplayGroup } from '../../services/api';
import { colors, glass } from '../../theme/tokens';
import { LocationState } from './types';

type DiscoveryState =
  | { status: 'idle'; discoveries: MapDiscovery[]; message: null }
  | { status: 'loading'; discoveries: MapDiscovery[]; message: null }
  | { status: 'ready'; discoveries: MapDiscovery[]; message: null }
  | { status: 'error'; discoveries: MapDiscovery[]; message: string };

type CellState =
  | { status: 'idle'; cells: MapHabitatCell[]; message: null }
  | { status: 'loading'; cells: MapHabitatCell[]; message: null }
  | { status: 'ready'; cells: MapHabitatCell[]; message: null }
  | { status: 'error'; cells: MapHabitatCell[]; message: string };

type MapDiscovery = {
  id: string;
  observationId: string;
  habitatCellId: string;
  displayName: string;
  scientificName: string | null;
  displayGroup: SpeciesDisplayGroup;
  imageUrl: string | null;
  publicLat: number;
  publicLng: number;
  likeCount: number;
  commentCount: number;
  createdAt: string | null;
  distanceKm: number;
  contributorName: string;
  regionName: string;
  discoveryNumber: number;
};

type MapHabitatCell = {
  id: string;
  label: string;
  centerLat: number;
  centerLng: number;
  bloomScore: number;
  observationCount: number;
  speciesCount: number;
  contributorCount: number;
  fillColor: string;
  coordinates: Array<{ latitude: number; longitude: number }>;
  highlights: Array<{ title: string; body: string }>;
  featuredSpecies: Array<{ name: string; group: string; mark: string }>;
  report?: HabitatCellReport | null;
};

const fallbackRegion: Region = {
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
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

function demoDiscoveries(region: Region): MapDiscovery[] {
  const items = [
    { name: '수달', displayGroup: 'MAMMAL' as const, contributor: 'hy.19', lat: 0.0018, lng: -0.0014, createdAt: '2026-05-22T11:34:00.000Z' },
    { name: '참새', displayGroup: 'BIRD' as const, contributor: '새벽관찰자', lat: -0.0028, lng: 0.0026, createdAt: '2026-05-18T08:12:00.000Z' },
    { name: '민들레', displayGroup: 'PLANT' as const, contributor: '초록손', lat: 0.0042, lng: 0.003, createdAt: '2026-04-29T15:21:00.000Z' },
    { name: '무당벌레', displayGroup: 'INSECT' as const, contributor: '곤충기록자', lat: -0.0044, lng: -0.002, createdAt: '2026-05-04T10:05:00.000Z' },
  ];

  return items.map((item, index) => ({
    id: `demo-discovery-${index + 1}`,
    observationId: `demo-observation-${index + 1}`,
    habitatCellId: `demo-cell-${index + 1}`,
    contributorName: item.contributor,
    displayName: item.name,
    scientificName: null,
    displayGroup: item.displayGroup,
    imageUrl: null,
    publicLat: region.latitude + item.lat,
    publicLng: region.longitude + item.lng,
    likeCount: index + 2,
    commentCount: index,
    createdAt: item.createdAt,
    distanceKm: Math.round((index + 1) * 3) / 10,
    regionName: `주변 생태 셀 ${index + 1}`,
    discoveryNumber: index + 1,
  }));
}

function demoHabitatCells(region: Region): MapHabitatCell[] {
  const seeds = [
    { id: 'cell-jamsil-7', label: '잠실 7동', lat: 0.0048, lng: -0.001, score: 28, observations: 3, species: 2, color: 'rgba(202, 213, 185, 0.48)' },
    { id: 'cell-jamsil-2-north', label: '잠실 2동', lat: 0.0024, lng: -0.0042, score: 55, observations: 8, species: 5, color: 'rgba(164, 198, 126, 0.5)' },
    { id: 'cell-jamsil-6', label: '잠실 6동', lat: 0.0026, lng: 0.0034, score: 45, observations: 6, species: 4, color: 'rgba(174, 203, 143, 0.5)' },
    { id: 'cell-jamsilbon', label: '잠실본동', lat: 0, lng: 0.0002, score: 62, observations: 11, species: 7, color: 'rgba(143, 184, 104, 0.5)' },
    { id: 'cell-jamsil-4', label: '잠실 4동', lat: -0.0004, lng: 0.0057, score: 36, observations: 4, species: 3, color: 'rgba(186, 207, 158, 0.46)' },
    { id: 'cell-jamsil-3', label: '잠실 3동', lat: -0.0041, lng: -0.0011, score: 87, observations: 27, species: 42, color: 'rgba(184, 218, 95, 0.58)' },
    { id: 'cell-jamsil-5', label: '잠실 5동', lat: -0.0042, lng: 0.0046, score: 51, observations: 7, species: 5, color: 'rgba(178, 203, 132, 0.47)' },
    { id: 'cell-jamsil-9-west', label: '잠실 9동', lat: -0.0075, lng: -0.0043, score: 19, observations: 1, species: 1, color: 'rgba(210, 203, 190, 0.48)' },
    { id: 'cell-jamsil-9', label: '잠실 9동', lat: -0.0082, lng: 0.0013, score: 24, observations: 2, species: 2, color: 'rgba(207, 200, 188, 0.48)' },
  ];

  return seeds.map((seed, index) => {
    const centerLat = region.latitude + seed.lat;
    const centerLng = region.longitude + seed.lng;
    return {
      id: seed.id,
      label: seed.label,
      centerLat,
      centerLng,
      bloomScore: seed.score,
      observationCount: seed.observations,
      speciesCount: seed.species,
      contributorCount: Math.max(2, Math.round(seed.observations / 2)),
      fillColor: seed.color,
      coordinates: organicCellCoordinates(centerLat, centerLng, 0.0025, 0.0022, index),
      highlights: [
        { title: '수변 녹지', body: '공원과 물길 주변 기록이 셀 점수를 끌어올렸습니다.' },
        { title: '도시 숲', body: '조류와 작은 포유류 관찰이 꾸준히 쌓이고 있습니다.' },
        { title: '산책로', body: '저녁 시간대 발견 기록이 가장 활발합니다.' },
      ],
      featuredSpecies: [
        { name: '참새', group: '조류', mark: '🐦' },
        { name: '청개구리', group: '양서류', mark: '🐸' },
        { name: '호랑나비', group: '곤충', mark: '🦋' },
        { name: '다람쥐', group: '포유류', mark: '🐿' },
      ],
    } satisfies MapHabitatCell;
  });
}

function toMapHabitatCells(cells: HabitatCell[]): MapHabitatCell[] {
  return cells.map((cell, index) => ({
    id: cell.id,
    label: cell.regionName?.trim() || cell.cellKey,
    centerLat: cell.centerLat,
    centerLng: cell.centerLng,
    bloomScore: cell.bloomScore,
    observationCount: cell.observationCount,
    speciesCount: cell.speciesCount,
    contributorCount: cell.contributorCount,
    fillColor: fillColorForScore(cell.bloomScore),
    coordinates: cell.boundaryCoordinates?.length
      ? cell.boundaryCoordinates
      : organicCellCoordinates(cell.centerLat, cell.centerLng, 0.0025, 0.0022, index),
    highlights: habitatHighlights(cell.habitatTypes ?? []),
    featuredSpecies: [],
    report: null,
  }));
}

function fillColorForScore(score: number) {
  if (score >= 80) return 'rgba(128, 181, 68, 0.64)';
  if (score >= 50) return 'rgba(164, 198, 126, 0.52)';
  if (score >= 20) return 'rgba(202, 213, 185, 0.48)';
  return 'rgba(207, 200, 188, 0.48)';
}

function habitatHighlights(types: string[]) {
  const source = types.join(' ');
  if (/LAKE|RIVER|WETLAND/.test(source)) {
    return [
      { title: '수변 서식지', body: '물가 주변 공개 기록이 이 셀의 핵심 단서입니다.' },
      { title: '조류 활동', body: '물길과 녹지 사이를 오가는 생물 기록을 볼 수 있습니다.' },
      { title: '습도 변화', body: '계절별 곤충과 식물 기록이 함께 쌓입니다.' },
    ];
  }
  return [
    { title: '도시 녹지', body: '작은 녹지와 산책 동선의 기록을 모았습니다.' },
    { title: '반복 관찰', body: '같은 지역의 발견이 누적될수록 셀 점수가 올라갑니다.' },
    { title: '공개 좌표', body: '정확 좌표 대신 셀 중심 좌표로 서식지를 보호합니다.' },
  ];
}

function organicCellCoordinates(
  centerLat: number,
  centerLng: number,
  latRadius: number,
  lngRadius: number,
  seed: number
) {
  const points = [
    [-0.96, -0.28],
    [-0.68, -0.88],
    [0.04, -1],
    [0.72, -0.74],
    [0.96, -0.08],
    [0.66, 0.78],
    [-0.02, 1],
    [-0.78, 0.66],
  ];

  return points.map(([latOffset, lngOffset], index) => {
    const wobble = 1 + (((seed + index) % 3) - 1) * 0.09;
    return {
      latitude: centerLat + latOffset * latRadius * wobble,
      longitude: centerLng + lngOffset * lngRadius * (2 - wobble),
    };
  });
}

function numberedDiscoveries(discoveries: MapDiscoveryResponse[]): MapDiscovery[] {
  return discoveries.map((discovery, index) => ({
    id: discovery.discoveryId,
    observationId: discovery.discoveryId,
    habitatCellId: discovery.habitatCellId,
    displayName: discovery.displayName,
    scientificName: discovery.scientificName,
    displayGroup: discovery.displayGroup,
    imageUrl: discovery.imageUrl,
    publicLat: discovery.publicLat,
    publicLng: discovery.publicLng,
    likeCount: discovery.likeCount,
    commentCount: discovery.commentCount,
    createdAt: discovery.capturedAt,
    distanceKm: discovery.distanceKm,
    contributorName: discovery.contributorName,
    regionName: discovery.regionName,
    discoveryNumber: discovery.codexNumber > 0 ? discovery.codexNumber : index + 1,
  }));
}

function dateLabel(value: string | null) {
  if (!value) {
    return '기록 시기 확인 중';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function categoryMeta(discovery: MapDiscovery) {
  const source = `${discovery.displayName} ${discovery.scientificName ?? ''} ${discovery.displayGroup}`.toLowerCase();
  if (discovery.displayGroup === 'PLANT') {
    return { label: '식물', mark: '🌿' };
  }
  if (discovery.displayGroup === 'INSECT' || /곤충|벌레|나비|잠자리|beetle|butterfly|insect|ladybug/.test(source)) {
    return { label: '곤충', mark: '🐞' };
  }
  if (['ANIMAL', 'BIRD', 'FISH', 'AMPHIBIAN', 'REPTILE', 'MAMMAL'].includes(discovery.displayGroup)) {
    return { label: '동물', mark: '🐾' };
  }
  return { label: '기타', mark: '✨' };
}

function emojiForDiscovery(discovery: MapDiscovery) {
  const source = `${discovery.displayName} ${discovery.scientificName ?? ''}`.toLowerCase();
  if (/수달|otter/.test(source)) return '🦦';
  if (/새|참새|조류|bird|sparrow/.test(source)) return '🐦';
  if (/나비|butterfly/.test(source)) return '🦋';
  if (/벌|무당벌레|beetle|ladybug/.test(source)) return '🐞';
  if (discovery.displayGroup === 'PLANT') return '🌿';
  if (discovery.displayGroup === 'INSECT') return '🐞';
  if (['ANIMAL', 'BIRD', 'FISH', 'AMPHIBIAN', 'REPTILE', 'MAMMAL'].includes(discovery.displayGroup)) return '🐾';
  return '✨';
}

export function MapHomeScreen() {
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const cardMotion = useRef(new Animated.Value(0)).current;
  const reportPanelMotion = useRef(new Animated.Value(0)).current;
  const [locationState, setLocationState] = useState<LocationState>({
    status: 'loading',
    location: null,
    message: null,
  });
  const [discoveryState, setDiscoveryState] = useState<DiscoveryState>({
    status: 'idle',
    discoveries: [],
    message: null,
  });
  const [cellState, setCellState] = useState<CellState>({
    status: 'idle',
    cells: [],
    message: null,
  });
  const [cellReports, setCellReports] = useState<Record<string, HabitatCellReport>>({});
  const [selectedDiscoveryId, setSelectedDiscoveryId] = useState<string | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  const region = useMemo(() => regionFromLocation(locationState), [locationState]);
  const habitatCells = useMemo(
    () => (cellState.status === 'ready' && cellState.cells.length > 0 ? cellState.cells : demoHabitatCells(region)),
    [cellState.cells, cellState.status, region]
  );
  const discoveries = useMemo(
    () => (discoveryState.status === 'ready' ? discoveryState.discoveries : demoDiscoveries(region)),
    [discoveryState.discoveries, region]
  );
  const selectedDiscovery = useMemo(
    () => discoveries.find((discovery) => discovery.id === selectedDiscoveryId) ?? null,
    [discoveries, selectedDiscoveryId]
  );
  const selectedCell = useMemo(
    () => {
      const cell = habitatCells.find((item) => item.id === selectedCellId) ?? null;
      return cell ? { ...cell, report: cellReports[cell.id] ?? cell.report ?? null } : null;
    },
    [cellReports, habitatCells, selectedCellId]
  );

  const showDiscovery = useCallback(
    (discovery: MapDiscovery) => {
      setSelectedDiscoveryId(discovery.id);
      mapRef.current?.animateToRegion(
        {
          latitude: discovery.publicLat,
          longitude: discovery.publicLng,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        },
        420
      );
    },
    [region.latitudeDelta, region.longitudeDelta]
  );

  const closeCellReport = useCallback(() => {
    Animated.timing(reportPanelMotion, {
      toValue: 0,
      duration: 220,
      easing: EasingOutCubic,
      useNativeDriver: true,
    }).start(() => setSelectedCellId(null));
  }, [reportPanelMotion]);

  const toggleCellReport = useCallback(
    async (cell: MapHabitatCell) => {
      if (selectedCellId === cell.id) {
        closeCellReport();
        return;
      }
      setSelectedCellId(cell.id);
      setSelectedDiscoveryId(null);
      mapRef.current?.animateToRegion(
        {
          latitude: cell.centerLat,
          longitude: cell.centerLng,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        },
        420
      );
      if (auth.session?.idToken && !cellReports[cell.id]) {
        try {
          const report = await getHabitatCellReport(auth.session.idToken, cell.id);
          setCellReports((current) => ({ ...current, [cell.id]: report }));
        } catch {
          setCellReports((current) => current);
        }
      }
    },
    [auth.session?.idToken, cellReports, closeCellReport, region.latitudeDelta, region.longitudeDelta, selectedCellId]
  );

  const moveToCurrentLocation = useCallback(() => {
    if (locationState.status !== 'granted') {
      return;
    }

    mapRef.current?.animateToRegion(regionFromLocation(locationState), 420);
  }, [locationState]);

  const loadLocation = useCallback(async () => {
    setLocationState({ status: 'loading', location: null, message: null });
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setLocationState({
          status: 'denied',
          location: null,
          message: '위치 권한이 있어야 내 위치를 지도에 표시할 수 있습니다.',
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

  const loadDiscoveries = useCallback(async () => {
    if (!auth.session?.idToken) {
      return;
    }

    setDiscoveryState((current) => ({
      status: 'loading',
      discoveries: current.discoveries,
      message: null,
    }));

    try {
      const query =
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
            };
      const nextDiscoveries = await getMapDiscoveries(auth.session.idToken, query);
      setDiscoveryState({ status: 'ready', discoveries: numberedDiscoveries(nextDiscoveries), message: null });
    } catch (error) {
      setDiscoveryState({
        status: 'error',
        discoveries: [],
        message: error instanceof Error ? error.message : '주변 발견 데이터를 불러오지 못했습니다.',
      });
    }
  }, [auth.session?.idToken, locationState]);

  const loadCells = useCallback(async () => {
    if (!auth.session?.idToken) {
      return;
    }

    setCellState((current) => ({
      status: 'loading',
      cells: current.cells,
      message: null,
    }));

    try {
      const query =
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
            };
      const nextCells = await getNearbyHabitatCells(auth.session.idToken, query);
      setCellState({ status: 'ready', cells: toMapHabitatCells(nextCells), message: null });
    } catch (error) {
      setCellState({
        status: 'error',
        cells: [],
        message: error instanceof Error ? error.message : '지역 셀 데이터를 불러오지 못했습니다.',
      });
    }
  }, [auth.session?.idToken, locationState]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    if (auth.status === 'authenticated') {
      loadDiscoveries();
      loadCells();
    }
  }, [auth.status, loadCells, loadDiscoveries]);

  useEffect(() => {
    if (locationState.status === 'granted') {
      mapRef.current?.animateToRegion(regionFromLocation(locationState), 520);
    }
  }, [locationState]);

  useEffect(() => {
    Animated.spring(cardMotion, {
      toValue: selectedDiscovery ? 1 : 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 150,
      mass: 0.8,
    }).start();
  }, [cardMotion, selectedDiscovery]);

  useEffect(() => {
    Animated.timing(reportPanelMotion, {
      toValue: selectedCell ? 1 : 0,
      duration: 320,
      easing: EasingOutCubic,
      useNativeDriver: true,
    }).start();
  }, [reportPanelMotion, selectedCell]);

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={locationState.status === 'granted'}
        showsMyLocationButton={false}
        mapType="standard"
      >
        {habitatCells.map((cell) => (
          <Marker
            key={`${cell.id}-flag`}
            coordinate={{ latitude: cell.centerLat, longitude: cell.centerLng }}
            anchor={{ x: 0.5, y: 0.95 }}
            onPress={() => toggleCellReport(cell)}
          >
            <HabitatFlagMarker label={cell.label} score={cell.bloomScore} selected={selectedCell?.id === cell.id} />
          </Marker>
        ))}
        {discoveries.map((discovery) => (
          <Marker
            key={discovery.id}
            coordinate={{ latitude: discovery.publicLat, longitude: discovery.publicLng }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => showDiscovery(discovery)}
          >
            <DiscoveryMarker discovery={discovery} selected={selectedDiscovery?.id === discovery.id} />
          </Marker>
        ))}
      </MapView>

      <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
        <View style={styles.topControls}>
          <MapControl symbol="▰" label="지도 보기" onPress={() => undefined} />
          <MapControl symbol="⌖" label="내 위치" onPress={moveToCurrentLocation} />
        </View>

        <View pointerEvents="box-none" style={styles.discoveryCardAnchor}>
          {selectedDiscovery && !selectedCell ? <DiscoveryCard discovery={selectedDiscovery} motion={cardMotion} /> : null}
        </View>

        {selectedCell ? (
          <CellEcologyReport
            cell={selectedCell}
            motion={reportPanelMotion}
            onClose={closeCellReport}
            style={{ bottom: Math.max(insets.bottom + 86, 108) }}
          />
        ) : null}

        <View pointerEvents="box-none" style={styles.statusAnchor}>
          {discoveryState.status === 'loading' ? (
            <View style={styles.statusPill}>
              <ActivityIndicator color={colors.canopy} size="small" />
              <Text style={styles.statusText}>발견 데이터 확인 중</Text>
            </View>
          ) : null}

          {discoveryState.status === 'ready' && discoveryState.discoveries.length === 0 ? (
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>주변 발견이 아직 없습니다</Text>
            </View>
          ) : null}

          {discoveryState.status === 'error' || locationState.status === 'denied' || locationState.status === 'error' ? (
            <Pressable accessibilityRole="button" style={styles.noticePill} onPress={discoveryState.status === 'error' ? loadDiscoveries : loadLocation}>
              <Text style={styles.noticeText} numberOfLines={2}>
                {discoveryState.message ?? locationState.message ?? '지도를 다시 확인해 주세요.'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const EasingOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

function DiscoveryMarker({ discovery, selected }: { discovery: MapDiscovery; selected: boolean }) {
  return (
    <View style={[styles.discoveryMarker, selected ? styles.discoveryMarkerSelected : null]}>
      <Text style={styles.discoveryEmoji}>{emojiForDiscovery(discovery)}</Text>
    </View>
  );
}

function HabitatFlagMarker({ label, score, selected }: { label: string; score: number; selected: boolean }) {
  return (
    <View style={[styles.flagMarker, selected ? styles.flagMarkerSelected : null]}>
      <View style={[styles.flagIcon, score >= 80 ? styles.flagIconStrong : null]}>
        <Text style={styles.flagSymbol}>⚑</Text>
      </View>
      <Text style={[styles.flagLabel, selected ? styles.flagLabelSelected : null]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function DiscoveryCard({ discovery, motion }: { discovery: MapDiscovery; motion: Animated.Value }) {
  const meta = categoryMeta(discovery);
  const translateY = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  return (
    <Animated.View
      style={[
        styles.discoveryCard,
        {
          opacity: motion,
          transform: [{ translateY }, { scale: motion.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.discoveryNumber}>#{String(discovery.discoveryNumber).padStart(3, '0')}</Text>
          <Text style={styles.discoveryName}>{discovery.displayName}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryMark}>{meta.mark}</Text>
          <Text style={styles.categoryText}>{meta.label}</Text>
        </View>
      </View>

      <Text style={styles.heroEmoji}>{emojiForDiscovery(discovery)}</Text>

      <View style={styles.cardMeta}>
        <Text style={styles.metaLabel}>잡은 시기</Text>
        <Text style={styles.metaValue}>{dateLabel(discovery.createdAt)}</Text>
      </View>
      <Text style={styles.finderText}>{discovery.contributorName} 이(가) 발견함!</Text>
    </Animated.View>
  );
}

function MapControl({ symbol, label, onPress }: { symbol: string; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" style={styles.mapControl} onPress={onPress}>
      <Text style={styles.mapControlText}>{symbol}</Text>
    </Pressable>
  );
}

function CellEcologyReport({
  cell,
  motion,
  onClose,
  style,
}: {
  cell: MapHabitatCell;
  motion: Animated.Value;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const reportHandleResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 36 || gesture.vy > 0.85) {
            onClose();
          }
        },
      }),
    [onClose]
  );

  const togglePanelTranslateY = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [94, 0],
  });
  const togglePanelOpacity = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const blurRadius = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 0],
  });

  return (
    <Animated.View
      style={[
        styles.reportPanel,
        style,
        {
          opacity: togglePanelOpacity,
          transform: [{ translateY: togglePanelTranslateY }],
        },
      ]}
    >
      <View {...reportHandleResponder.panHandlers} style={styles.reportHandleZone}>
        <View style={styles.reportHandle} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.reportContent}>
        <View style={styles.reportHero}>
          <View style={styles.reportTitleGroup}>
            <Text style={styles.reportLeaf}>☘</Text>
            <Text style={styles.reportTitle}>{cell.label}</Text>
            <Text style={styles.reportSubtitle}>생태 보고서</Text>
          </View>
          <Text style={styles.reportBird}>🐦</Text>
        </View>

        <Text style={styles.reportIntro}>{cell.report?.summary ?? '탐험가들의 기록을 모아 만든 지역 생태 보고서예요.'}</Text>

        <View style={styles.reportStats}>
          <ReportStat label="생태 점수" value={`${cell.bloomScore}`} suffix="/100" body={cell.bloomScore >= 80 ? '매우 건강해요' : '기록이 자라는 중'} />
          <ReportStat label="발견된 생물 수" value={`${cell.speciesCount}`} suffix="종" body={`총 ${Math.max(cell.speciesCount * 3, cell.observationCount)} 마리`} />
          <ReportStat label="탐험 기록 수" value={`${cell.observationCount}`} suffix="건" body="최근 30일 기준" />
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>지역 생태 특징</Text>
          <Text style={styles.reportBody}>
            {cell.report?.terrainDescription ?? `${cell.label}은 수변 환경과 공원 녹지가 맞닿은 셀로, 조류와 곤충 기록이 안정적으로 쌓이고 있습니다.`}
            정확 좌표는 숨기고 셀 단위 경향만 보여줘 서식지와 관찰자를 함께 보호합니다.
          </Text>
          <View style={styles.highlightRow}>
            {cell.highlights.map((item) => (
              <View key={item.title} style={styles.highlightCard}>
                <Text style={styles.highlightTitle}>{item.title}</Text>
                <Text style={styles.highlightBody}>{item.body}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>주요 발견 생물</Text>
          <View style={styles.speciesRow}>
            {(cell.report?.featuredSpecies.length
              ? cell.report.featuredSpecies.map((species) => ({
                  name: species.displayName,
                  group: speciesGroupLabel(species.displayGroup),
                  mark: markForDisplayGroup(species.displayGroup),
                }))
              : cell.featuredSpecies
            ).map((item) => (
              <View key={item.name} style={styles.speciesItem}>
                <Text style={styles.speciesMark}>{item.mark}</Text>
                <Text style={styles.speciesName}>{item.name}</Text>
                <Text style={styles.speciesGroup}>{item.group}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.reportActions}>
          <Pressable accessibilityRole="button" style={styles.closeReportButton} onPress={onClose}>
            <Text style={styles.closeReportText}>닫기</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.shareReportButton}>
            <Text style={styles.shareReportText}>공유하기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function ReportStat({ label, value, suffix, body }: { label: string; value: string; suffix: string; body: string }) {
  return (
    <View style={styles.reportStat}>
      <Text style={styles.reportStatLabel}>{label}</Text>
      <View style={styles.reportStatValueRow}>
        <Text style={styles.reportStatValue}>{value}</Text>
        <Text style={styles.reportStatSuffix}>{suffix}</Text>
      </View>
      <Text style={styles.reportStatBody}>{body}</Text>
    </View>
  );
}

function speciesGroupLabel(group: SpeciesDisplayGroup) {
  switch (group) {
    case 'PLANT':
      return '식물';
    case 'INSECT':
      return '곤충';
    case 'BIRD':
      return '조류';
    case 'FISH':
      return '어류';
    case 'AMPHIBIAN':
      return '양서류';
    case 'REPTILE':
      return '파충류';
    case 'MAMMAL':
      return '포유류';
    case 'FUNGI':
      return '균류';
    case 'ANIMAL':
      return '동물';
    case 'OTHER':
      return '기타';
  }
}

function markForDisplayGroup(group: SpeciesDisplayGroup) {
  switch (group) {
    case 'PLANT':
      return '🌿';
    case 'INSECT':
      return '🐞';
    case 'BIRD':
      return '🐦';
    case 'FISH':
      return '🐟';
    case 'AMPHIBIAN':
      return '🐸';
    case 'REPTILE':
      return '🦎';
    case 'MAMMAL':
      return '🐾';
    case 'FUNGI':
      return '🍄';
    case 'ANIMAL':
      return '🐾';
    case 'OTHER':
      return '✨';
  }
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
    paddingHorizontal: 28,
    paddingBottom: 112,
  },
  topControls: {
    alignSelf: 'flex-start',
    gap: 12,
    paddingTop: 82,
  },
  mapControl: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  mapControlText: {
    color: colors.muted,
    fontSize: 24,
    fontWeight: '800',
  },
  discoveryMarker: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.92)',
    backgroundColor: 'rgba(255, 210, 74, 0.92)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  discoveryMarkerSelected: {
    borderColor: colors.white,
    backgroundColor: 'rgba(255, 198, 45, 0.98)',
    transform: [{ scale: 1.12 }],
  },
  discoveryEmoji: {
    fontSize: 24,
  },
  flagMarker: {
    minWidth: 82,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  flagMarkerSelected: {
    transform: [{ scale: 1.08 }],
  },
  flagIcon: {
    width: 38,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.92)',
    backgroundColor: 'rgba(70, 121, 56, 0.94)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  flagIconStrong: {
    backgroundColor: 'rgba(99, 150, 37, 0.98)',
  },
  flagSymbol: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
  },
  flagLabel: {
    maxWidth: 96,
    overflow: 'hidden',
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 253, 244, 0.88)',
  },
  flagLabelSelected: {
    color: colors.canopy,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  discoveryCardAnchor: {
    position: 'absolute',
    top: 116,
    right: 24,
    width: 168,
  },
  discoveryCard: {
    minHeight: 162,
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: glass.border,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  discoveryNumber: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  discoveryName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  categoryBadge: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 233, 162, 0.72)',
  },
  categoryMark: {
    fontSize: 12,
  },
  categoryText: {
    color: colors.clay,
    fontSize: 10,
    fontWeight: '900',
  },
  heroEmoji: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 58,
    lineHeight: 66,
    textAlign: 'center',
  },
  cardMeta: {
    gap: 2,
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  metaValue: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
  },
  finderText: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
  },
  statusAnchor: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 118,
    gap: 8,
  },
  statusPill: {
    alignSelf: 'center',
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
  },
  statusText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  noticePill: {
    alignSelf: 'center',
    maxWidth: 300,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.76)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 248, 232, 0.9)',
  },
  noticeText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  reportPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 108,
    height: '76%',
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: 'rgba(255, 253, 244, 0.96)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
  },
  reportHandleZone: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 34,
    paddingTop: 8,
  },
  reportHandle: {
    width: 150,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(23, 34, 25, 0.16)',
  },
  reportContent: {
    gap: 16,
    padding: 18,
    paddingBottom: 24,
  },
  reportHero: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reportTitleGroup: {
    flex: 1,
  },
  reportLeaf: {
    color: colors.moss,
    fontSize: 24,
    fontWeight: '900',
  },
  reportTitle: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
  },
  reportSubtitle: {
    color: colors.moss,
    fontSize: 18,
    fontWeight: '900',
  },
  reportBird: {
    fontSize: 58,
    lineHeight: 66,
  },
  reportIntro: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '800',
  },
  reportStats: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
  },
  reportStat: {
    flex: 1,
    minHeight: 126,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  reportStatLabel: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  reportStatValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  reportStatValue: {
    color: colors.canopy,
    fontSize: 30,
    fontWeight: '900',
  },
  reportStatSuffix: {
    marginBottom: 5,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  reportStatBody: {
    color: colors.text,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  reportSection: {
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.08)',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
  },
  reportSectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  reportBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
  },
  highlightRow: {
    gap: 8,
  },
  highlightCard: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(223, 241, 207, 0.62)',
  },
  highlightTitle: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '900',
  },
  highlightBody: {
    marginTop: 3,
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  speciesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  speciesItem: {
    width: '47%',
    alignItems: 'center',
    gap: 4,
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(246, 251, 244, 0.8)',
  },
  speciesMark: {
    fontSize: 28,
    lineHeight: 32,
  },
  speciesName: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  speciesGroup: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 10,
  },
  closeReportButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
  },
  closeReportText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  shareReportButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.moss,
  },
  shareReportText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
});
