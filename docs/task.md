# Eco-Pokedex 개발 할 일 목록 (Task List)

- [ ] **1. 프로젝트 초기화 (Project Initialization)**
  - [ ] `scratch/eco_pokedex` 폴더 생성 및 Expo CLI 프로젝트 초기화
  - [ ] 필수 종속성 패키지 설치 (`expo-camera`, `expo-av`, `react-native-reanimated`, `expo-haptics`, `expo-font`, `expo-linear-gradient`, `lottie-react-native`, `react-native-maps`)
  - [ ] 로컬 폰트 파일 복사 (`pokemon-bw.ttf` -> `assets/fonts/pokemon-bw.ttf`)
  - [ ] 폰트 및 리소스 로딩을 포함한 Splash Screen/App 진입점 구축

- [ ] **2. Antigravity 디자인 시스템 구축 (Design System & Primitives)**
  - [ ] `src/styles/theme.ts` 정의 (Neon Cyan, Purple, Pink 그라디언트 맵 및 `pixelBorderStyles` 정의)
  - [ ] `src/components/Typography.tsx` 작성 (로컬 폰트 설정 및 가독성 픽셀 그림자 구현)
  - [ ] `src/components/AntigravityGradientButton.tsx` 작성 (그라디언트, 스프링 Easing 축소 애니메이션, 햅틱 피드백 연동)
  - [ ] `src/components/GlassmorphicPixelCard.tsx` 작성 (계단식 픽셀 보더, 반투명 글래스 이펙트 및 네온 테두리 반사광 처리)

- [ ] **3. 카메라 및 단독 오디오 레코딩 HUD 뷰 (Camera & Audio Capture View)**
  - [ ] `src/screens/CameraCaptureScreen.tsx` 생성 및 글래스모피즘 HUD 오버레이 마크업
  - [ ] Reanimated 기반 상하 루핑 네온 스캔라인 및 깜빡이는 REC LED 도트 효과 구현
  - [ ] `src/components/DecibelWaveform.tsx` 작성 (실시간 음파 피치 변화 시각화 - 이완 감속 및 그라디언트 적용)
  - [ ] 비디오 녹화 파이프라인 및 단독 오디오 레코딩 파이프라인(AV) 구축

- [ ] **4. 지도 기반 생태 탐사 맵 구현 (Eco-Map & Fog of War)**
  - [ ] `src/screens/EcoMapScreen.tsx` 생성 및 지도 모듈 연동
  - [ ] **미발견 지역 안개(Fog of War) 그리드 렌더러** 구현 (미탐색 그리드 반투명 오버레이 처리)
  - [ ] **My Trail 실시간 동선 추적** 기능 구현 (GPS 연동 및 네온 사이언 선 그리기)
  - [ ] 크라우드 소싱 도감 핀 마킹 컴포넌트 설계

- [ ] **5. 통합 및 빌드 테스트 (Integration & Build Testing)**
  - [ ] `App.tsx` 또는 네비게이션 구조를 통해 캡처 뷰 ↔ 도감 맵 연동
  - [ ] 정적 타입 검사 (`tsc --noEmit`) 실행
  - [ ] 디바이스 또는 시뮬레이터 상에서의 프레임 유지 및 빌드 검증
