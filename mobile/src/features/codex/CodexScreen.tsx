import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard, GlassPanel, GradientScreen, RevealView } from '../atlas/glass';
import { AtlasCodexEntry, codexEntries, habitatStates } from '../atlas/mockData';
import { CellGlyph, CodexEntryCard, ProgressBar } from '../atlas/ui';
import { useAuth } from '../auth/AuthProvider';
import { useObservationFlow } from '../observation/ObservationFlowProvider';
import { CodexEntryResponse } from '../../services/api';
import { CodexCategory, FirebaseCodexEntry, listCodexEntries } from '../../services/firebaseAtlasDb';
import { colors, radii } from '../../theme/tokens';

type CodexFilter = 'ALL' | CodexCategory;

const codexFilters: Array<{ value: CodexFilter; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'PLANT', label: '식물' },
  { value: 'ANIMAL', label: '동물' },
  { value: 'OTHER', label: '기타' },
];

export function CodexScreen() {
  const auth = useAuth();
  const flow = useObservationFlow();
  const [filter, setFilter] = useState<CodexFilter>('ALL');
  const [remoteEntries, setRemoteEntries] = useState<FirebaseCodexEntry[]>([]);
  const [remoteStatus, setRemoteStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [remoteMessage, setRemoteMessage] = useState<string | null>(null);
  const plantedCell = flow.state.plantedCell;
  const entries = useMemo(() => {
    if (flow.state.codexEntries.length > 0) {
      return flow.state.codexEntries.map(toCodexEntryCard);
    }
    if (remoteEntries.length > 0) {
      return remoteEntries.map(toFirebaseCodexEntryCard);
    }
    return codexEntries;
  }, [flow.state.codexEntries, remoteEntries]);
  const bloomScore = plantedCell?.bloomScore ?? 48;
  const observationCount = plantedCell?.observationCount ?? entries.length;
  const speciesCount = plantedCell?.speciesCount ?? entries.length;
  const hasLiveEntries = flow.state.codexEntries.length > 0 || remoteEntries.length > 0;

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
        const nextEntries = await listCodexEntries(auth.session.idToken, filter === 'ALL' ? undefined : filter);
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
  }, [auth.session?.idToken, filter]);

  return (
    <GradientScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.header}>
              <Text style={styles.kicker}>나의 Living Archive</Text>
              <Text style={styles.title}>도감</Text>
              <Text style={styles.subtitle}>셀에 심은 관찰 기록이 생물 도감으로 쌓입니다.</Text>
            </View>
          </RevealView>

          <RevealView delay={80}>
            <GlassPanel tone="green" contentStyle={styles.bloomPanel}>
              <CellGlyph state={plantedCell?.bloomState ?? 'GROWING'} selected />
              <View style={styles.bloomBody}>
                <Text style={styles.bloomTitle}>개화도 {bloomScore}%</Text>
                <ProgressBar value={bloomScore} />
                <Text style={styles.bloomMeta}>기록 {observationCount}개 · 종 {speciesCount}개 · 최근 갱신 {liveLabel(flow.state.status, remoteStatus)}</Text>
              </View>
            </GlassPanel>
          </RevealView>

          <View style={styles.filterRow}>
            {codexFilters.map((item) => {
              const selected = filter === item.value;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={item.value}
                  onPress={() => setFilter(item.value)}
                  style={[styles.filterButton, selected ? styles.filterButtonSelected : null]}
                >
                  <Text style={[styles.filterButtonText, selected ? styles.filterButtonTextSelected : null]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>최근 도감</Text>
            <Pressable accessibilityRole="button" style={styles.smallButton} onPress={() => router.push('/(tabs)/record')}>
              <Text style={styles.smallButtonText}>기록 추가</Text>
            </Pressable>
          </View>

          <View style={styles.list}>
            {entries.map((entry, index) => (
              <RevealView key={entry.id} delay={120 + index * 55}>
                <CodexEntryCard entry={entry} />
              </RevealView>
            ))}
          </View>

          {!hasLiveEntries ? (
            <GlassCard tone="bloom">
              <Text style={styles.emptyTitle}>{remoteStatus === 'error' ? 'Firestore 도감 연결 실패' : '아직 실제 도감 기록이 없습니다.'}</Text>
              <Text style={styles.emptyBody}>
                {remoteStatus === 'error'
                  ? remoteMessage ?? 'Firebase 프로젝트와 Firestore 권한을 확인해 주세요.'
                  : '기록 탭에서 사진이나 영상을 선택하면 분석 결과가 Firestore 도감 카드로 쌓입니다.'}
              </Text>
              <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => router.push('/(tabs)/record')}>
                <Text style={styles.primaryButtonText}>첫 기록 심기</Text>
              </Pressable>
            </GlassCard>
          ) : null}

          <GlassCard tone="strong">
            <Text style={styles.sectionTitle}>서식지 셀 상태</Text>
            <View style={styles.stateGrid}>
              {habitatStates.map((state) => (
                <View key={state.key} style={styles.stateItem}>
                  <CellGlyph state={state.key} />
                  <Text style={styles.stateTitle}>{state.title}</Text>
                  <Text style={styles.stateBody}>{state.body}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </GradientScreen>
  );
}

function toCodexEntryCard(entry: CodexEntryResponse, index: number): AtlasCodexEntry {
  const confidence = entry.bestConfidence > 1 ? Math.round(entry.bestConfidence) : Math.round(entry.bestConfidence * 100);
  return {
    id: entry.id,
    title: entry.displayName,
    scientificName: entry.scientificName ?? entry.speciesKey,
    confidence,
    date: '방금 전',
    contributor: '익명 관찰자',
    tone: entry.category === 'PLANT' ? 'flower' : entry.category === 'ANIMAL' ? 'butterfly' : index % 3 === 0 ? 'butterfly' : index % 3 === 1 ? 'flower' : 'bird',
    isLatest: index === 0,
  };
}

function toFirebaseCodexEntryCard(entry: FirebaseCodexEntry, index: number): AtlasCodexEntry {
  const confidence = entry.bestConfidence > 1 ? Math.round(entry.bestConfidence) : Math.round(entry.bestConfidence * 100);
  return {
    id: entry.id,
    title: entry.displayName,
    scientificName: entry.scientificName ?? entry.speciesKey,
    confidence,
    date: formatDate(entry.createdAt),
    contributor: 'Firestore 기록',
    tone: entry.category === 'PLANT' ? 'flower' : entry.category === 'ANIMAL' ? 'butterfly' : 'bird',
    isLatest: index === 0,
  };
}

function liveLabel(flowStatus: string, remoteStatus: string) {
  if (flowStatus === 'planted') {
    return '방금 전';
  }
  if (remoteStatus === 'ready') {
    return 'Firestore';
  }
  if (remoteStatus === 'loading') {
    return '동기화 중';
  }
  return '미리보기';
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
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  bloomPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bloomBody: {
    flex: 1,
    gap: 8,
  },
  bloomTitle: {
    color: colors.canopy,
    fontSize: 25,
    fontWeight: '900',
  },
  bloomMeta: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
  },
  filterButtonSelected: {
    borderColor: colors.leaf,
    backgroundColor: colors.leaf,
  },
  filterButtonText: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '900',
  },
  filterButtonTextSelected: {
    color: colors.white,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  smallButton: {
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radii.round,
    paddingHorizontal: 14,
    backgroundColor: colors.canopy,
  },
  smallButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  list: {
    gap: 10,
  },
  emptyTitle: {
    color: colors.canopy,
    fontSize: 17,
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
  stateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stateItem: {
    width: '30%',
    minWidth: 88,
    alignItems: 'center',
    gap: 6,
  },
  stateTitle: {
    color: colors.canopy,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  stateBody: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
