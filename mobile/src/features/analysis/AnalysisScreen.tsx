import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { discoveryCandidate } from '../atlas/mockData';
import { AtlasButton, ProgressBar, SoftPanel, StatusBadge, StepHeader } from '../atlas/ui';
import { colors, radii } from '../../theme/tokens';

export function AnalysisScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader step={3} title="기록을 읽는 중" subtitle="Gemini 3.5 Flash가 관찰 기록을 생물 후보와 근거로 정리합니다." />

        <View style={styles.analysisStage}>
          <View style={styles.outerRing}>
            <View style={styles.innerRing}>
              <Text style={styles.ringTitle}>분석 중...</Text>
              <Text style={styles.ringSub}>structured JSON</Text>
            </View>
          </View>
          <StatusBadge label="Gemini 3.5 Flash" tone="blue" />
        </View>

        <SoftPanel tone="paper">
          <View style={styles.candidateHeader}>
            <View>
              <Text style={styles.sectionKicker}>새 발견 후보</Text>
              <Text style={styles.candidateTitle}>{discoveryCandidate.commonName}</Text>
              <Text style={styles.scientificName}>{discoveryCandidate.scientificName}</Text>
            </View>
            <StatusBadge label="AI" tone="yellow" />
          </View>

          <View style={styles.candidateVisualRow}>
            <View style={styles.thumbnail}>
              <Text style={styles.thumbnailText}>나비</Text>
            </View>
            <View style={styles.confidenceBox}>
              <Text style={styles.confidenceLabel}>신뢰도 {discoveryCandidate.confidence}%</Text>
              <ProgressBar value={discoveryCandidate.confidence} />
            </View>
          </View>

          <View style={styles.evidenceList}>
            <Text style={styles.evidenceTitle}>주요 근거</Text>
            {discoveryCandidate.evidence.map((item) => (
              <Text key={item} style={styles.evidenceItem}>
                · {item}
              </Text>
            ))}
          </View>
        </SoftPanel>

        <SoftPanel>
          <Text style={styles.policyTitle}>분석 실패 시 흐름</Text>
          <Text style={styles.policyBody}>
            schema validation이 실패하면 AnalysisJob은 failed로 닫고, 앱은 재촬영 또는 다른 파일 선택을 안내합니다.
          </Text>
        </SoftPanel>

        <View style={styles.buttons}>
          <AtlasButton label="지도에 심기" onPress={() => router.push('/cell')} />
          <AtlasButton label="다시 촬영" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    gap: 18,
    padding: 18,
    paddingBottom: 34,
  },
  analysisStage: {
    minHeight: 242,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.warmLine,
    backgroundColor: colors.paper,
  },
  outerRing: {
    width: 172,
    height: 172,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 86,
    borderWidth: 12,
    borderColor: colors.aiBlue,
    backgroundColor: '#eaf8fd',
  },
  innerRing: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 65,
    borderWidth: 1,
    borderColor: colors.warmLine,
    backgroundColor: colors.cream,
  },
  ringTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  ringSub: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionKicker: {
    color: colors.moss,
    fontSize: 13,
    fontWeight: '900',
  },
  candidateTitle: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0,
  },
  scientificName: {
    color: colors.text,
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  candidateVisualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  thumbnail: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.warmLine,
    backgroundColor: colors.bloom,
  },
  thumbnailText: {
    color: colors.canopy,
    fontSize: 18,
    fontWeight: '900',
  },
  confidenceBox: {
    flex: 1,
    gap: 8,
  },
  confidenceLabel: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '900',
  },
  evidenceList: {
    gap: 8,
    marginTop: 16,
  },
  evidenceTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  evidenceItem: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  policyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  policyBody: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  buttons: {
    gap: 10,
  },
});
