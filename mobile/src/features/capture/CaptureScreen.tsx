import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientScreen, RevealView } from '../atlas/glass';
import { PickedObservationAsset, useObservationFlow } from '../observation/ObservationFlowProvider';
import { colors, glass, radii } from '../../theme/tokens';

type CaptureMode = 'photo' | 'audio';

export function CaptureScreen() {
  const flow = useObservationFlow();
  const cameraRef = useRef<CameraView | null>(null);
  const audioSheetMotion = useRef(new Animated.Value(0)).current;
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mode, setMode] = useState<CaptureMode>('photo');
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [cameraReady, setCameraReady] = useState(false);
  const [assetUri, setAssetUri] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<PickedObservationAsset | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState('카메라로 관찰할 생명을 맞춰주세요');
  const statusMessage = flow.state.errorMessage ?? (flow.state.message !== '관찰 기록을 기다리는 중' ? flow.state.message : status);

  useEffect(() => {
    Animated.timing(audioSheetMotion, {
      toValue: mode === 'audio' ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [audioSheetMotion, mode]);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.88,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setMode('photo');
      setSelectedAsset(asset ?? null);
      setAssetUri(asset?.uri ?? null);
      setStatus('앨범 사진이 선택되었습니다. 판정 화면으로 이동해 확인해 주세요.');
    }
  };

  const takePhoto = async () => {
    try {
      setMode('photo');
      if (!cameraPermission?.granted) {
        const nextPermission = await requestCameraPermission();
        if (!nextPermission.granted) {
          setStatus('카메라 권한이 있어야 현장에서 바로 촬영할 수 있습니다.');
          return;
        }
      }
      if (!cameraReady || !cameraRef.current) {
        setStatus('카메라를 준비하는 중입니다. 잠시 후 다시 눌러주세요.');
        return;
      }

      setIsCapturing(true);
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.88 });
      const asset: PickedObservationAsset = {
        uri: picture.uri,
        fileName: `atlas-photo-${Date.now()}.${picture.format}`,
        mimeType: picture.format === 'png' ? 'image/png' : 'image/jpeg',
      };
      setSelectedAsset(asset);
      setAssetUri(picture.uri);
      setStatus('사진이 촬영되었습니다. 판정 화면으로 이동해 확인해 주세요.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '사진 촬영에 실패했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  const openAudioSearch = () => {
    setMode('audio');
    setSelectedAsset(null);
    setAssetUri(null);
    setStatus('소리를 녹음해 생명 흔적을 남겨보세요.');
  };

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setStatus('마이크 권한이 있어야 음성 탐색을 사용할 수 있습니다.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setStatus('주변 소리를 녹음하고 있습니다.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '녹음을 시작하지 못했습니다.');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri ?? recorderState.url;
      if (!uri) {
        setStatus('녹음 파일을 찾지 못했습니다. 다시 녹음해 주세요.');
        return;
      }

      setSelectedAsset({
        uri,
        fileName: `atlas-audio-${Date.now()}.m4a`,
        mimeType: 'audio/m4a',
      });
      setStatus('소리 기록이 준비되었습니다. 판정 화면으로 이동해 확인해 주세요.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '녹음을 저장하지 못했습니다.');
    }
  };

  const startAnalysis = () => {
    if (!selectedAsset) {
      setStatus(mode === 'audio' ? '분석할 소리를 먼저 녹음해 주세요.' : '판정할 사진을 먼저 촬영해 주세요.');
      return;
    }

    void flow.startCaptureAnalysis(selectedAsset);
    router.push('/analysis');
  };

  return (
    <GradientScreen>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <RevealView>
            <View style={styles.header}>
              <View style={styles.statusSpacer} />
              <View style={styles.titleGroup}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>탐색</Text>
                  <Text style={styles.sprout}>☘</Text>
                </View>
                <Text style={styles.subtitle}>자연 속 생명을 발견해보세요!</Text>
              </View>
              <Pressable accessibilityRole="button" style={styles.bellButton}>
                <Text style={styles.bellText}>♧</Text>
                <View style={styles.bellDot} />
              </Pressable>
            </View>
          </RevealView>

          <RevealView delay={70}>
            <View style={styles.modeRow}>
              <ModeCard
                active={mode === 'photo'}
                icon="▣"
                title="탐색 (사진)"
                onPress={() => {
                  setMode('photo');
                  setStatus('카메라로 관찰할 생명을 맞춰주세요');
                }}
              />
              <ModeCard active={mode === 'audio'} icon="♬" title="음성 탐색" onPress={openAudioSearch} />
            </View>
          </RevealView>

          <RevealView delay={110}>
            <View style={styles.cameraFrame}>
              {assetUri ? (
                <Image source={{ uri: assetUri }} style={styles.previewImage} resizeMode="cover" />
              ) : cameraPermission?.granted ? (
                <CameraView
                  ref={cameraRef}
                  active={mode === 'photo'}
                  animateShutter
                  facing={cameraFacing}
                  mode="picture"
                  onCameraReady={() => setCameraReady(true)}
                  style={styles.cameraPreview}
                />
              ) : (
                <CameraPlaceholder />
              )}
              <View style={styles.cameraScrim} />
              <Pressable accessibilityRole="button" style={[styles.roundOverlay, styles.helpButton]} onPress={() => setStatus('가까이, 선명하게 찍을수록 판정 정확도가 올라갑니다.')}>
                <Text style={styles.roundOverlayText}>?</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={[styles.roundOverlay, styles.flashButton]} onPress={() => setStatus('조명이 부족하면 밝은 곳에서 다시 촬영해 주세요.')}>
                <Text style={styles.roundOverlayText}>✦</Text>
              </Pressable>
              <FocusCorner position="topLeft" />
              <FocusCorner position="topRight" />
              <FocusCorner position="bottomLeft" />
              <FocusCorner position="bottomRight" />
              <View style={styles.previewCopy}>
                <Text style={styles.previewCopyText}>{assetUri ? '촬영한 기록을 확인해 주세요' : '생명을 화면 중앙에 맞춰주세요'}</Text>
                <Text style={styles.previewCopyText}>더 가까이, 선명하게 찍을수록 좋아요!</Text>
              </View>
              <View style={styles.zoomPill}>
                <Text style={styles.zoomText}>1x</Text>
              </View>
            </View>
          </RevealView>

          <RevealView delay={150}>
            <View style={styles.controls}>
              <Pressable accessibilityRole="button" style={styles.sideTool} onPress={pickPhoto}>
                <Text style={styles.sideToolIcon}>▧</Text>
                <Text style={styles.sideToolLabel}>앨범</Text>
              </Pressable>

              <Pressable accessibilityRole="button" style={styles.captureOuter} onPress={mode === 'audio' ? (recorderState.isRecording ? stopRecording : startRecording) : takePhoto} disabled={flow.isBusy || isCapturing}>
                <View style={styles.captureInner}>
                  <Text style={styles.captureIcon}>{mode === 'audio' ? (recorderState.isRecording ? '■' : '●') : '▣'}</Text>
                </View>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={styles.sideTool}
                onPress={() => {
                  setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));
                  setAssetUri(null);
                  setSelectedAsset(null);
                  setStatus('카메라 방향을 전환했습니다.');
                }}
              >
                <Text style={styles.sideToolIcon}>↻</Text>
              </Pressable>
            </View>
          </RevealView>

          <AudioRecorderSheet
            motion={audioSheetMotion}
            mode={mode}
            isRecording={recorderState.isRecording}
            durationMillis={recorderState.durationMillis}
            hasAsset={Boolean(selectedAsset && mode === 'audio')}
            onRecord={startRecording}
            onStop={stopRecording}
          />

          <RevealView delay={190}>
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>{flow.isBusy ? '기록 처리 중' : selectedAsset ? '판정 준비 완료' : mode === 'audio' ? '소리를 녹음해 주세요' : '사진을 촬영해 주세요'}</Text>
              <Text style={styles.statusBody}>{statusMessage}</Text>
              {selectedAsset ? (
                <Pressable accessibilityRole="button" style={styles.analysisButton} onPress={startAnalysis} disabled={flow.isBusy}>
                  <Text style={styles.analysisButtonText}>{mode === 'audio' ? '소리로 판정하기' : '사진으로 판정하기'}</Text>
                </Pressable>
              ) : null}
            </View>
          </RevealView>
        </ScrollView>
      </SafeAreaView>
    </GradientScreen>
  );
}

