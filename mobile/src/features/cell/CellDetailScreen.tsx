import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AtlasCodexEntry, codexEntries, habitatStates } from '../atlas/mockData';
import { AtlasButton, CellGlyph, CodexEntryCard, ProgressBar, SoftPanel, StepHeader } from '../atlas/ui';
import { useObservationFlow } from '../observation/ObservationFlowProvider';
import { CodexEntryResponse } from '../../services/api';
import { colors, radii } from '../../theme/tokens';

export function CellDetailScreen() {
  const flow = useObservationFlow();
  const plantedCell = flow.state.plantedCell;
  const entries = flow.state.codexEntries.length > 0 ? flow.state.codexEntries.map(toCodexEntryCard) : codexEntries;
  const bloomScore = plantedCell?.bloomScore ?? 64;
  const observationCount = plantedCell?.observationCount ?? 8;
  const speciesCount = plantedCell?.speciesCount ?? 3;
  const contributorCount = plantedCell?.contributorCount ?? 4;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader
          step={4}
          title="서식지 셀"
          subtitle="서울특별시 마포구 성산동 · 공개 위치는 셀 중심으로만 표시됩니다."
          action={
            <Pressable accessibilityRole="button" style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>뒤로</Text>
            </Pressable>
          }
        />

        <SoftPanel tone="green">
          <View style={styles.bloomHeader}>
            <CellGlyph state={plantedCell?.bloomState ?? 'BLOOMED'} selected />
            <View style={styles.bloomTextGroup}>
              <Text style={styles.bloomTitle}>개화도 {bloomScore}%</Text>
              <ProgressBar value={bloomScore} />
              <Text style={styles.bloomMeta}>기록 {observationCount}개 · 종 {speciesCount}개 · 기여자 {contributorCount}명</Text>
            </View>
          </View>
        </SoftPanel>

        <View style={styles.contributorCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>김</Text>
          </View>
          <View style={styles.contributorText}>
            <Text style={styles.contributorTitle}>김상훈님의 발견</Text>
            <Text style={styles.contributorBody}>첫 기록일 2026.05.21</Text>
          </View>
          <Text style={styles.sproutMark}>새 기록</Text>
        </View>

        <View style={styles.tabRow}>
          <View style={styles.tabActive}>
            <Text style={styles.tabActiveText}>이 셀의 도감</Text>
          </View>
          <View style={styles.tab}>
            <Text style={styles.tabText}>통계</Text>
          </View>
        </View>

        <View style={styles.codexList}>
          {entries.map((entry) => (
            <CodexEntryCard key={entry.id} entry={entry} />
          ))}
        </View>

        {flow.state.errorMessage ? (
          <SoftPanel>
            <Text style={styles.errorTitle}>연동 오류</Text>
            <Text style={styles.errorBody}>{flow.state.errorMessage}</Text>
          </SoftPanel>
        ) : null}

        <SoftPanel>
          <Text style={styles.sectionTitle}>기여자 표시 설정</Text>
          <View style={styles.privacyGrid}>
            <View style={styles.privacyOption}>
              <Text style={styles.privacyTitle}>익명</Text>
              <Text style={styles.privacyBody}>이름을 공개하지 않습니다.</Text>
            </View>
            <View style={[styles.privacyOption, styles.privacySelected]}>
              <Text style={styles.privacyTitle}>셀에서 표시</Text>
              <Text style={styles.privacyBody}>이 셀 도감에 이름을 표시합니다.</Text>
            </View>
          </View>
        </SoftPanel>

        <SoftPanel tone="paper">
          <Text style={styles.sectionTitle}>HabitatCell 상태</Text>
          <View style={styles.stateRail}>
            {habitatStates.map((state) => (
              <View key={state.key} style={styles.stateItem}>
                <CellGlyph state={state.key} />
                <Text style={styles.stateTitle}>{state.title}</Text>
                <Text style={styles.stateBody}>{state.body}</Text>
              </View>
            ))}
          </View>
        </SoftPanel>

        <AtlasButton label="새 기록 심기" onPress={() => router.push('/(tabs)/record')} />
        <Text style={styles.footerNote}>정확한 좌표와 원본 데이터는 비공개로 보관됩니다.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function toCodexEntryCard(entry: CodexEntryResponse, index: number): AtlasCodexEntry {
  return {
    id: entry.id,
    title: entry.displayName,
    scientificName: entry.speciesKey,
    confidence: Math.round(entry.bestConfidence * 100) > 100 ? Math.round(entry.bestConfidence) : Math.round(entry.bestConfidence * 100),
    date: '방금 전',
    contributor: '김상훈',
    tone: index % 3 === 0 ? 'butterfly' : index % 3 === 1 ? 'flower' : 'bird',
    isLatest: index === 0,
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 34,
  },
  backButton: {
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radii.round,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  backText: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '900',
  },
  bloomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bloomTextGroup: {
    flex: 1,
    gap: 8,
  },
  bloomTitle: {
    color: colors.canopy,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
  },
  bloomMeta: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  contributorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.paper,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.moss,
  },
  avatarText: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '900',
  },
  contributorText: {
    flex: 1,
    gap: 3,
  },
  contributorTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  contributorBody: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  sproutMark: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: '900',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabActive: {
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.moss,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 10,
  },
  tabActiveText: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '900',
  },
  tabText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  codexList: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  privacyGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  privacyOption: {
    flex: 1,
    gap: 6,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.cream,
  },
  privacySelected: {
    borderColor: colors.leaf,
    backgroundColor: colors.field,
  },
  privacyTitle: {
    color: colors.canopy,
    fontSize: 15,
    fontWeight: '900',
  },
  privacyBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  stateRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  stateItem: {
    width: '30%',
    minWidth: 92,
    alignItems: 'center',
    gap: 6,
  },
  stateTitle: {
    color: colors.ink,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '900',
  },
  stateBody: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    fontWeight: '700',
  },
  footerNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    fontWeight: '700',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '900',
  },
  errorBody: {
    marginTop: 6,
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
});
