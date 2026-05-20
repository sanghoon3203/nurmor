# 레트로 픽셀 아트 멀티모달 에코 도감 (Eco-Pokedex) 구현 계획서 (Implementation Plan)

## 1. 프로젝트 초기화 (Project Initialization)
프로젝트 디렉토리를 초기화하고 Expo 및 UI 구현에 필요한 핵심 패키지들을 설치합니다.

### 1.1 초기 설정 및 CLI 실행
*   `npx create-expo-app --template blank-typescript`를 실행하여 초기 구조를 잡습니다.
*   의존성 추가 목록:
    *   `react-native-reanimated` (부드러운 애니메이션 및 트랜지션)
    *   `expo-camera` (동영상 및 사진 촬영)
    *   `expo-av` (오디오 녹음 및 재생)
    *   `expo-haptics` (물리적 피드백)
    *   `expo-font` (로컬 폰트 로드용)
    *   `expo-linear-gradient` (픽셀 카드 및 버튼 그라디언트 배경)
    *   `lottie-react-native` (스캔 및 성공 애니메이션 오버레이)
    *   `react-native-maps` (GPS 기반 에코 맵)

### 1.2 로컬 폰트 복사
*   `C:\Users\starn\Downloads\pokemon-bw.ttf` 경로의 파일을 프로젝트 폴더 내 `assets/fonts/pokemon-bw.ttf`로 복사합니다.

---

## 2. 디자인 시스템 및 공통 컴포넌트 구현 (Design System & Primitives)
레트로 게임 감성을 완벽히 구현하기 위한 테마와 픽셀 형태의 테두리 디자인 시스템을 구축합니다.

### 2.1 theme.ts (스타일 테마)
*   **어두운 우주 배경**: `#08080c`
*   **Antigravity 네온 그라디언트**: `#00f0ff` (Cyan) ➔ `#8a2be2` (Purple) ➔ `#ff007f` (Pink)
*   **생태 에메랄드 그라디언트**: `#00ff66` (Green) ➔ `#00f0ff` (Cyan)
*   **각진 픽셀 더블 보더 스타일** (`pixelBorderStyles`): `borderWidth: 4`, `borderColor: '#000000'`, 입체 섀도우 연출.

### 2.2 Typography.tsx (타이포그래피 컴포넌트)
*   제공받은 `pokemon-bw.ttf` 폰트를 로딩 및 적용.
*   자간(letter-spacing) 및 가독성 픽셀 그림자 추가.
*   폰트 로드 완료 전에는 모노스페이스(`monospace`, `Courier`) 시스템 폰트로 폴백.

### 2.3 AntigravityGradientButton.tsx (그라디언트 버튼 컴포넌트)
*   그라디언트 배경과 픽셀 보더를 적용한 레트로 버튼.
*   눌림 상태 시 `translateY: 4` 물리 이동 및 햅틱 진동 피드백 (`expo-haptics` 연동).

### 2.4 GlassmorphicPixelCard.tsx (글래스모피즘 픽셀 카드 컴포넌트)
*   입체적인 픽셀 보더와 투명도, 블러 필터 효과가 적용된 배경 카드.
*   카드 상단 모서리에 미세한 흰색/네온 그라디언트 하이라이트 레이어 렌더링.

---

## 3. 카메라 및 오디오 캡처 뷰 구현 (Camera & Audio Capture View)

### 3.1 CameraCaptureScreen.tsx (캡처 뷰)
*   **하이브리드 모드 전환**:
    *   `VISUAL` 모드: 동영상 및 사진 촬영을 기본으로 하며, 비디오 촬영 시 오디오 동시 녹음.
    *   `AUDIO` 모드: 비디오 화면 대신 레트로 스타일의 사운드 수집 전용 모드 활성화. (화면에는 픽셀 오디오 파형이 메인으로 렌더링되며, 소리만 단독 녹음)
*   **레트로 HUD 오버레이**:
    *   위아래로 움직이는 네온 그린 스캔 라인 (Reanimated 루프 애니메이션).
    *   중앙의 픽셀화된 조준점(Crosshair) 타겟팅 박스.
    *   상단의 깜빡이는 녹화 표시등(`REC` 모드 시 빨간색 도트 점멸).

### 3.2 DecibelWaveform.tsx (음파 시각화)
*   실시간 오디오 입력 신호 세기(Decibel/Metering)를 픽셀화된 레벨 미터 바로 시각화해 주는 컴포넌트.
*   Easing 함수를 사용하여 볼륨 변화가 각지고 거칠게 튀지 않도록 부드러운 전환 구현.

---

## 4. 지도 기반 생태 탐사 맵 구현 (Eco-Map & Fog of War)

### 4.1 EcoMapScreen.tsx (지도 화면)
*   `react-native-maps`를 활용한 지도 인터페이스.
*   **안개 지역 (Fog of War)**: 미탐사 격자 구역을 반투명 픽셀 그리드로 덮고, 생명체 등록 성공 시 해당 범위의 안개가 걷히는 기믹.
*   **실시간 동선 기록 (My Trail)**: GPS 연동으로 궤적을 픽셀 점선 라인으로 시각화.
*   **크라우드 소싱 도감 핀**: 다른 사용자가 수집한 정보(핫스팟)를 그라디언트 서클 및 아이콘 핀으로 노출.

---

## 5. 검증 및 빌드 테스트 (Verification Plan)

### 5.1 자동화 테스트
*   TypeScript 타입 오류 검증 (`tsc --noEmit`).
*   Expo 개발 서버 구동 에러 체크.

### 5.2 수동 검증
1.  **디자인 및 폰트**: 제공해주신 `pokemon-bw.ttf` 폰트가 UI 텍스트에 적용되는지 검증.
2.  **애니메이션 및 미디어**: 버튼 눌림, 햅틱 피드백, 실시간 스캔라인 동작 확인. 비디오 및 단독 오디오 녹음 저장 파일 동작 확인.
3.  **지도 및 위치**: GPS 추적 및 그리드 타일 안개 제거 효과가 제대로 매핑되는지 기기에서 확인.
