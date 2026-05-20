# Atlas Implementation Plan

## 1. Project Initialization

Atlas는 Expo 기반 React Native 앱으로 구현한다.

### 1.1 Setup
- `npx create-expo-app --template blank-typescript`로 초기화한다.
- 필수 의존성:
  - `expo-camera`: 사진/비디오 촬영
  - `expo-av`: 오디오 녹음 및 재생
  - `expo-haptics`: 의미 있는 순간의 햅틱 피드백
  - `expo-font`: 특수 display font 로드
  - `react-native-reanimated`: 캡처/분석 상태 motion
  - `react-native-maps`: 위치 기반 지도

### 1.2 Assets
- `fonts/pokemon-bw.ttf`는 `font.family.display` 용도로만 등록한다.
- 본문과 일반 UI는 플랫폼 시스템 폰트를 사용한다.

## 2. Design System Foundation

### 2.1 `src/styles/tokens.ts`
[design_system.md](./design_system.md)의 토큰을 코드로 정의한다.

필수 token group:
- `color`
- `font`
- `spacing`
- `radius`
- `shadow`
- `border`
- `motion`

### 2.2 Theme Policy
- 기본 UI에는 그라디언트, 픽셀 보더, 강한 glow를 사용하지 않는다.
- 발견 완료, rare finding, 지도 overlay 해제 같은 순간적 피드백에만 legacy accent를 허용한다.

## 3. Primitive Components

### 3.1 `Button`
- variants: `primary`, `secondary`, `ghost`, `destructive`
- states: `default`, `pressed`, `focused`, `disabled`, `loading`
- loading 중 중복 제출을 막는다.

### 3.2 `SurfaceCard`
- variants: `default`, `selected`, `interactive`, `compact`
- 기본 shadow는 사용하지 않는다.
- 선택 상태는 border와 subtle tint로 표현한다.

### 3.3 `Text`
- variants: `caption`, `body`, `bodyStrong`, `title`, `display`, `badgeDisplay`
- `badgeDisplay`만 `pokemon-bw.ttf`를 사용할 수 있다.

### 3.4 `StatusBadge`
- variants: `neutral`, `info`, `success`, `warning`, `danger`, `brand`
- recording, permission, analysis state를 짧게 표현한다.

## 4. Capture Suite

### 4.1 `CameraCaptureScreen`
- `VISUAL`과 `AUDIO` 모드를 제공한다.
- 화면 하단 중앙에 `CaptureControl`을 배치한다.
- 상단에는 recording/permission 상태를 `StatusBadge`로 표시한다.

### 4.2 `CaptureControl`
- variants: `photo`, `video`, `audio`, `stop`
- states: `idle`, `recording`, `processing`, `disabled`
- 햅틱은 캡처 시작, 캡처 중지, 분석 완료에만 사용한다.

### 4.3 `WaveformMeter`
- 오디오 입력 크기를 bar group으로 표시한다.
- clipping 상태만 warning/danger 색상으로 전환한다.
- 과한 네온 그라디언트 대신 brand color 기반의 읽기 쉬운 meter를 사용한다.

## 5. AI Analysis Result

### 5.1 Analysis Pending
- `Button`은 loading 상태로 전환한다.
- 사용자가 현재 어떤 파일을 분석 중인지 metadata를 보여준다.

### 5.2 Analysis Success
- 발견명, 신뢰도, 주요 특징, 위치 정보를 `SurfaceCard`로 구성한다.
- 발견 완료 배지에만 `font.family.display`를 사용할 수 있다.

### 5.3 Analysis Failure
- 오류 원인은 user-facing copy로 정리한다.
- 다시 촬영, 다시 분석 같은 다음 행동을 명확히 제공한다.

## 6. Atlas Map

### 6.1 `AtlasMapScreen`
- 현재 위치, 이동 경로, 발견 위치, 커뮤니티 핫스팟을 표시한다.
- 지도 위 정보는 최소화하고 상세는 bottom sheet로 제공한다.

### 6.2 `MapPin`
- variants: `currentLocation`, `discovery`, `community`, `selected`
- 터치 가능 영역은 44px 이상 확보한다.

### 6.3 Exploration Overlay
- 미탐사 영역은 낮은 대비 grid overlay로 표현한다.
- 발견 성공 시 overlay가 조용히 해제된다.

## 7. Verification Plan

- TypeScript 타입 검사: `tsc --noEmit`
- 주요 컴포넌트 상태별 snapshot 또는 interaction test
- 미디어 권한 거부/허용 상태 수동 검증
- 지도 pin 터치 영역과 bottom sheet 동작 수동 검증
- 텍스트 대비와 dynamic type 대응 검토
