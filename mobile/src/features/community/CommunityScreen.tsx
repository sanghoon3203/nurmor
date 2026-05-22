import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard, GlassPanel, GradientScreen, RevealView } from '../atlas/glass';
import { StatusBadge } from '../atlas/ui';
import { useAuth } from '../auth/AuthProvider';
import { FirebaseCommunityDiscovery, listCommunityDiscoveries } from '../../services/firebaseAtlasDb';
import { bloomColors, colors, radii } from '../../theme/tokens';

type LocationStatus = 'loading' | 'granted' | 'denied' | 'error';
type FeedStatus = 'idle' | 'loading' | 'ready' | 'error';

type DiscoveryCard = {
  id: string;
  commonNameKo: string;
  scientificName: string;
  confidence: number;
  observedAtLabel: string;
  distanceMeters: number;
  contributorName: string | null;
  bloomState: string;
  cellLabel: string;
  evidence: string;
  likeCount: number;
  commentCount: number;
};

const sampleDiscoveries: DiscoveryCard[] = [
  {
    id: 'near-1',
    commonNameKo: '노랑나비로 추정',
    scientificName: 'Pieris rapae',
    confidence: 87,
    observedAtLabel: '18분 전',
    distanceMeters: 1240,
    contributorName: '김상훈',
    bloomState: 'GROWING',
    cellLabel: '성산동 서식지 셀',
    evidence: '날개 색과 무늬 패턴이 최근 기록과 유사합니다.',
    likeCount: 8,
    commentCount: 2,
  },
  {
    id: 'near-2',
    commonNameKo: '개망초',
    scientificName: 'Erigeron annuus',
    confidence: 92,
    observedAtLabel: '42분 전',
    distanceMeters: 860,
    contributorName: null,
    bloomState: 'SEEDED',
    cellLabel: '홍대입구 근처 셀',
    evidence: '꽃잎 형태와 계절성이 주변 관찰과 일치합니다.',
    likeCount: 5,
    commentCount: 0,
  },
  {
    id: 'near-3',
    commonNameKo: '직박구리',
    scientificName: 'Hypsipetes amaurotis',
    confidence: 90,
    observedAtLabel: '1시간 전',
    distanceMeters: 3120,
    contributorName: '지 민',
    bloomState: 'BLOOMED',
    cellLabel: '월드컵공원 방향 셀',
    evidence: '소리 패턴과 기존 도감 기록이 높은 유사도를 보입니다.',
    likeCount: 11,
    commentCount: 4,
  },
];

export function CommunityScreen() {
  const auth = useAuth();
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('loading');
  const [feedStatus, setFeedStatus] = useState<FeedStatus>('idle');
  const [feedMessage, setFeedMessage] = useState<string | null>(null);
  const [discoveries, setDiscoveries] = useState<DiscoveryCard[]>([]);
  const visibleDiscoveries = discoveries.length > 0 ? discoveries : sampleDiscoveries;
  const hasLiveFeed = discoveries.length > 0;

  useEffect(() => {
    let isMounted = true;

    async function checkLocation() {
      if (!auth.session?.idToken) {
        setLocationStatus('loading');
        setFeedStatus('idle');
        setDiscoveries([]);
        return;
      }

      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) {
          return;
        }
        if (permission.status !== 'granted') {
          setLocationStatus('denied');
          setFeedStatus('idle');
          setDiscoveries([]);
          return;
        }

        setLocationStatus('granted');
        setFeedStatus('loading');
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const nextDiscoveries = await listCommunityDiscoveries(auth.session.idToken, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          radiusKm: 5,
        });
        if (!isMounted) {
          return;
        }
        setDiscoveries(nextDiscoveries.map(toDiscoveryCard));
        setFeedStatus('ready');
        setFeedMessage(null);
      } catch {
        if (isMounted) {
          setLocationStatus('error');
          setFeedStatus('error');
          setFeedMessage('Firestore 커뮤니티 발견을 불러오지 못했습니다.');
          setDiscoveries([]);
        }
      }
    }

    checkLocation();

    return () => {
      isMounted = false;
    };
  }, [auth.session?.idToken]);

  return (
    <GradientScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.header}>
              <Text style={styles.kicker}>근방 5km 생태 소식</Text>
              <Text style={styles.title}>커뮤니티</Text>
              <Text style={styles.subtitle}>정확한 좌표 없이 셀 단위로 공개된 주변 발견만 보여줍니다.</Text>
            </View>
          </RevealView>

          <RevealView delay={80}>
            <GlassPanel tone="sky" contentStyle={styles.radiusPanel}>
              <View style={styles.radiusMark}>
                <Text style={styles.radiusMarkText}>5km</Text>
              </View>
              <View style={styles.radiusBody}>
                <Text style={styles.radiusTitle}>{statusTitle(locationStatus)}</Text>
                <Text style={styles.radiusCopy}>{statusCopy(locationStatus)}</Text>
              </View>
            </GlassPanel>
          </RevealView>

          <View style={styles.feedHeader}>
            <Text style={styles.sectionTitle}>최근 발견</Text>
            <StatusBadge label={hasLiveFeed ? 'Firestore 연결' : '셀 위치만 공개'} tone={hasLiveFeed ? 'blue' : 'green'} />
          </View>

          {feedStatus === 'loading' ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.canopy} />
              <Text style={styles.loadingText}>주변 발견을 동기화하는 중</Text>
            </View>
          ) : null}

          {visibleDiscoveries.map((item, index) => (
            <RevealView key={item.id} delay={140 + index * 70}>
              <DiscoveryCard item={item} />
            </RevealView>
          ))}

          {!hasLiveFeed ? (
            <GlassCard tone={feedStatus === 'error' ? 'bloom' : 'strong'}>
              <Text style={styles.noticeTitle}>{feedStatus === 'error' ? 'Firestore 연결 실패' : '미리보기 피드'}</Text>
              <Text style={styles.noticeBody}>
                {feedStatus === 'error'
                  ? feedMessage ?? 'Firebase 프로젝트와 Firestore 규칙을 확인해 주세요.'
                  : '아직 주변 5km 안에 공개된 Firestore 발견이 없어서 예시 카드로 커뮤니티 흐름을 보여줍니다.'}
              </Text>
            </GlassCard>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GradientScreen>
  );
}

