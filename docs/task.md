# Atlas Task List

- [ ] **1. Project setup**
  - [ ] Expo TypeScript 프로젝트 초기화
  - [ ] `expo-camera`, `expo-av`, `expo-haptics`, `expo-font`, `react-native-reanimated`, `react-native-maps` 설치
  - [ ] `fonts/pokemon-bw.ttf`를 display font로 등록
  - [ ] 카메라, 마이크, 위치 권한 상태 처리

- [ ] **2. Calm Field System foundation**
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

- [ ] **5. AI analysis UI**
  - [ ] 분석 요청 loading 상태 구현
  - [ ] 분석 성공 결과 카드 구현
  - [ ] 분석 실패/권한 오류 상태 구현
  - [ ] 발견 완료 accent 연출 구현

- [ ] **6. Atlas Map**
  - [ ] `AtlasMapScreen` 구현
  - [ ] `MapPin` variants 구현
  - [ ] 현재 위치, 이동 경로, 발견 위치 표시
  - [ ] 낮은 대비 exploration grid overlay 구현

- [ ] **7. Verification**
  - [ ] TypeScript 타입 검사 실행
  - [ ] 컴포넌트 variant/state 검증
  - [ ] 카메라/마이크/위치 권한 수동 검증
  - [ ] 지도 pin 터치 영역과 bottom sheet 동작 검증
