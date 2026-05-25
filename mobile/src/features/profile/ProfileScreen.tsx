import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard, GlassPanel, GradientScreen, RevealView } from '../atlas/glass';
import { useAuth } from '../auth/AuthProvider';
import {
  getRecentObservations,
  getUserFootprints,
  getUserProfile,
  getUserStats,
  RecentObservationResponse,
  UserFootprintCell,
  UserProfileResponse,
  UserStatsResponse,
} from '../../services/api';
import { colors, glass, radii } from '../../theme/tokens';

type ReportStat = {
  label: string;
  value: number;
  suffix?: string;
};

type FootprintStat = {
  habitatCellId: string;
  label: string;
  reportCount: number;
  intensity: number;
  color: string;
};

export function ProfileScreen() {
  const auth = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [userStats, setUserStats] = useState<UserStatsResponse | null>(null);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [footprintCells, setFootprintCells] = useState<UserFootprintCell[]>([]);
  const [recentObservations, setRecentObservations] = useState<RecentObservationResponse[]>([]);
  const [discoveryStatus, setDiscoveryStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const displayName = profile?.displayName ?? (auth.status === 'authenticated' ? 'Atlas 탐험가' : '로그인 확인 중');
  const footprintStats = useMemo(() => buildFootprintStats(footprintCells), [footprintCells]);
  const recentDiscoveries = useMemo(() => recentObservations.slice(0, 5), [recentObservations]);
  const mainActivityCell = footprintStats[0]?.label ?? '공개한 기록 없음';
  const reportStats: ReportStat[] = [
    { label: '보고 횟수', value: userStats?.reportCount ?? 0 },
    { label: '발견 생물', value: userStats?.discoveredSpeciesCount ?? 0, suffix: '종' },
    { label: '업적 달성', value: userStats?.achievementCount ?? 0, suffix: '개' },
    { label: '탐험한 지역', value: footprintStats.length, suffix: '곳' },
  ];

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!auth.session?.idToken || !auth.session.localId) {
        setProfile(null);
        setUserStats(null);
        setProfileStatus('idle');
        setProfileMessage(null);
        return;
      }

      setProfileStatus('loading');
      setProfileMessage(null);
      try {
        const [nextProfile, nextStats] = await Promise.all([
          getUserProfile(auth.session.idToken),
          getUserStats(auth.session.idToken),
        ]);
        if (!isMounted) {
          return;
        }
        setProfile(nextProfile);
        setUserStats(nextStats);
        setProfileStatus('ready');
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setProfile(null);
        setUserStats(null);
        setProfileStatus('error');
        setProfileMessage(error instanceof Error ? error.message : 'Atlas 프로필을 불러오지 못했습니다.');
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [auth.session?.idToken, auth.session?.localId]);

  useEffect(() => {
    let isMounted = true;

    async function loadDiscoveries() {
      if (!auth.session?.idToken || !auth.session.localId) {
        setFootprintCells([]);
        setRecentObservations([]);
        setDiscoveryStatus('idle');
        return;
      }

      setDiscoveryStatus('loading');
      try {
        const [footprints, recent] = await Promise.all([
          getUserFootprints(auth.session.idToken),
          getRecentObservations(auth.session.idToken),
        ]);
        if (!isMounted) {
          return;
        }
        setFootprintCells(footprints);
        setRecentObservations(recent);
        setDiscoveryStatus('ready');
      } catch {
        if (!isMounted) {
          return;
        }
        setFootprintCells([]);
        setRecentObservations([]);
        setDiscoveryStatus('error');
      }
    }

    loadDiscoveries();

    return () => {
      isMounted = false;
    };
  }, [auth.session?.idToken, auth.session?.localId]);

  return (
    <GradientScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.header}>
              <Text style={styles.title}>마이페이지 🌱</Text>
              <Text style={styles.subtitle}>나의 탐험 기록을 확인해보세요.</Text>
            </View>
          </RevealView>

          <RevealView delay={80}>
            <GlassPanel tone="green" contentStyle={styles.profilePanel}>
              <View style={styles.avatar}>
                {profile?.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
                )}
              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileMeta}>기여자 표시: {profile?.publicContributor ? '이름 표시' : '익명'}</Text>
                <View style={styles.activityPill}>
                  <Text style={styles.activityLabel}>공개한 기록 기준</Text>
                  <Text style={styles.activityValue}>{mainActivityCell}</Text>
                </View>
              </View>
            </GlassPanel>
          </RevealView>

          <RevealView delay={140}>
            <View style={styles.reportGrid}>
              {reportStats.map((item) => (
                <ReportBox key={item.label} stat={item} />
              ))}
            </View>
          </RevealView>

          <RevealView delay={200}>
            <GlassCard tone="strong">
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>발자국 통계</Text>
                  <Text style={styles.sectionSubtitle}>공개 또는 셀 공개로 심은 내 기록만 위치별로 모았어요.</Text>
                </View>
                <Text style={styles.syncState}>{discoveryStatus === 'loading' ? '확인 중' : `${footprintStats.length}곳`}</Text>
              </View>
              <FootprintHeatmap items={footprintStats} />
            </GlassCard>
          </RevealView>

          <RevealView delay={260}>
            <GlassCard tone="sky">
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>최근 발견 기록</Text>
                  <Text style={styles.sectionSubtitle}>현재 데이터 규격에서 확인 가능한 공개 기록이에요.</Text>
                </View>
              </View>
              <RecentDiscoveryStrip discoveries={recentDiscoveries} />
            </GlassCard>
          </RevealView>

          {profileStatus === 'error' ? (
            <GlassCard tone="bloom">
              <Text style={styles.errorTitle}>프로필 동기화 오류</Text>
              <Text style={styles.cardBody}>{profileMessage}</Text>
            </GlassCard>
          ) : null}

          {auth.errorMessage ? (
            <GlassCard tone="bloom">
              <Text style={styles.errorTitle}>인증 오류</Text>
              <Text style={styles.cardBody}>{auth.errorMessage}</Text>
            </GlassCard>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GradientScreen>
  );
}