function ModeCard({ active, icon, title, onPress }: { active: boolean; icon: string; title: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={active ? { selected: true } : {}} onPress={onPress} style={[styles.modeCard, active ? styles.modeCardActive : null]}>
      <Text style={[styles.modeIcon, active ? styles.modeIconActive : null]}>{icon}</Text>
      <Text style={[styles.modeTitle, active ? styles.modeTitleActive : null]}>{title}</Text>
    </Pressable>
  );
}

function AudioRecorderSheet({
  motion,
  mode,
  isRecording,
  durationMillis,
  hasAsset,
  onRecord,
  onStop,
}: {
  motion: Animated.Value;
  mode: CaptureMode;
  isRecording: boolean;
  durationMillis: number;
  hasAsset: boolean;
  onRecord: () => void;
  onStop: () => void;
}) {
  const translateY = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [42, 0],
  });

  if (mode !== 'audio') {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.audioSheet,
        {
          opacity: motion,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.audioMeter}>
        <View style={[styles.audioMeterBar, isRecording ? styles.audioMeterBarActive : null]} />
        <View style={[styles.audioMeterBar, styles.audioMeterBarTall, isRecording ? styles.audioMeterBarActive : null]} />
        <View style={[styles.audioMeterBar, isRecording ? styles.audioMeterBarActive : null]} />
      </View>
      <View style={styles.audioCopy}>
        <Text style={styles.audioTitle}>{isRecording ? '녹음 중' : hasAsset ? '녹음 완료' : '녹음 대기'}</Text>
        <Text style={styles.audioBody}>{formatDuration(durationMillis)}</Text>
      </View>
      <Pressable accessibilityRole="button" style={[styles.audioButton, isRecording ? styles.audioButtonStop : null]} onPress={isRecording ? onStop : onRecord}>
        <Text style={styles.audioButtonText}>{isRecording ? '정지' : '녹음'}</Text>
      </Pressable>
    </Animated.View>
  );
}

