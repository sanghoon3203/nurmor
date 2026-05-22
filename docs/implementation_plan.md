# Atlas Implementation Plan

## 1. Project Initialization

Atlas는 Expo 기반 React Native 앱과 별도 백엔드 API로 구현한다. 모바일 앱은 캡처, 지도 셀 UI, 도감 확인을 담당하고, 백엔드는 미디어 저장, Gemini 분석, HabitatCell 계산, 도감 등록, 개인정보 보호를 담당한다.

### 1.1 Setup
- `npx create-expo-app --template blank-typescript`로 초기화한다.
- 필수 의존성:
  - `expo-camera`: 사진/비디오 촬영
  - `expo-av`: 오디오 녹음 및 재생
  - `expo-haptics`: 의미 있는 순간의 햅틱 피드백
  - `expo-font`: 특수 display font 로드
  - `react-native-reanimated`: 캡처/분석 상태 motion
  - `react-native-maps`: 위치 기반 지도

### 1.3 Backend Baseline
- 인증된 API 서버를 둔다.
- Gemini API 키는 백엔드 환경 변수로만 관리한다.
- 미디어 업로드, 분석 작업, 지도 셀, 도감 항목은 백엔드가 권위 데이터를 가진다.

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
- `Habitat Bloom` 방향을 따른다.
- 지도는 밝은 field surface와 habitat cell overlay를 기본으로 한다.
- 도감/분석 결과는 warm paper sheet를 사용한다.
- 발견 완료, 개화도 상승, 셀 상태 변화 같은 순간에만 bloom ring motion을 사용한다.

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
- copy는 `기록을 읽는 중`을 사용한다.

### 5.2 Analysis Success
- 생물 후보, 신뢰도, 관찰 근거, 위치 셀 정보를 warm paper sheet로 구성한다.
- Gemini 결과는 `추정`으로 표시한다.
- 사용자가 후보를 선택하고 `지도에 심기`를 눌러 등록을 완료한다.

### 5.3 Analysis Failure
- 오류 원인은 user-facing copy로 정리한다.
- 다시 촬영, 다시 분석 같은 다음 행동을 명확히 제공한다.

## 6. Habitat Cell Map

### 6.1 `AtlasMapScreen`
- 현재 위치와 주변 HabitatCell overlay를 표시한다.
- 셀 상태는 `unobserved`, `visited`, `seeded`, `growing`, `bloomed`로 구분한다.
- 지도 위 정보는 최소화하고 상세는 `FieldRevealSheet`로 제공한다.

### 6.2 `HabitatCell`
- variants: `unobserved`, `visited`, `seeded`, `growing`, `bloomed`, `selected`
- 셀은 개화도, 기록 수, 대표 생물 후보, 공개 기여자 요약을 표시한다.
- 터치 가능 영역은 44px 이상 확보한다.

### 6.3 Codex Registration
- 분석 성공 후 사용자가 `지도에 심기`를 선택하면 `ObservationRecord`가 현재 셀에 연결된다.
- 같은 셀에 유사한 `CodexEntry`가 있으면 기존 항목에 추가할지 새 항목으로 등록할지 선택한다.
- 등록 후 셀의 `개화도`와 상태가 갱신된다.

## 7. Backend Logic

### 7.1 Media And Observation
- 모바일 앱이 Firebase Storage에 사진, 영상, 소리를 직접 업로드한다.
- `POST /api/media/register`로 업로드된 object metadata를 백엔드에 등록한다.
- `POST /api/observations`로 위치 metadata와 media asset을 묶어 관찰 record를 만든다.
- 정확 좌표는 private field로 저장하고 공개 지도에는 cell 단위 위치를 사용한다.

### 7.2 Gemini Analysis
- `POST /api/observations/:id/analyze`에서 `gemini-3.1-flash-lite` 분석 작업을 생성한다.
- structured JSON output을 요구하고 서버에서 schema validation을 수행한다.
- 생물 후보, 신뢰도, 관찰 근거, 불확실성 이유를 저장한다.

### 7.3 Habitat Cell And Codex
- 좌표를 `cellKey`로 변환해 `HabitatCell`을 찾거나 생성한다.
- 사용자가 후보를 선택하면 `POST /api/observations/:id/plant`로 셀에 기록을 심는다.
- 기존 도감 항목과 중복 후보를 검사한 뒤 `CodexEntry`를 생성하거나 갱신한다.
- `bloomScore`는 고유 기록 수, 생물 다양성, 미디어 다양성, 반복 관찰을 기반으로 계산한다.
- `GET /api/habitat-cells/nearby?lat={lat}&lng={lng}&radiusKm=5`로 지도 홈의 주변 셀을 조회한다.
- `GET /api/codex?category={PLANT|ANIMAL|OTHER}&page=0&size=20`로 도감 그리드를 조회한다.

### 7.4 Profile And Community
- `GET /api/me`, `PUT /api/me`로 사용자 프로필과 기여자 표시 opt-in을 관리한다.
- `GET /api/me/stats`는 마이페이지의 보고 횟수, 발견 생물, 업적 요약에 사용한다.
- `GET /api/me/recent-observations`는 내가 최근 발견한 것들 목록에 사용한다.
- `GET /api/community/discoveries?lat={lat}&lng={lng}&radiusKm=5`는 근방 5km 커뮤니티 피드를 제공한다.
- 커뮤니티 응답은 private observation을 제외하고, 공개 좌표는 cell center만 사용한다.

## 8. Verification Plan

- TypeScript 타입 검사: `tsc --noEmit`
- 주요 컴포넌트 상태별 snapshot 또는 interaction test
- 미디어 권한 거부/허용 상태 수동 검증
- 지도 cell 터치 영역과 `FieldRevealSheet` 동작 수동 검증
- Gemini structured output validation 테스트
- 위치 공개 범위와 기여자 표시 정책 테스트
- 텍스트 대비와 dynamic type 대응 검토