function ReportBox({ stat }: { stat: ReportStat }) {
  return (
    <View style={styles.reportBox}>
      <Text style={styles.reportValue}>
        {stat.value}
        {stat.suffix ? <Text style={styles.reportSuffix}> {stat.suffix}</Text> : null}
      </Text>
      <Text style={styles.reportLabel}>{stat.label}</Text>
    </View>
  );
}

function FootprintHeatmap({ items }: { items: FootprintStat[] }) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>공개한 발자국이 아직 없어요</Text>
        <Text style={styles.emptyBody}>기록을 셀 단위 이상으로 공개하면 이곳에 위치별 통계가 쌓입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.footprintWrap}>
      <View style={styles.footprintGrid}>
        {items.map((item) => (
          <View key={item.habitatCellId} style={[styles.footprintCell, { backgroundColor: item.color }]}>
            <Text style={styles.footprintLabel}>{item.label}</Text>
            <Text style={styles.footprintCount}>{item.reportCount}회</Text>
          </View>
        ))}
      </View>
      <View style={styles.legendRow}>
        <Text style={styles.legendText}>적음</Text>
        <View style={styles.legendTrack}>
          <View style={[styles.legendBlock, { backgroundColor: colorForFootprintIntensity(0.2) }]} />
          <View style={[styles.legendBlock, { backgroundColor: colorForFootprintIntensity(0.4) }]} />
          <View style={[styles.legendBlock, { backgroundColor: colorForFootprintIntensity(0.6) }]} />
          <View style={[styles.legendBlock, { backgroundColor: colorForFootprintIntensity(0.8) }]} />
          <View style={[styles.legendBlock, { backgroundColor: colorForFootprintIntensity(1) }]} />
        </View>
        <Text style={styles.legendText}>많음</Text>
      </View>
    </View>
  );
}

