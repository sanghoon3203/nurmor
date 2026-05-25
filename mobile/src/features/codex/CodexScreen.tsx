import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientScreen, RevealView } from '../atlas/glass';
import { codexEntries } from '../atlas/mockData';
import { useAuth } from '../auth/AuthProvider';
import { useObservationFlow } from '../observation/ObservationFlowProvider';
import { FirebaseCodexEntry, listCodexEntries } from '../../services/firebaseAtlasDb';
import { SpeciesCard, SpeciesDisplayGroup } from '../../types/species';
import { colors, radii } from '../../theme/tokens';
import { bookkFonts, fontWeights } from '../../theme/typography';
import {
  CodexFamily,
  codexFilters,
  toDisplayNumber,
} from './codexViewModel';
import { firebaseCodexToSpeciesCard, sampleCodexToSpeciesCard, toSpeciesCard } from './codexMapper';
import { SpeciesCodexCard } from './SpeciesCodexCard';

type RemoteStatus = 'idle' | 'loading' | 'ready' | 'error';
type SortMode = 'RECENT' | 'OLDEST';

const sampleEntries: Array<{
  id: string;
  title: string;
  scientificName: string;
  category: string;
  date: string;
  place: string;
}> = [
  { id: 'sample-sparrow', title: '참새', scientificName: 'Passer montanus', category: 'ANIMAL', date: '2024.04.21', place: '잠실 3동' },
  { id: 'sample-chipmunk', title: '다람쥐', scientificName: 'Tamias sibiricus', category: 'ANIMAL', date: '2024.04.19', place: '잠실 4동' },
  { id: 'sample-otter', title: '수달', scientificName: 'Lutra lutra', category: 'ANIMAL', date: '2024.04.18', place: '석촌호수' },
  { id: 'sample-beetle', title: '장수풍뎅이', scientificName: 'Allomyrina dichotoma', category: 'OTHER', date: '2024.04.16', place: '잠실 2동' },
  { id: 'sample-frog', title: '청개구리', scientificName: 'Hyla japonica', category: 'ANIMAL', date: '2024.04.14', place: '올림픽공원' },
  { id: 'sample-hedgehog', title: '고슴도치', scientificName: 'Erinaceus amurensis', category: 'ANIMAL', date: '2024.04.13', place: '방이동 먹자골목' },
  { id: 'sample-maple', title: '단풍나무', scientificName: 'Acer palmatum', category: 'PLANT', date: '2024.04.10', place: '몽촌토성' },
  { id: 'sample-minnow', title: '참붕어', scientificName: 'Pseudorasbora parva', category: 'ANIMAL', date: '2024.04.08', place: '성내천' },
];

