import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientScreen, RevealView } from '../atlas/glass';
import { discoveryCandidate } from '../atlas/mockData';
import { ProgressBar } from '../atlas/ui';
import { useObservationFlow } from '../observation/ObservationFlowProvider';
import { colors, glass, radii } from '../../theme/tokens';
import { defaultShareOption, ShareOptionId, shareOptions, visibilityForShareOption } from '../capture/recordFlowViewModel';

export function AnalysisScreen() {
  const flow = useObservationFlow();
  const candidates = useMemo(
    () => (flow.state.analysis?.candidates.length ? flow.state.analysis.candidates : []),
    [flow.state.analysis?.candidates]
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [shareOptionId, setShareOptionId] = useState<ShareOptionId>(defaultShareOption.id);
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
  const mediaUri = flow.state.media?.uri ?? null;

  const plant = async () => {
    if (!displayCandidate.id) {
      router.push('/cell');
      return;
    }

    await flow.plantCandidate(displayCandidate.id, visibilityForShareOption(shareOptionId));
    router.push(shareOptionId === 'public' ? '/(tabs)/community' : '/cell');
  };

  return (
    <GradientScreen>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.topBar}>
              <Pressable accessibilityRole="button" style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backText}>‹</Text>
              </Pressable>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>사진 판정</Text>
                <Text style={styles.subtitle}>사진과 함께 생물 후보를 확인해요</Text>
              </View>
              <View style={styles.topSpacer} />
            </View>
          </RevealView>

          <RevealView delay={60}>
            <View style={styles.photoCard}>
              {mediaUri ? (
                <Image source={{ uri: mediaUri }} style={styles.photoPreview} resizeMode="cover" />
              ) : (
                <View style={styles.photoFallback}>
                  <Text style={styles.photoFallbackIcon}>🐦</Text>
                  <Text style={styles.photoFallbackText}>선택한 사진을 기다리는 중</Text>
                </View>
              )}
              <View style={styles.photoOverlay}>
                <Text style={styles.photoOverlayTitle}>{flow.isBusy ? '판정 준비 중' : '사진 분석 완료'}</Text>
                <Text style={styles.photoOverlayBody}>{flow.state.message}</Text>
              </View>
            </View>
          </RevealView>

          <RevealView delay={110}>
            <View style={styles.judgementCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardKicker}>{isFirebaseOnly ? '임시 후보' : 'AI 판정 후보'}</Text>
                  <Text style={styles.candidateTitle}>{displayCandidate.commonName}</Text>
                  <Text style={styles.scientificName}>{displayCandidate.scientificName}</Text>
                </View>
                <View style={styles.confidenceCircle}>
                  <Text style={styles.confidenceValue}>{displayCandidate.confidence}%</Text>
                  <Text style={styles.confidenceLabel}>신뢰도</Text>
                </View>
              </View>

              <View style={styles.confidenceBar}>
                <ProgressBar value={displayCandidate.confidence} />
              </View>

              {candidates.length > 1 ? (
                <View style={styles.candidateRail}>
                  {candidates.map((item) => {
                    const selected = displayCandidate.id === item.id;
                    const confidence = Math.round(item.confidence * 100) > 100 ? Math.round(item.confidence) : Math.round(item.confidence * 100);
                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={selected ? { selected: true } : {}}
                        key={item.id}
                        onPress={() => setSelectedCandidateId(item.id)}
                        style={[styles.candidateChip, selected ? styles.candidateChipSelected : null]}
                      >
                        <Text style={[styles.candidateChipText, selected ? styles.candidateChipTextSelected : null]}>{item.commonNameKo}</Text>
                        <Text style={[styles.candidateChipMeta, selected ? styles.candidateChipTextSelected : null]}>{confidence}%</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              <View style={styles.evidenceList}>
                <Text style={styles.evidenceTitle}>판정 근거</Text>
                {displayCandidate.evidence.map((item) => (
                  <Text key={item} style={styles.evidenceItem}>
                    · {item}
                  </Text>
                ))}
              </View>
            </View>
          </RevealView>

          <RevealView delay={150}>
            <View style={styles.shareCard}>
              <Text style={styles.shareTitle}>기록 공유 범위</Text>
              <Text style={styles.shareBody}>정확 좌표는 공개하지 않고, 선택한 범위에 따라 셀 도감 또는 커뮤니티에 심습니다.</Text>
              <View style={styles.shareOptions}>
                {shareOptions.map((option) => {
                  const selected = shareOptionId === option.id;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={selected ? { selected: true } : {}}
                      key={option.id}
                      onPress={() => setShareOptionId(option.id)}
                      style={[styles.shareOption, selected ? styles.shareOptionSelected : null]}
                    >
                      <Text style={[styles.shareOptionTitle, selected ? styles.shareOptionTitleSelected : null]}>{option.label}</Text>
                      <Text style={[styles.shareOptionBody, selected ? styles.shareOptionBodySelected : null]}>{option.description}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </RevealView>

          {flow.state.errorMessage ? (
            <RevealView delay={180}>
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>처리 오류</Text>
                <Text style={styles.errorBody}>{flow.state.errorMessage}</Text>
              </View>
            </RevealView>
          ) : null}

          <RevealView delay={210}>
            <View style={styles.buttons}>
              <Pressable accessibilityRole="button" style={[styles.primaryButton, flow.isBusy || flow.state.status === 'error' ? styles.disabledButton : null]} onPress={plant} disabled={flow.isBusy || flow.state.status === 'error'}>
                <Text style={styles.primaryButtonText}>{flow.state.status === 'planting' ? '심는 중' : shareOptionId === 'public' ? '커뮤니티에 공유하기' : '지도에 심기'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => router.back()}>
                <Text style={styles.secondaryButtonText}>다시 선택하기</Text>
              </Pressable>
            </View>
          </RevealView>
        </ScrollView>
      </SafeAreaView>
    </GradientScreen>
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
  },
  content: {
    gap: 18,
    padding: 18,
    paddingBottom: 34,
  },
  topBar: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  backText: {
    color: colors.canopy,
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 39,
  },
  headerCopy: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    color: colors.moss,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  topSpacer: {
    width: 46,
  },
  photoCard: {
    height: 390,
    overflow: 'hidden',
    borderRadius: 26,
    backgroundColor: '#254610',
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.mint,
  },
  photoFallbackIcon: {
    fontSize: 96,
  },
  photoFallbackText: {
    color: colors.canopy,
    fontSize: 16,
    fontWeight: '900',
  },
  photoOverlay: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    gap: 5,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  photoOverlayTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  photoOverlayBody: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  judgementCard: {
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.08)',
    padding: 18,
    backgroundColor: 'rgba(255, 253, 244, 0.86)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  cardKicker: {
    color: colors.moss,
    fontSize: 13,
    fontWeight: '900',
  },
  candidateTitle: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
  },
  scientificName: {
    color: colors.muted,
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '800',
  },
  confidenceCircle: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 39,
    borderWidth: 7,
    borderColor: colors.mint,
    backgroundColor: colors.white,
  },
  confidenceValue: {
    color: colors.moss,
    fontSize: 18,
    fontWeight: '900',
  },
  confidenceLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  confidenceBar: {
    gap: 8,
  },
  candidateRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  candidateChip: {
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  candidateChipSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.mint,
  },
  candidateChipText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  candidateChipMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  candidateChipTextSelected: {
    color: colors.moss,
  },
  evidenceList: {
    gap: 8,
  },
  evidenceTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  evidenceItem: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '800',
  },
  shareCard: {
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.08)',
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
  },
  shareTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  shareBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
  shareOptions: {
    gap: 9,
  },
  shareOption: {
    gap: 3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: glass.hairline,
    padding: 13,
    backgroundColor: colors.white,
  },
  shareOptionSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  shareOptionTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  shareOptionTitleSelected: {
    color: colors.white,
  },
  shareOptionBody: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  shareOptionBodySelected: {
    color: colors.white,
  },
  errorCard: {
    gap: 8,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#fff1ee',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '900',
  },
  errorBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
  buttons: {
    gap: 10,
  },
  primaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.moss,
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  secondaryButtonText: {
    color: colors.canopy,
    fontSize: 15,
    fontWeight: '900',
  },
});