function CameraPlaceholder() {
  return (
    <View style={styles.previewPlaceholder}>
      <View style={styles.greenWash} />
      <Text style={styles.previewCreature}>▣</Text>
    </View>
  );
}

function FocusCorner({ position }: { position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' }) {
  return <View style={[styles.focusCorner, styles[position]]} />;
}

function formatDuration(durationMillis: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 124,
  },
  header: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusSpacer: {
    width: 58,
  },
  titleGroup: {
    alignItems: 'center',
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.moss,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sprout: {
    color: colors.leaf,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '800',
  },
  bellButton: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
  },
  bellText: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '900',
  },
  bellDot: {
    position: 'absolute',
    right: 14,
    top: 13,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.clay,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.08)',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
  },
  modeCardActive: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  modeIcon: {
    color: colors.moss,
    fontSize: 32,
    fontWeight: '900',
  },
  modeIconActive: {
    color: colors.white,
  },
  modeTitle: {
    color: colors.moss,
    fontSize: 18,
    fontWeight: '900',
  },
  modeTitleActive: {
    color: colors.white,
  },
  cameraFrame: {
    height: 536,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#24440e',
  },
  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#26490f',
  },
  greenWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(71, 99, 22, 0.68)',
  },
  previewCreature: {
    color: colors.white,
    fontSize: 92,
    lineHeight: 110,
    fontWeight: '900',
  },
  cameraScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  roundOverlay: {
    position: 'absolute',
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.82)',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  helpButton: {
    left: 28,
    top: 28,
  },
  flashButton: {
    right: 28,
    top: 28,
  },
  roundOverlayText: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
  },
  focusCorner: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderColor: colors.white,
  },
  topLeft: {
    left: 34,
    top: 104,
    borderLeftWidth: 7,
    borderTopWidth: 7,
    borderTopLeftRadius: 10,
  },
  topRight: {
    right: 34,
    top: 104,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    left: 34,
    bottom: 42,
    borderLeftWidth: 7,
    borderBottomWidth: 7,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    right: 34,
    bottom: 42,
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderBottomRightRadius: 10,
  },
  previewCopy: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 88,
    alignItems: 'center',
    gap: 8,
  },
  previewCopyText: {
    color: colors.white,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  zoomPill: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.82)',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  zoomText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
  },
  controls: {
    minHeight: 136,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sideTool: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 7 },
  },
  sideToolIcon: {
    color: colors.moss,
    fontSize: 29,
    fontWeight: '900',
  },
  sideToolLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  captureOuter: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 66,
    borderWidth: 10,
    borderColor: 'rgba(255, 255, 255, 0.92)',
    backgroundColor: 'rgba(76, 122, 63, 0.18)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
  },
  captureInner: {
    width: 106,
    height: 106,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 53,
    backgroundColor: colors.moss,
  },
  captureIcon: {
    color: colors.white,
    fontSize: 44,
    fontWeight: '900',
  },
  audioSheet: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.08)',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
  },
  audioMeter: {
    width: 54,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 27,
    backgroundColor: 'rgba(109, 175, 69, 0.14)',
  },
  audioMeterBar: {
    width: 6,
    height: 18,
    borderRadius: 3,
    backgroundColor: 'rgba(76, 122, 63, 0.36)',
  },
  audioMeterBarTall: {
    height: 30,
  },
  audioMeterBarActive: {
    backgroundColor: colors.moss,
  },
  audioCopy: {
    flex: 1,
    gap: 4,
  },
  audioTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  audioBody: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  audioButton: {
    minWidth: 66,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.moss,
  },
  audioButtonStop: {
    backgroundColor: colors.clay,
  },
  audioButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  statusCard: {
    gap: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(23, 34, 25, 0.08)',
    padding: 16,
    backgroundColor: 'rgba(255, 253, 244, 0.76)',
  },
  statusTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  statusBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
  analysisButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.moss,
  },
  analysisButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
});
