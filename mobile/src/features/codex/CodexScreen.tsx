import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientScreen, RevealView } from '../atlas/glass';
import { codexEntries } from '../atlas/mockData';
import { useAuth } from '../auth/AuthProvider';
import { useObservationFlow } from '../observation/ObservationFlowProvider';
import { CodexEntryResponse } from '../../services/api';
import { FirebaseCodexEntry, listCodexEntries } from '../../services/firebaseAtlasDb';
import { colors, glass, radii } from '../../theme/tokens';
import {
  CodexCardViewModel,
  CodexFamily,
  CodexIcon,
  codexFamilyIcon,
  codexFamilyLabel,
  codexFilters,
  filterCodexCards,
  inferCodexFamily,
  toDisplayNumber,
} from './codexViewModel';

type RemoteStatus = 'idle' | 'loading' | 'ready' | 'error';

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
      return flow.state.codexEntries.map(toFlowCard);
    }
    if (remoteEntries.length > 0) {
      return remoteEntries.map(toRemoteCard);
    }
    if (codexEntries.length > 0) {
      return sampleEntries.map(toSampleCard);
    }
    return [];
  }, [flow.state.codexEntries, remoteEntries]);

  const filteredCards = useMemo(() => filterCodexCards(cards, filter), [cards, filter]);
  const counts = useMemo(() => countByFamily(cards), [cards]);
  const selectedLabel = codexFilters.find((item) => item.value === filter)?.label ?? '전체';
  const hasLiveEntries = flow.state.codexEntries.length > 0 || remoteEntries.length > 0;

  return (
    <GradientScreen style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.header}>
              <View style={styles.titleBlock}>
                <Text style={styles.title}>도감</Text>
                <Text style={styles.leafMark}>☘</Text>
              </View>
              <Text style={styles.subtitle}>발견한 생명들을 모아보세요</Text>
            </View>
          </RevealView>

          <RevealView delay={70}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRail}>
              {codexFilters.map((item) => {
                const selected = filter === item.value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={selected ? { selected: true } : {}}
                    key={item.value}
                    onPress={() => setFilter(item.value)}
                    style={[styles.filterCard, selected ? styles.filterCardSelected : null]}
                  >
                    <View style={[styles.filterIconWrap, selected ? styles.filterIconWrapSelected : null]}>
                      <IconMark icon={item.icon} selected={selected} />
                    </View>
                    <Text style={[styles.filterLabel, selected ? styles.filterLabelSelected : null]} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text style={[styles.filterCount, selected ? styles.filterCountSelected : null]}>{counts[item.value]}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </RevealView>

          <RevealView delay={110}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>
                {selectedLabel} {filteredCards.length}종
              </Text>
              <View style={styles.toolbarGroup}>
                <Pressable accessibilityRole="button" style={styles.sortButton}>
                  <Text style={styles.sortText}>최신순</Text>
                  <Text style={styles.sortChevron}>⌄</Text>
                </Pressable>
                <Pressable accessibilityRole="button" style={styles.tuneButton}>
                  <Text style={styles.tuneText}>≡</Text>
                </Pressable>
              </View>
            </View>
          </RevealView>

          <View style={styles.grid}>
            {filteredCards.map((entry, index) => (
              <RevealView key={`${filter}-${entry.id}`} delay={140 + Math.min(index, 8) * 45} style={styles.gridItem}>
                <CodexFieldCard entry={entry} />
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

function CodexFieldCard({ entry }: { entry: CodexCardViewModel }) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}>
      <View style={styles.cardTopRow}>
        <Text style={styles.numberPill}>{entry.displayNumber}</Text>
        <IconMark icon={entry.categoryIcon} selected={false} compact />
      </View>

      <View style={styles.illustrationFrame}>
        <View style={[styles.foliageBlob, styles.foliageLeft]} />
        <View style={[styles.foliageBlob, styles.foliageRight]} />
        {entry.imageUrl ? (
          <Image source={{ uri: entry.imageUrl }} style={styles.entryImage} resizeMode="cover" />
        ) : (
          <View style={styles.symbolScene}>
            <Text style={styles.symbolArt}>{illustrationSymbol(entry.illustration, entry.title)}</Text>
            <View style={styles.groundLine} />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.entryTitle} numberOfLines={1}>
          {entry.title}
        </Text>
        <Text style={styles.scientificName} numberOfLines={1}>
          {entry.scientificName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.categoryBadge, badgeStyle(entry.category)]}>{entry.categoryLabel}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.placeDate} numberOfLines={1}>
            {entry.date} {entry.place}
          </Text>
          <Text style={styles.bookmark}>▱</Text>
        </View>
      </View>
    </Pressable>
  );
}

function IconMark({ icon, selected, compact = false }: { icon: CodexIcon; selected: boolean; compact?: boolean }) {
  const symbol = icon === 'leaf' ? '☘' : icon === 'paw' ? '●' : icon === 'fish' ? '●' : icon === 'bug' ? '✣' : '?';
  return (
    <Text style={[compact ? styles.compactIcon : styles.iconText, selected ? styles.iconTextSelected : null]}>
      {symbol}
    </Text>
  );
}

function toFlowCard(entry: CodexEntryResponse, index: number): CodexCardViewModel {
  const family = inferCodexFamily({
    category: entry.category,
    title: entry.displayName,
    scientificName: entry.scientificName ?? entry.speciesKey,
  });

  return {
    id: entry.id,
    displayNumber: toDisplayNumber(index),
    title: entry.displayName,
    scientificName: entry.scientificName ?? entry.speciesKey,
    category: family,
    categoryLabel: codexFamilyLabel(family),
    categoryIcon: codexFamilyIcon(family),
    illustration: family,
    date: '방금 전',
    place: '현재 셀',
    isLatest: index === 0,
  };
}

function toRemoteCard(entry: FirebaseCodexEntry, index: number): CodexCardViewModel {
  const family = inferCodexFamily({
    category: entry.category,
    title: entry.displayName,
    scientificName: entry.scientificName ?? entry.speciesKey,
  });

  return {
    id: entry.id,
    displayNumber: toDisplayNumber(index),
    title: entry.displayName,
    scientificName: entry.scientificName ?? entry.speciesKey,
    category: family,
    categoryLabel: codexFamilyLabel(family),
    categoryIcon: codexFamilyIcon(family),
    illustration: family,
    date: formatDate(entry.createdAt),
    place: '서식지 셀',
    imageUrl: entry.imageUrl,
    isLatest: index === 0,
  };
}

function toSampleCard(entry: (typeof sampleEntries)[number], index: number): CodexCardViewModel {
  const family = inferCodexFamily(entry);

  return {
    id: entry.id,
    displayNumber: toDisplayNumber(index),
    title: entry.title,
    scientificName: entry.scientificName,
    category: family,
    categoryLabel: codexFamilyLabel(family),
    categoryIcon: codexFamilyIcon(family),
    illustration: family,
    date: entry.date,
    place: entry.place,
    isLatest: index === 0,
  };
}

function countByFamily(cards: CodexCardViewModel[]) {
  return codexFilters.reduce<Record<CodexFamily, number>>(
    (next, item) => ({
      ...next,
      [item.value]: item.value === 'ALL' ? cards.length : cards.filter((card) => card.category === item.value).length,
    }),
    { ALL: 0, PLANT: 0, ANIMAL: 0, FISH: 0, INSECT: 0, OTHER: 0 }
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return '날짜 없음';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function illustrationSymbol(family: CodexFamily, title: string) {
  if (/다람쥐/.test(title)) return '🐿';
  if (/수달/.test(title)) return '🦦';
  if (/고슴도치/.test(title)) return '🦔';
  if (/참새|직박구리|새/.test(title)) return '🐦';
  if (/개구리/.test(title)) return '🐸';
  if (family === 'PLANT') return '🌿';
  if (family === 'FISH') return '🐟';
  if (family === 'INSECT') return '🪲';
  if (family === 'ANIMAL') return '🐾';
  return '？';
}

function badgeStyle(family: CodexFamily) {
  switch (family) {
    case 'PLANT':
      return styles.badgePlant;
    case 'ANIMAL':
      return styles.badgeAnimal;
    case 'FISH':
      return styles.badgeFish;
    case 'INSECT':
      return styles.badgeInsect;
    default:
      return styles.badgeOther;
  }
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
    paddingTop: 18,
    paddingBottom: 126,
  },
  header: {
    alignItems: 'center',
    gap: 7,
    paddingTop: 4,
    paddingBottom: 18,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    color: colors.moss,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0,
  },
  leafMark: {
    color: colors.moss,
    fontSize: 15,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '800',
  },
  filterRail: {
    gap: 10,
    paddingBottom: 22,
  },
  filterCard: {
    width: 80,
    minHeight: 86,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: 'rgba(22, 63, 45, 0.09)',
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
  },
  filterCardSelected: {
    borderColor: 'rgba(76, 122, 63, 0.34)',
    backgroundColor: colors.moss,
    shadowOpacity: 0.14,
  },
  filterIconWrap: {
    minHeight: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconWrapSelected: {
    transform: [{ scale: 1.04 }],
  },
  iconText: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 26,
  },
  compactIcon: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 25,
  },
  iconTextSelected: {
    color: colors.white,
  },
  filterLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  filterLabelSelected: {
    color: colors.white,
  },
  filterCount: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  filterCountSelected: {
    color: colors.white,
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
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  toolbarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radii.round,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
  },
  sortText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  sortChevron: {
    color: colors.muted,
    fontSize: 20,
    fontWeight: '900',
    marginTop: -4,
  },
  tuneButton: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  tuneText: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
    transform: [{ rotate: '90deg' }],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    color: colors.canopy,
    fontSize: 18,
    fontWeight: '900',
  },
  emptyBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.leaf,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
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
    color: colors.canopy,
    fontSize: 15,
    fontWeight: '900',
  },
  previewBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
});
