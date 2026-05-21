import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard, GlassPanel, GradientScreen, RevealView } from '../atlas/glass';
import { AtlasCodexEntry, codexEntries, habitatStates } from '../atlas/mockData';
import { CellGlyph, CodexEntryCard, ProgressBar } from '../atlas/ui';
import { useObservationFlow } from '../observation/ObservationFlowProvider';
import { CodexEntryResponse } from '../../services/api';
import { colors, radii } from '../../theme/tokens';

export function CodexScreen() {
  const flow = useObservationFlow();
  const plantedCell = flow.state.plantedCell;
  const entries = flow.state.codexEntries.length > 0 ? flow.state.codexEntries.map(toCodexEntryCard) : codexEntries;
  const bloomScore = plantedCell?.bloomScore ?? 48;
  const observationCount = plantedCell?.observationCount ?? entries.length;
  const speciesCount = plantedCell?.speciesCount ?? entries.length;

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
                <Text style={styles.bloomMeta}>기록 {observationCount}개 · 종 {speciesCount}개 · 최근 갱신 {flow.state.status === 'planted' ? '방금 전' : '미리보기'}</Text>
              </View>
            </GlassPanel>
          </RevealView>

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

          {flow.state.codexEntries.length === 0 ? (
            <GlassCard tone="bloom">
              <Text style={styles.emptyTitle}>아직 실제 도감 기록이 없습니다.</Text>
              <Text style={styles.emptyBody}>기록 탭에서 사진이나 영상을 선택하면 Gemini 분석 후 이곳에 도감 카드가 쌓입니다.</Text>
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
    scientificName: entry.speciesKey,
    confidence,
    date: '방금 전',
    contributor: '익명 관찰자',
    tone: index % 3 === 0 ? 'butterfly' : index % 3 === 1 ? 'flower' : 'bird',
    isLatest: index === 0,
  };
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
