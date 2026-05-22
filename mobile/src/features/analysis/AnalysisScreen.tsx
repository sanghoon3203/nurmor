import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { discoveryCandidate } from '../atlas/mockData';
import { AtlasButton, ProgressBar, SoftPanel, StatusBadge, StepHeader } from '../atlas/ui';
import { useObservationFlow } from '../observation/ObservationFlowProvider';
import { colors, radii } from '../../theme/tokens';

export function AnalysisScreen() {
  const flow = useObservationFlow();
  const candidates = useMemo(
    () => (flow.state.analysis?.candidates.length ? flow.state.analysis.candidates : []),
    [flow.state.analysis?.candidates]
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const candidate = candidates.find((item) => item.id === selectedCandidateId) ?? candidates[0] ?? null;
  const isFirebaseOnly = flow.state.analysis?.model === 'Firebase-only MVP';
  const displayCandidate = candidate
    ? {
        id: candidate.id,
        commonName: candidate.commonNameKo,
        scientificName: candidate.scientificName ?? '학명 미확인',
        confidence: Math.round(candidate.confidence * 100) > 100 ? Math.round(candidate.confidence) : Math.round(candidate.confidence * 100),
        evidence: splitEvidence(candidate.evidence),
      }
    : {
        id: null,
        commonName: discoveryCandidate.commonName,
        scientificName: discoveryCandidate.scientificName,
        confidence: discoveryCandidate.confidence,
        evidence: discoveryCandidate.evidence,
      };

  const plant = async () => {
    if (!displayCandidate.id) {
      router.push('/cell');
      return;
    }

    await flow.plantCandidate(displayCandidate.id, 'CELL');
    router.push('/cell');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader
          step={3}
          title="기록을 읽는 중"
          subtitle={
            isFirebaseOnly
              ? 'Firebase-only MVP에서는 업로드와 위치 등록을 먼저 확인하고, Gemini 판정은 서버 재개 후 연결합니다.'
              : 'Gemini 3.1 Flash가 관찰 기록을 생물 후보와 근거로 정리합니다.'
          }
        />

        <View style={styles.analysisStage}>
          <View style={styles.outerRing}>
            <View style={styles.innerRing}>
              <Text style={styles.ringTitle}>{flow.isBusy ? '분석 중...' : flow.state.status === 'error' ? '확인 필요' : '후보 도착'}</Text>
              <Text style={styles.ringSub}>{flow.state.analysis?.status ?? 'structured JSON'}</Text>
            </View>
          </View>
          <StatusBadge label={flow.state.analysis?.model ?? 'Gemini 3.1 Flash'} tone="blue" />
          <Text style={styles.stageMessage}>{flow.state.message}</Text>
        </View>

        {candidates.length > 1 ? (
          <SoftPanel>
            <Text style={styles.selectorTitle}>후보 선택</Text>
            <View style={styles.selectorList}>
              {candidates.map((item) => {
                const selected = displayCandidate.id === item.id;
                const confidence = Math.round(item.confidence * 100) > 100 ? Math.round(item.confidence) : Math.round(item.confidence * 100);
                return (
                  <Text
                    key={item.id}
                    onPress={() => setSelectedCandidateId(item.id)}
                    style={[styles.selectorItem, selected ? styles.selectorItemSelected : null]}
                  >
                    {item.commonNameKo} · {confidence}%
                  </Text>
                );
              })}
            </View>
          </SoftPanel>
        ) : null}

        <SoftPanel tone="paper">
          <View style={styles.candidateHeader}>
            <View>
              <Text style={styles.sectionKicker}>새 발견 후보</Text>
              <Text style={styles.candidateTitle}>{displayCandidate.commonName}</Text>
              <Text style={styles.scientificName}>{displayCandidate.scientificName}</Text>
            </View>
            <StatusBadge label="AI" tone="yellow" />
          </View>

          <View style={styles.candidateVisualRow}>
            <View style={styles.thumbnail}>
              <Text style={styles.thumbnailText}>나비</Text>
            </View>
            <View style={styles.confidenceBox}>
              <Text style={styles.confidenceLabel}>신뢰도 {displayCandidate.confidence}%</Text>
              <ProgressBar value={displayCandidate.confidence} />
            </View>
          </View>

          <View style={styles.evidenceList}>
            <Text style={styles.evidenceTitle}>주요 근거</Text>
            {displayCandidate.evidence.map((item) => (
              <Text key={item} style={styles.evidenceItem}>
                · {item}
              </Text>
            ))}
          </View>
        </SoftPanel>

        {flow.state.errorMessage ? (
          <SoftPanel>
            <Text style={styles.errorTitle}>처리 오류</Text>
            <Text style={styles.errorBody}>{flow.state.errorMessage}</Text>
          </SoftPanel>
        ) : null}

        <SoftPanel>
          <Text style={styles.policyTitle}>{isFirebaseOnly ? 'Firebase-only MVP 안내' : '분석 실패 시 흐름'}</Text>
          <Text style={styles.policyBody}>
            {isFirebaseOnly
              ? '현재는 결제 한도 문제로 Spring/Gemini 서버를 쓰지 않고 Firestore 기록 심기까지 검증합니다.'
              : 'schema validation이 실패하면 AnalysisJob은 failed로 닫고, 앱은 재촬영 또는 다른 파일 선택을 안내합니다.'}
          </Text>
        </SoftPanel>

        <View style={styles.buttons}>
          <AtlasButton label={flow.state.status === 'planting' ? '심는 중' : '지도에 심기'} onPress={plant} disabled={flow.isBusy || flow.state.status === 'error'} />
          <AtlasButton label="다시 촬영" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function splitEvidence(evidence: string): string[] {
  return evidence
    .split(/\n|;|,/)
    .map((item) => item.trim().replace(/^[-·]\s*/, ''))
    .filter(Boolean)
    .slice(0, 4);
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
  stageMessage: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  selectorTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  selectorList: {
    gap: 8,
    marginTop: 12,
  },
  selectorItem: {
    overflow: 'hidden',
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: colors.canopy,
    backgroundColor: colors.cream,
    fontSize: 13,
    fontWeight: '900',
  },
  selectorItemSelected: {
    borderColor: colors.leaf,
    backgroundColor: colors.mint,
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
  buttons: {
    gap: 10,
  },
});
