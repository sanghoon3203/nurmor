# Atlas Task List

- [ ] **1. Project setup**
  - [ ] Expo TypeScript 프로젝트 초기화
  - [ ] `expo-camera`, `expo-av`, `expo-haptics`, `expo-font`, `react-native-reanimated`, `react-native-maps` 설치
  - [ ] `fonts/pokemon-bw.ttf`를 display font로 등록
  - [ ] 카메라, 마이크, 위치 권한 상태 처리

- [ ] **2. Habitat Bloom foundation**
  - [ ] `src/styles/tokens.ts`에 color/font/spacing/radius/shadow/border/motion token 정의
  - [ ] 기본 dark surface theme 구성
  - [ ] legacy neon/pixel/glass 효과를 accent-only policy로 제한

- [ ] **3. Primitive components**
  - [ ] `Button` 구현: primary, secondary, ghost, destructive
  - [ ] `SurfaceCard` 구현: default, selected, interactive, compact
  - [ ] `Text` 구현: caption, body, bodyStrong, title, display, badgeDisplay
  - [ ] `StatusBadge` 구현: neutral, info, success, warning, danger, brand

- [ ] **4. Capture Suite**
  - [ ] `CameraCaptureScreen` 구현
  - [ ] `ModeSegmentedControl`로 VISUAL/AUDIO 전환 구현
  - [ ] `CaptureControl` 구현
  - [ ] `WaveformMeter` 구현
  - [ ] 사진, 비디오, 오디오 캡처 파이프라인 연결

- [ ] **5. Gemini analysis and observation planting**
  - [ ] 백엔드 `MediaAsset`, `ObservationRecord`, `AnalysisJob` 모델 정의
  - [ ] `gemini-3-flash-preview` structured output schema 정의
  - [ ] 사진, 영상, 소리 분석 요청 파이프라인 구현
  - [ ] 분석 요청 loading 상태 구현
  - [ ] 분석 성공 후보 선택 UI 구현
  - [ ] 분석 실패/권한 오류 상태 구현
  - [ ] `지도에 심기` 확인 흐름 구현

- [ ] **6. Habitat cell map and codex**
  - [ ] `AtlasMapScreen` 구현
  - [ ] 지도 위 cell overlay 구현
  - [ ] `HabitatCell` variants 구현: unobserved, visited, seeded, growing, bloomed
  - [ ] 좌표를 cell key로 변환하는 로직 구현
  - [ ] 셀 상세 `FieldRevealSheet` 구현
  - [ ] `CodexEntry` 생성/갱신 로직 구현
  - [ ] 중복 후보 검사 및 기존 도감 항목 추가 흐름 구현
  - [ ] 기여자 표시 opt-in 설정 구현

- [ ] **7. Verification**
  - [ ] TypeScript 타입 검사 실행
  - [ ] 컴포넌트 variant/state 검증
  - [ ] 카메라/마이크/위치 권한 수동 검증
  - [ ] 지도 cell 터치 영역과 sheet 동작 검증
  - [ ] Gemini response schema validation 테스트
  - [ ] 위치 privacy와 기여자 표시 정책 검증