export function CodexScreen() {
  const auth = useAuth();
  const flow = useObservationFlow();
  const [filter, setFilter] = useState<CodexFamily>('ALL');
  const [remoteEntries, setRemoteEntries] = useState<FirebaseCodexEntry[]>([]);
  const [remoteStatus, setRemoteStatus] = useState<RemoteStatus>('idle');
  const [remoteMessage, setRemoteMessage] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('RECENT');

  useEffect(() => {
    let isMounted = true;

    async function loadEntries() {
      if (!auth.session?.idToken) {
        setRemoteEntries([]);
        setRemoteStatus('idle');
        setRemoteMessage(null);
        return;
      }

      setRemoteStatus('loading');
      setRemoteMessage(null);
      try {
        const nextEntries = await listCodexEntries(auth.session.idToken);
        if (!isMounted) {
          return;
        }
        setRemoteEntries(nextEntries);
        setRemoteStatus('ready');
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setRemoteEntries([]);
        setRemoteStatus('error');
        setRemoteMessage(error instanceof Error ? error.message : 'Firestore 도감 기록을 불러오지 못했습니다.');
      }
    }

    loadEntries();

    return () => {
      isMounted = false;
    };
  }, [auth.session?.idToken]);

  const cards = useMemo(() => {
    if (flow.state.codexEntries.length > 0) {
      return flow.state.codexEntries.map((entry) => toSpeciesCard(entry, { regionName: '현재 셀' }));
    }
    if (remoteEntries.length > 0) {
      return remoteEntries.map(firebaseCodexToSpeciesCard);
    }
    if (codexEntries.length > 0) {
      return sampleEntries.map(sampleCodexToSpeciesCard);
    }
    return [];
  }, [flow.state.codexEntries, remoteEntries]);

  const filteredCards = useMemo(() => sortSpeciesCards(filterSpeciesCards(cards, filter), sortMode), [cards, filter, sortMode]);
  const counts = useMemo(() => countByFamily(cards), [cards]);
  const selectedLabel = codexFilters.find((item) => item.value === filter)?.label ?? '전체';
  const hasLiveEntries = flow.state.codexEntries.length > 0 || remoteEntries.length > 0;

  return (
    <GradientScreen style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.header}>
              <Text style={styles.title}>도감</Text>
              <Text style={styles.subtitle}>내가 근처에서 발견한 도감들</Text>
            </View>
          </RevealView>

          <RevealView delay={70}>
            <View style={styles.filterBar}>
              {codexFilters.map((item) => {
                const selected = filter === item.value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={selected ? { selected: true } : {}}
                    key={item.value}
                    onPress={() => setFilter(item.value)}
                    style={({ pressed }) => [styles.filterChip, selected ? styles.filterChipSelected : null, pressed ? styles.filterChipPressed : null]}
                  >
                    <Text style={[styles.filterLabel, selected ? styles.filterLabelSelected : null]} numberOfLines={1}>
                      {item.label} {counts[item.value]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </RevealView>

          <RevealView delay={110}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>
                {selectedLabel} {filteredCards.length}종
              </Text>
              <View style={styles.toolbarGroup}>
                <LatestSortMenu sortMode={sortMode} onChange={setSortMode} />
              </View>
            </View>
          </RevealView>

          <View style={styles.unifiedList}>
            {filteredCards.map((entry, index) => (
              <RevealView key={`${filter}-${entry.codexEntryId}`} delay={120 + Math.min(index, 8) * 45} style={styles.unifiedItem}>
                <SpeciesCodexCard
                  data={entry}
                  onFollow={(id) => console.log('Follow:', id)}
                  onPress={openCodexDetail}
                />
              </RevealView>
            ))}
          </View>

          {filteredCards.length === 0 ? (
            <RevealView delay={160}>
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>{selectedLabel} 기록이 아직 없습니다.</Text>
                <Text style={styles.emptyBody}>기록 탭에서 관찰을 심으면 이 필터에 도감 카드가 쌓입니다.</Text>
                <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => router.push('/(tabs)/record')}>
                  <Text style={styles.primaryButtonText}>기록 심기</Text>
                </Pressable>
              </View>
            </RevealView>
          ) : null}

          {!hasLiveEntries ? (
            <RevealView delay={220}>
              <View style={styles.previewNotice}>
                <Text style={styles.previewTitle}>{remoteStatus === 'error' ? 'Firestore 도감 연결 실패' : '미리보기 도감입니다'}</Text>
                <Text style={styles.previewBody}>
                  {remoteStatus === 'error'
                    ? remoteMessage ?? 'Firebase 프로젝트와 Firestore 권한을 확인해 주세요.'
                    : '실제 기록을 심으면 이 화면이 내 관찰 도감으로 바뀝니다.'}
                </Text>
              </View>
            </RevealView>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GradientScreen>
  );
}

function openCodexDetail(entry: SpeciesCard) {
  const family = familyFromDisplayGroup(entry.displayGroup);
  router.push({
    pathname: '/codex-detail',
    params: {
      id: entry.codexEntryId,
      displayNumber: toDisplayNumber(Math.max(0, entry.codexNumber - 1)),
      title: entry.displayName,
      scientificName: entry.scientificName ?? entry.displayName,
      speciesKey: entry.scientificName ?? entry.displayName,
      category: family,
      categoryLabel: groupLabel(entry.displayGroup),
      date: formatSpeciesDate(entry.lastObservedAt),
      place: entry.regionName,
      imageUrl: entry.imageUrl ?? '',
      description: entry.description,
      observationCount: String(entry.observationCount),
    },
  });
}

function LatestSortMenu({ sortMode, onChange }: { sortMode: SortMode; onChange: (mode: SortMode) => void }) {
  return (
    <View style={styles.sortMenu}>
      {[
        { value: 'RECENT' as const, label: '최근' },
        { value: 'OLDEST' as const, label: '오래된' },
      ].map((item) => {
        const selected = sortMode === item.value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={selected ? { selected: true } : {}}
            key={item.value}
            onPress={() => onChange(item.value)}
            style={({ pressed }) => [styles.sortChip, selected ? styles.sortChipSelected : null, pressed ? styles.filterChipPressed : null]}
          >
            <Text style={[styles.sortText, selected ? styles.sortTextSelected : null]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function filterSpeciesCards(cards: SpeciesCard[], filter: CodexFamily) {
  if (filter === 'ALL') {
    return cards;
  }
  return cards.filter((card) => familyFromDisplayGroup(card.displayGroup) === filter);
}

function sortSpeciesCards(cards: SpeciesCard[], sortMode: SortMode) {
  const sorted = [...cards].sort((left, right) => observedTime(right) - observedTime(left));
  return sortMode === 'RECENT' ? sorted : sorted.reverse();
}

function observedTime(card: SpeciesCard) {
  const value = card.lastObservedAt ?? card.firstObservedAt;
  if (!value) {
    return 0;
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function countByFamily(cards: SpeciesCard[]) {
  return codexFilters.reduce<Record<CodexFamily, number>>(
    (next, item) => ({
      ...next,
      [item.value]: item.value === 'ALL' ? cards.length : cards.filter((card) => familyFromDisplayGroup(card.displayGroup) === item.value).length,
    }),
    { ALL: 0, PLANT: 0, ANIMAL: 0, FISH: 0, INSECT: 0, OTHER: 0 }
  );
}

function formatSpeciesDate(value: string | null) {
  if (!value) {
    return '날짜 없음';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function familyFromDisplayGroup(group: SpeciesDisplayGroup): Exclude<CodexFamily, 'ALL'> {
  if (group === 'PLANT') return 'PLANT';
  if (group === 'FISH') return 'FISH';
  if (group === 'INSECT') return 'INSECT';
  if (group === 'OTHER' || group === 'FUNGI') return 'OTHER';
  return 'ANIMAL';
}

function groupLabel(group: SpeciesDisplayGroup) {
  const family = familyFromDisplayGroup(group);
  return codexFilters.find((item) => item.value === family)?.label ?? '기타';
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.paper,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 126,
  },
  header: {
    alignItems: 'center',
    gap: 7,
    paddingTop: 4,
    paddingBottom: 18,
  },
  title: {
    fontFamily: bookkFonts.light,
    color: colors.moss,
    fontSize: 24,
    letterSpacing: 0,
  },
  subtitle: {
    ...fontWeights.light,
    color: colors.muted,
    fontSize: 15,
  },
  filterBar: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingBottom: 18,
  },
  filterChip: {
    flex: 1,
    minWidth: 0,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(22, 63, 45, 0.06)',
    paddingHorizontal: 3,
    backgroundColor: '#F0F0F0',
    shadowColor: colors.shadow,
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  filterChipSelected: {
    borderColor: 'rgba(76, 122, 63, 0.34)',
    backgroundColor: colors.moss,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  filterChipPressed: {
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  filterLabel: {
    ...fontWeights.bold,
    color: colors.ink,
    fontSize: 11,
  },
  filterLabelSelected: {
    color: colors.white,
  },
  featuredCard: {
    alignSelf: 'center',
    width: 350,
    maxWidth: '100%',
    height: 390,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#eeeeee',
    backgroundColor: '#fffdf4',
    shadowColor: colors.canopy,
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    marginBottom: 22,
  },
  featuredHeader: {
    position: 'absolute',
    top: 19,
    left: 26,
    right: 22,
    zIndex: 4,
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 23,
  },
  featuredIconCircle: {
    width: 44,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#fff8e5',
  },
  featuredHeaderText: {
    flex: 1,
    gap: 4,
  },
  featuredTitle: {
    color: '#070707',
    fontSize: 16,
    fontWeight: '500',
  },
  featuredSubtitle: {
    color: '#bdbdbd',
    fontSize: 10,
    fontWeight: '500',
  },
  featuredImageLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: 350,
    height: 300,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 248, 232, 0.55)',
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.82,
  },
  featuredFallbackScene: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(223, 241, 207, 0.7)',
  },
  featuredFallbackSymbol: {
    fontSize: 112,
    lineHeight: 124,
  },
  featuredBlurPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: 350,
    height: 130,
    overflow: 'hidden',
    borderRadius: 24,
    paddingLeft: 29,
    paddingTop: 12,
    paddingRight: 96,
  },
  featuredBlurGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23, 34, 25, 0.18)',
    borderRadius: 24,
  },
  featuredBlurGradientLift: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  featuredBlurGradientBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
    backgroundColor: 'rgba(23, 34, 25, 0.34)',
  },
  featuredRegionGlass: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(206, 105, 33, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  featuredRegionText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  featuredPlace: {
    marginTop: 8,
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  featuredDescription: {
    marginTop: 6,
    color: colors.white,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '300',
  },
  featuredFollowGlass: {
    position: 'absolute',
    right: 24,
    bottom: 17,
    zIndex: 5,
    minWidth: 61,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.26)',
  },
  featuredFollowText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '400',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  sectionTitle: {
    ...fontWeights.bold,
    color: colors.ink,
    fontSize: 16,
  },
  toolbarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 14,
    padding: 3,
    backgroundColor: '#F0F0F0',
  },
  sortChip: {
    minHeight: 30,
    justifyContent: 'center',
    borderRadius: 11,
    paddingHorizontal: 9,
  },
  sortChipSelected: {
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },
  sortText: {
    ...fontWeights.bold,
    color: colors.ink,
    fontSize: 12,
  },
  sortTextSelected: {
    color: colors.moss,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  unifiedList: {
    gap: 16,
  },
  unifiedItem: {
    width: '100%',
  },
  gridItem: {
    width: '47.8%',
  },
  card: {
    minHeight: 238,
    overflow: 'hidden',
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.08)',
    backgroundColor: 'rgba(255, 253, 244, 0.9)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  cardTopRow: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 10,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numberPill: {
    overflow: 'hidden',
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.moss,
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  illustrationFrame: {
    height: 132,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 24,
    backgroundColor: 'rgba(255, 248, 232, 0.45)',
  },
  foliageBlob: {
    position: 'absolute',
    bottom: 8,
    width: 42,
    height: 26,
    borderRadius: 20,
    backgroundColor: 'rgba(185, 227, 127, 0.48)',
  },
  foliageLeft: {
    left: 17,
    transform: [{ rotate: '-24deg' }],
  },
  foliageRight: {
    right: 18,
    transform: [{ rotate: '22deg' }],
  },
  entryImage: {
    width: '86%',
    height: 112,
    borderRadius: 14,
  },
  symbolScene: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  symbolArt: {
    fontSize: 66,
    lineHeight: 74,
  },
  groundLine: {
    width: '72%',
    height: 8,
    marginTop: -3,
    borderRadius: radii.round,
    backgroundColor: 'rgba(141, 112, 62, 0.16)',
  },
  cardBody: {
    gap: 3,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  entryTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
  },
  scientificName: {
    color: '#747a72',
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
    paddingTop: 3,
  },
  categoryBadge: {
    overflow: 'hidden',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '900',
  },
  badgePlant: {
    backgroundColor: '#e5f5cf',
    color: colors.moss,
  },
  badgeAnimal: {
    backgroundColor: '#fff1c7',
    color: '#8a6417',
  },
  badgeFish: {
    backgroundColor: colors.sky,
    color: '#276270',
  },
  badgeInsect: {
    backgroundColor: '#ece0ff',
    color: '#624893',
  },
  badgeOther: {
    backgroundColor: '#edf0eb',
    color: colors.muted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 1,
  },
  placeDate: {
    flex: 1,
    color: '#7a8179',
    fontSize: 12,
    fontWeight: '800',
  },
  bookmark: {
    color: colors.moss,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 28,
  },
  emptyCard: {
    gap: 10,
    marginTop: 8,
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  emptyTitle: {
    ...fontWeights.bold,
    color: colors.canopy,
    fontSize: 18,
  },
  emptyBody: {
    ...fontWeights.light,
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.leaf,
  },
  primaryButtonText: {
    ...fontWeights.bold,
    color: colors.white,
    fontSize: 14,
  },
  previewNotice: {
    gap: 5,
    marginTop: 14,
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: 'rgba(234, 220, 182, 0.82)',
    padding: 15,
    backgroundColor: 'rgba(255, 248, 232, 0.72)',
  },
  previewTitle: {
    ...fontWeights.bold,
    color: colors.canopy,
    fontSize: 15,
  },
  previewBody: {
    ...fontWeights.light,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
