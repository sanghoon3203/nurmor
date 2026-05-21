import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AtlasButton, SegmentedControl, SoftPanel, StepHeader } from '../atlas/ui';
import { colors, radii } from '../../theme/tokens';

type CaptureMode = '사진' | '영상' | '소리';

const captureModes: readonly CaptureMode[] = ['사진', '영상', '소리'];

export function CaptureScreen() {
  const [mode, setMode] = useState<CaptureMode>('사진');
  const [assetUri, setAssetUri] = useState<string | null>(null);
  const [status, setStatus] = useState('이 셀에 기록을 심을 준비');

  const pickMedia = async () => {
    if (mode === '소리') {
      setAssetUri(null);
      setStatus('소리 기록은 다음 단계에서 녹음 모듈과 연결됩니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mode === '영상' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled) {
      setAssetUri(result.assets[0]?.uri ?? null);
      setStatus(`${mode} 기록이 선택되었습니다.`);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader
          step={2}
          title="관찰 시작"
          subtitle="사진·영상·소리 중 하나를 남기고 현재 셀에 심을 기록을 준비합니다."
          action={
            <Pressable accessibilityRole="button" style={styles.closeButton} onPress={() => router.back()}>
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          }
        />

        <SegmentedControl options={captureModes} value={mode} onChange={setMode} />

        <View style={styles.preview}>
          {assetUri ? (
            <Image source={{ uri: assetUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.previewArt}>
              <View style={styles.sun} />
              <View style={styles.stem} />
              <View style={[styles.leaf, styles.leafLeft]} />
              <View style={[styles.leaf, styles.leafRight]} />
              <Text style={styles.previewTitle}>{mode} 기록</Text>
              <Text style={styles.previewBody}>나비, 풀꽃, 새소리처럼 이 셀의 생태 단서를 남겨보세요.</Text>
            </View>
          )}
          <View style={styles.locationPill}>
            <Text style={styles.locationText}>위치 기록 중</Text>
          </View>
        </View>

        <SoftPanel tone="green">
          <Text style={styles.panelTitle}>이 셀에 기록을 심을 준비</Text>
          <View style={styles.waveRow}>
            {Array.from({ length: 22 }, (_, index) => (
              <View key={index} style={[styles.wave, { height: 8 + (index % 5) * 6 }]} />
            ))}
          </View>
          <Text style={styles.panelBody}>{status}</Text>
        </SoftPanel>

        <View style={styles.actionGrid}>
          <Pressable accessibilityRole="button" style={styles.roundTool} onPress={pickMedia}>
            <Text style={styles.roundToolText}>{mode === '소리' ? '녹음' : '선택'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={[styles.roundTool, styles.captureTool]} onPress={pickMedia}>
            <View style={styles.captureDot} />
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.roundTool} onPress={() => setStatus('공개 위치는 셀 단위로만 표시됩니다.')}>
            <Text style={styles.roundToolText}>보호</Text>
          </Pressable>
        </View>

        <View style={styles.buttons}>
          <AtlasButton label="Gemini로 읽기" onPress={() => router.push('/analysis')} />
          <AtlasButton label="지도 돌아가기" variant="secondary" onPress={() => router.back()} />
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
  closeButton: {
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radii.round,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  closeText: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '900',
  },
  preview: {
    minHeight: 430,
    overflow: 'hidden',
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.warmLine,
    backgroundColor: colors.mint,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewArt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 28,
    backgroundColor: '#dceec8',
  },
  sun: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 16,
    borderColor: colors.bloom,
    backgroundColor: colors.cream,
  },
  stem: {
    width: 9,
    height: 112,
    borderRadius: 5,
    backgroundColor: colors.moss,
  },
  leaf: {
    position: 'absolute',
    width: 86,
    height: 42,
    borderTopLeftRadius: 42,
    borderBottomRightRadius: 42,
    backgroundColor: colors.leaf,
  },
  leafLeft: {
    top: 238,
    left: 96,
    transform: [{ rotate: '-22deg' }],
  },
  leafRight: {
    top: 292,
    right: 82,
    transform: [{ rotate: '18deg' }],
  },
  previewTitle: {
    color: colors.canopy,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 0,
  },
  previewBody: {
    maxWidth: 260,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '700',
  },
  locationPill: {
    position: 'absolute',
    top: 18,
    alignSelf: 'center',
    borderRadius: radii.round,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#315f2cee',
  },
  locationText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  panelTitle: {
    color: colors.canopy,
    fontSize: 17,
    fontWeight: '900',
  },
  panelBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  waveRow: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  wave: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.canopy,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
  },
  roundTool: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    borderWidth: 1,
    borderColor: colors.warmLine,
    backgroundColor: colors.paper,
  },
  captureTool: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 6,
    borderColor: colors.canopy,
  },
  captureDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.leaf,
  },
  roundToolText: {
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '900',
  },
  buttons: {
    gap: 10,
  },
});