function DiscoveryCard({ item }: { item: DiscoveryCard }) {
  return (
    <GlassCard tone="clear" contentStyle={styles.cardContent}>
      <View style={styles.cardTop}>
        <View style={[styles.speciesThumb, { backgroundColor: bloomColors[item.bloomState] ?? colors.mint }]}>
          <Text style={styles.speciesThumbText}>{item.commonNameKo.slice(0, 1)}</Text>
        </View>
        <View style={styles.cardTitleGroup}>
          <Text style={styles.cardTitle}>{item.commonNameKo}</Text>
          <Text style={styles.scientific}>{item.scientificName}</Text>
        </View>
        {item.confidence > 0 ? (
          <View style={styles.confidencePill}>
            <Text style={styles.confidenceText}>{item.confidence}%</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.evidence}>{item.evidence}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{formatDistance(item.distanceMeters)} 근처</Text>
        <Text style={styles.metaText}>{item.observedAtLabel}</Text>
        <Text style={styles.metaText}>{item.contributorName ?? '익명 관찰자'}</Text>
        <Text style={styles.metaText}>좋아요 {item.likeCount}</Text>
        <Text style={styles.metaText}>댓글 {item.commentCount}</Text>
      </View>

      <Pressable accessibilityRole="button" style={styles.cellButton}>
        <Text style={styles.cellButtonText}>{item.cellLabel}</Text>
      </Pressable>
    </GlassCard>
  );
}

function toDiscoveryCard(item: FirebaseCommunityDiscovery): DiscoveryCard {
  return {
    id: item.id,
    commonNameKo: item.displayName,
    scientificName: item.scientificName ?? item.category,
    confidence: 0,
    observedAtLabel: formatRelativeDate(item.createdAt),
    distanceMeters: Math.round(item.distanceKm * 1000),
    contributorName: item.contributorName,
    bloomState: item.category === 'PLANT' ? 'GROWING' : item.category === 'ANIMAL' ? 'BLOOMED' : 'SEEDED',
    cellLabel: item.cellKey ? `${item.cellKey} 셀` : '주변 서식지 셀',
    evidence: '공개 범위가 셀 단위로 설정된 주변 발견입니다.',
    likeCount: item.likeCount,
    commentCount: item.commentCount,
  };
}

function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

function formatRelativeDate(value: string | null) {
  if (!value) {
    return '방금 전';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) {
    return '방금 전';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }
  if (diffMinutes < 1440) {
    return `${Math.round(diffMinutes / 60)}시간 전`;
  }
  return `${Math.round(diffMinutes / 1440)}일 전`;
}

function statusTitle(status: LocationStatus) {
  if (status === 'granted') {
    return '현재 위치 기준';
  }
  if (status === 'denied') {
    return '위치 권한 필요';
  }
  if (status === 'error') {
    return '위치 확인 실패';
  }
  return '주변 범위 확인 중';
}

function statusCopy(status: LocationStatus) {
  if (status === 'granted') {
    return '내 주변 5km 안에서 공개된 발견을 모아 보여줍니다.';
  }
  if (status === 'denied') {
    return '권한을 허용하면 가까운 셀의 발견을 거리순으로 볼 수 있습니다.';
  }
  if (status === 'error') {
    return '지금은 미리보기 카드로 커뮤니티 흐름을 확인합니다.';
  }
  return '정확한 좌표는 공개하지 않고 셀 단위 거리만 사용합니다.';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 124,
  },
  header: {
    gap: 6,
    paddingTop: 8,
  },
  kicker: {
    color: colors.moss,
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    color: colors.canopy,
    fontSize: 40,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  radiusPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  radiusMark: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    backgroundColor: colors.canopy,
  },
  radiusMarkText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  radiusBody: {
    flex: 1,
    gap: 4,
  },
  radiusTitle: {
    color: colors.canopy,
    fontSize: 18,
    fontWeight: '900',
  },
  radiusCopy: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  loadingRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: radii.large,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
  },
  loadingText: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '900',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  cardContent: {
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speciesThumb: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.white,
  },
  speciesThumbText: {
    color: colors.canopy,
    fontSize: 22,
    fontWeight: '900',
  },
  cardTitleGroup: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  scientific: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  confidencePill: {
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.cream,
  },
  confidenceText: {
    color: colors.canopy,
    fontSize: 12,
    fontWeight: '900',
  },
  evidence: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    overflow: 'hidden',
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.canopy,
    fontSize: 11,
    fontWeight: '900',
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
  },
  cellButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
  },
  cellButtonText: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '900',
  },
  noticeTitle: {
    color: colors.canopy,
    fontSize: 16,
    fontWeight: '900',
  },
  noticeBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
});
