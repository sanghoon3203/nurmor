import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthProvider';
import { FirebaseCommunityDiscovery, listCommunityDiscoveries } from '../../services/firebaseAtlasDb';
import { colors, glass } from '../../theme/tokens';
import { LocationState } from './types';

type DiscoveryState =
  | { status: 'idle'; discoveries: MapDiscovery[]; message: null }
  | { status: 'loading'; discoveries: MapDiscovery[]; message: null }
  | { status: 'ready'; discoveries: MapDiscovery[]; message: null }
  | { status: 'error'; discoveries: MapDiscovery[]; message: string };

type MapDiscovery = FirebaseCommunityDiscovery & {
  discoveryNumber: number;
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
    { name: '수달', category: 'ANIMAL' as const, contributor: 'hy.19', lat: 0.0018, lng: -0.0014, createdAt: '2026-05-22T11:34:00.000Z' },
    { name: '참새', category: 'ANIMAL' as const, contributor: '새벽관찰자', lat: -0.0028, lng: 0.0026, createdAt: '2026-05-18T08:12:00.000Z' },
    { name: '민들레', category: 'PLANT' as const, contributor: '초록손', lat: 0.0042, lng: 0.003, createdAt: '2026-04-29T15:21:00.000Z' },
    { name: '무당벌레', category: 'OTHER' as const, contributor: '곤충기록자', lat: -0.0044, lng: -0.002, createdAt: '2026-05-04T10:05:00.000Z' },
  ];

  return items.map((item, index) => ({
    id: `demo-discovery-${index + 1}`,
    observationId: `demo-observation-${index + 1}`,
    cellKey: `demo-cell-${index + 1}`,
    userId: `demo-user-${index + 1}`,
    contributorName: item.contributor,
    displayName: item.name,
    scientificName: null,
    category: item.category,
    imageUrl: null,
    publicLat: region.latitude + item.lat,
    publicLng: region.longitude + item.lng,
    likeCount: index + 2,
    commentCount: index,
    createdAt: item.createdAt,
    distanceKm: Math.round((index + 1) * 3) / 10,
    discoveryNumber: index + 1,
  }));
}

function numberedDiscoveries(discoveries: FirebaseCommunityDiscovery[]): MapDiscovery[] {
  return discoveries.map((discovery, index) => ({
    ...discovery,
    discoveryNumber: index + 1,
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

function categoryMeta(discovery: FirebaseCommunityDiscovery) {
  const source = `${discovery.displayName} ${discovery.scientificName ?? ''}`.toLowerCase();
  if (discovery.category === 'PLANT') {
    return { label: '식물', mark: '🌿' };
  }
  if (/곤충|벌레|나비|잠자리|beetle|butterfly|insect|ladybug/.test(source)) {
    return { label: '곤충', mark: '🐞' };
  }
  if (discovery.category === 'ANIMAL') {
    return { label: '동물', mark: '🐾' };
  }
  return { label: '기타', mark: '✨' };
}

function emojiForDiscovery(discovery: FirebaseCommunityDiscovery) {
  const source = `${discovery.displayName} ${discovery.scientificName ?? ''}`.toLowerCase();
  if (/수달|otter/.test(source)) return '🦦';
  if (/새|참새|조류|bird|sparrow/.test(source)) return '🐦';
  if (/나비|butterfly/.test(source)) return '🦋';
  if (/벌|무당벌레|beetle|ladybug/.test(source)) return '🐞';
  if (discovery.category === 'PLANT') return '🌿';
  if (discovery.category === 'ANIMAL') return '🐾';
  return '✨';
}

export function MapHomeScreen() {
  const auth = useAuth();
  const mapRef = useRef<MapView | null>(null);
  const cardMotion = useRef(new Animated.Value(0)).current;
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
  const [selectedDiscoveryId, setSelectedDiscoveryId] = useState<string | null>(null);

  const region = useMemo(() => regionFromLocation(locationState), [locationState]);
  const discoveries = useMemo(
    () => (discoveryState.status === 'ready' ? discoveryState.discoveries : demoDiscoveries(region)),
    [discoveryState.discoveries, region]
  );
  const selectedDiscovery = useMemo(
    () => discoveries.find((discovery) => discovery.id === selectedDiscoveryId) ?? null,
    [discoveries, selectedDiscoveryId]
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
      const nextDiscoveries = await listCommunityDiscoveries(
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
      setDiscoveryState({ status: 'ready', discoveries: numberedDiscoveries(nextDiscoveries), message: null });
    } catch (error) {
      setDiscoveryState({
        status: 'error',
        discoveries: [],
        message: error instanceof Error ? error.message : '주변 발견 데이터를 불러오지 못했습니다.',
      });
    }
  }, [auth.session?.idToken, locationState]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    if (auth.status === 'authenticated') {
      loadDiscoveries();
    }
  }, [auth.status, loadDiscoveries]);

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
          {selectedDiscovery ? <DiscoveryCard discovery={selectedDiscovery} motion={cardMotion} /> : null}
        </View>

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

function DiscoveryMarker({ discovery, selected }: { discovery: FirebaseCommunityDiscovery; selected: boolean }) {
  return (
    <View style={[styles.discoveryMarker, selected ? styles.discoveryMarkerSelected : null]}>
      <Text style={styles.discoveryEmoji}>{emojiForDiscovery(discovery)}</Text>
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
});