function RecentDiscoveryStrip({ discoveries }: { discoveries: RecentObservationResponse[] }) {
  if (discoveries.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>최근 공개 발견이 없어요</Text>
        <Text style={styles.emptyBody}>비공개 기록은 현재 프로필 최근 목록에 표시하지 않습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentStrip}>
      {discoveries.map((discovery) => (
        <View key={discovery.observationId} style={styles.recentItem}>
          <View style={styles.recentThumb}>
            <Text style={styles.recentFallback}>{emojiForDiscovery(discovery)}</Text>
          </View>
          <Text numberOfLines={1} style={styles.recentName}>
            {discovery.displayName}
          </Text>
          <Text numberOfLines={1} style={styles.recentLocation}>
            {cellKeyLabel(discovery.habitatCellId)}
          </Text>
          <Text style={styles.recentDate}>{shortDate(discovery.capturedAt)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function buildFootprintStats(footprints: UserFootprintCell[]): FootprintStat[] {
  return footprints.slice(0, 8).map((footprint) => ({
    habitatCellId: footprint.habitatCellId,
    label: footprint.regionName,
    reportCount: footprint.reportCount,
    intensity: footprint.intensity,
    color: colorForFootprintIntensity(footprint.intensity),
  }));
}

function colorForFootprintIntensity(value: number) {
  const alpha = 0.28 + Math.max(0, Math.min(1, value)) * 0.58;
  return `rgba(22, 63, 45, ${alpha.toFixed(2)})`;
}

function cellKeyLabel(habitatCellId: string) {
  if (habitatCellId.length <= 8) {
    return habitatCellId;
  }
  return `지역 ${habitatCellId.slice(0, 8)}`;
}

function shortDate(value: string | null) {
  if (!value) {
    return '날짜 확인 중';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function emojiForDiscovery(discovery: RecentObservationResponse) {
  const source = discovery.displayName.toLowerCase();
  if (/새|참새|bird|sparrow/.test(source)) return '🐦';
  if (/개구리|frog/.test(source)) return '🐸';
  if (/나비|butterfly/.test(source)) return '🦋';
  if (/곤충|벌레|beetle|insect/.test(source)) return '🐞';
  if (/꽃|풀|나무|식물/.test(source)) return '🌿';
  return '✨';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 18,
    paddingBottom: 124,
  },
  header: {
    alignItems: 'center',
    gap: 7,
    paddingTop: 16,
  },
  title: {
    color: colors.canopy,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  profilePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  avatar: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 56,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.86)',
    backgroundColor: colors.canopy,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '900',
  },
  profileCopy: {
    flex: 1,
    gap: 9,
  },
  profileName: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '900',
  },
  profileMeta: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  activityPill: {
    alignSelf: 'flex-start',
    gap: 3,
    borderRadius: radii.medium,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: 'rgba(253, 248, 242, 0.82)',
  },
  activityLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  activityValue: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '900',
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  reportBox: {
    width: '50%',
    minHeight: 104,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderColor: 'rgba(22, 63, 45, 0.08)',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 12,
  },
  reportValue: {
    color: colors.canopy,
    fontSize: 28,
    fontWeight: '900',
  },
  reportSuffix: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  reportLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  sectionSubtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  syncState: {
    minWidth: 62,
    overflow: 'hidden',
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.canopy,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    backgroundColor: 'rgba(223, 241, 207, 0.74)',
  },
  footprintWrap: {
    gap: 12,
  },
  footprintGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footprintCell: {
    width: '48%',
    minHeight: 72,
    justifyContent: 'space-between',
    borderRadius: radii.medium,
    padding: 12,
  },
  footprintLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  footprintCount: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  legendTrack: {
    flex: 1,
    height: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 5,
  },
  legendBlock: {
    flex: 1,
  },
  recentStrip: {
    gap: 14,
    paddingRight: 4,
  },
  recentItem: {
    width: 92,
    gap: 4,
  },
  recentThumb: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 239, 181, 0.88)',
  },
  recentImage: {
    width: '100%',
    height: '100%',
  },
  recentFallback: {
    fontSize: 31,
    lineHeight: 36,
  },
  recentName: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  recentLocation: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  recentDate: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  emptyState: {
    gap: 5,
    borderRadius: radii.medium,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '900',
  },
  cardBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
});
