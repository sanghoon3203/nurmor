import * as Location from 'expo-location';
import { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientScreen, RevealView } from '../atlas/glass';
import { useAuth } from '../auth/AuthProvider';
import { FirebaseCommunityDiscovery, listCommunityDiscoveries } from '../../services/firebaseAtlasDb';
import { colors, radii } from '../../theme/tokens';

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
  imageUrl: string | null;
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
    cellLabel: '성산동 산책로',
    imageUrl: null,
    evidence: '성산동 산책로에서 노랑나비로 추정을 발견했어요! 🦋',
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
    cellLabel: '홍대입구 화단',
    imageUrl: null,
    evidence: '홍대입구 화단에서 개망초를 발견했어요! 🌼',
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
    cellLabel: '월드컵공원 숲길',
    imageUrl: null,
    evidence: '월드컵공원 숲길에서 직박구리를 발견했어요! 🐦',
    likeCount: 11,
    commentCount: 4,
  },
];

export function CommunityScreen() {
  const auth = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [feedStatus, setFeedStatus] = useState<FeedStatus>('idle');
  const [feedMessage, setFeedMessage] = useState<string | null>(null);
  const [discoveries, setDiscoveries] = useState<DiscoveryCard[]>([]);
  const visibleDiscoveries = discoveries.length > 0 ? discoveries : sampleDiscoveries;
  const hasLiveFeed = discoveries.length > 0;

  useEffect(() => {
    let isMounted = true;

    async function checkLocation() {
      if (!auth.session?.idToken) {
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
          setFeedStatus('idle');
          setDiscoveries([]);
          return;
        }

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
        <Animated.ScrollView
          contentContainerStyle={styles.content}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <RevealView>
            <View style={styles.header}>
              <Text style={styles.title}>커뮤니티</Text>
              <Text style={styles.subtitle}>탐험가들과 발견을 공유해요!</Text>
            </View>
          </RevealView>

          <View style={styles.feedHeader}>
            <Text style={styles.sectionTitle}>최근 발견</Text>
          </View>

          {feedStatus === 'loading' ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.canopy} />
              <Text style={styles.loadingText}>주변 발견을 동기화하는 중</Text>
            </View>
          ) : null}

          {visibleDiscoveries.map((item, index) => (
            <CardNewsReveal key={item.id} index={index} scrollY={scrollY}>
              <DiscoveryCard item={item} />
            </CardNewsReveal>
          ))}

          {!hasLiveFeed ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>{feedStatus === 'error' ? 'Firestore 연결 실패' : '미리보기 피드'}</Text>
              <Text style={styles.noticeBody}>
                {feedStatus === 'error'
                  ? feedMessage ?? 'Firebase 프로젝트와 Firestore 규칙을 확인해 주세요.'
                  : '아직 주변 5km 안에 공개된 Firestore 발견이 없어서 예시 카드로 커뮤니티 흐름을 보여줍니다.'}
              </Text>
            </View>
          ) : null}
        </Animated.ScrollView>
      </SafeAreaView>
    </GradientScreen>
  );
}

function CardNewsReveal({ children, index, scrollY }: { children: ReactNode; index: number; scrollY: Animated.Value }) {
  const inputStart = Math.max(0, index * 132 - 120);
  const translateY = scrollY.interpolate({
    inputRange: [inputStart, inputStart + 180, inputStart + 360],
    outputRange: [34, 0, -8],
    extrapolate: 'clamp',
  });
  const opacity = scrollY.interpolate({
    inputRange: [inputStart, inputStart + 160],
    outputRange: [0.76, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function DiscoveryCard({ item }: { item: DiscoveryCard }) {
  return (
    <View style={styles.card}>
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitial(item.contributorName)}</Text>
        </View>
        <View style={styles.userCopy}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{item.contributorName ?? '익명 탐험가'}</Text>
            <Text style={styles.levelBadge}>Lv.{Math.max(1, Math.round(item.confidence / 8))}</Text>
          </View>
          <Text style={styles.userMeta}>{item.observedAtLabel}</Text>
        </View>
      </View>

      <View style={styles.cardBodyRow}>
        <View style={styles.discoveryPhoto}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.discoveryImage} resizeMode="cover" />
          ) : (
            <Text style={styles.photoFallback}>{emojiForCard(item)}</Text>
          )}
        </View>

        <View style={styles.discoveryCopy}>
          <Text style={styles.cardTitle}>{item.commonNameKo}</Text>
          <Text style={styles.scientific}>{item.scientificName}</Text>
          <Text style={styles.evidence}>{item.evidence}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>⌖</Text>
            <Text style={styles.locationName}>{item.cellLabel}</Text>
          </View>
        </View>
      </View>

      <Pressable accessibilityRole="button" style={styles.moreButton}>
        <Text style={styles.moreText}>•••</Text>
      </Pressable>
    </View>
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
    imageUrl: item.imageUrl,
    evidence: `${item.cellKey ? `${item.cellKey} 셀` : '주변 서식지 셀'}에서 ${item.displayName}을 발견했어요! ${emojiForCategory(item.category, item.displayName)}`,
    likeCount: item.likeCount,
    commentCount: item.commentCount,
  };
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

function emojiForCard(item: DiscoveryCard) {
  return emojiForCategory(item.bloomState === 'GROWING' ? 'PLANT' : item.bloomState === 'BLOOMED' ? 'ANIMAL' : 'OTHER', item.commonNameKo);
}

function emojiForCategory(category: string, name: string) {
  if (/나비|butterfly/.test(name)) return '🦋';
  if (/꽃|개망초|풀|plant|flower/.test(name) || category === 'PLANT') return '🌼';
  if (/새|직박구리|bird/.test(name)) return '🐦';
  if (category === 'ANIMAL') return '🐾';
  return '✨';
}

function avatarInitial(name: string | null) {
  return (name ?? '탐').slice(0, 1);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 124,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 14,
    paddingBottom: 12,
  },
  title: {
    color: colors.moss,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '800',
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
    fontSize: 20,
    fontWeight: '900',
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.06)',
    padding: 16,
    backgroundColor: '#FDF8F2',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(109, 175, 69, 0.16)',
  },
  avatarText: {
    color: colors.moss,
    fontSize: 18,
    fontWeight: '900',
  },
  userCopy: {
    flex: 1,
    gap: 2,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  levelBadge: {
    overflow: 'hidden',
    borderRadius: radii.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: colors.moss,
    fontSize: 12,
    fontWeight: '900',
    backgroundColor: 'rgba(185, 227, 127, 0.35)',
  },
  userMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  cardBodyRow: {
    flexDirection: 'row',
    gap: 14,
  },
  discoveryPhoto: {
    width: 100,
    height: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(223, 241, 207, 0.76)',
  },
  discoveryImage: {
    width: '100%',
    height: '100%',
  },
  photoFallback: {
    fontSize: 46,
    lineHeight: 54,
  },
  discoveryCopy: {
    flex: 1,
    minHeight: 100,
    gap: 5,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  scientific: {
    color: 'rgba(97, 113, 95, 0.58)',
    fontSize: 12,
    fontWeight: '300',
  },
  evidence: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  locationIcon: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '900',
  },
  locationName: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  moreButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 34,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    color: colors.muted,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },
  noticeCard: {
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.06)',
    padding: 16,
    backgroundColor: '#FDF8F2',
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
