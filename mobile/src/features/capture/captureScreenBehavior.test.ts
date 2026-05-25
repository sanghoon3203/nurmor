import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

function readSource(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

test('capture screen defaults to direct camera capture and keeps album as a secondary action', () => {
  const source = readSource('src/features/capture/CaptureScreen.tsx');

  assert.equal(source.includes("from 'expo-camera'"), true);
  assert.equal(source.includes('CameraView'), true);
  assert.equal(source.includes('useCameraPermissions'), true);
  assert.equal(source.includes('takePictureAsync'), true);
  assert.equal(source.includes('launchImageLibraryAsync'), true);
  assert.equal(source.includes('selectedAsset ? startAnalysis : pickPhoto'), false);
});

test('capture screen removes mode subtitles and opens the audio recorder with a transition', () => {
  const source = readSource('src/features/capture/CaptureScreen.tsx');

  assert.equal(source.includes('사진으로 생명을 찾아요'), false);
  assert.equal(source.includes('소리로 생명을 찾아요'), false);
  assert.equal(source.includes("from 'expo-audio'"), true);
  assert.equal(source.includes('useAudioRecorder'), true);
  assert.equal(source.includes('audioSheetMotion'), true);
  assert.equal(source.includes('startRecording'), true);
  assert.equal(source.includes('stopRecording'), true);
});

test('app config declares native camera and microphone permission plugins for Expo builds', () => {
  const source = readSource('app.json');

  assert.equal(source.includes('expo-camera'), true);
  assert.equal(source.includes('cameraPermission'), true);
  assert.equal(source.includes('expo-audio'), true);
  assert.equal(source.includes('microphonePermission'), true);
});

test('analysis screen uses the sparkles gif while judging photos and removes mock butterfly fallback copy', () => {
  const source = readSource('src/features/analysis/AnalysisScreen.tsx');

  assert.equal(source.includes("require('../../../assets/Sparkles Loop Loader ai.gif')"), true);
  assert.equal(source.includes('discoveryCandidate'), false);
  assert.equal(source.includes('노랑나비'), false);
  assert.equal(source.includes('사진을 판정하는 중'), true);
  assert.equal(source.includes('styles.loaderGif'), true);
});

test('analysis screen removes cell sharing UI and saves records by location name', () => {
  const source = readSource('src/features/analysis/AnalysisScreen.tsx');

  assert.equal(source.includes('셀 도감'), false);
  assert.equal(source.includes('셀 또는 커뮤니티'), false);
  assert.equal(source.includes('/cell'), false);
  assert.equal(source.includes('locationName'), true);
  assert.equal(source.includes('내 도감에 저장하기'), true);
});
