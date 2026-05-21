# Atlas Mobile Frontend To-Do

## Working Principle

프론트엔드는 한 번에 화면을 많이 만들기보다, 실제 백엔드와 연결되는 세로 흐름을 우선한다.

```text
login -> map -> capture -> upload -> observation -> analysis -> plant -> codex
```

## Phase 0: Project Setup

- [x] `/mobile` Expo TypeScript 앱 생성
- [x] Expo Router 추가
- [x] Location/Image Picker/Map dependencies 추가
- [x] `mobile/.env.example` 추가
- [x] 최소 앱 진입 화면 추가
- [ ] `mobile/.env` 작성
- [ ] iOS simulator 또는 Expo Go 실행 확인
- [ ] Android 실행 확인

## Phase 1: Auth and API Handshake

- [x] Firebase anonymous sign-in 구현
  - [x] Firebase Web API key를 `EXPO_PUBLIC_FIREBASE_API_KEY`로 읽는다.
  - [x] anonymous sign-in REST call로 ID token을 얻는다.
  - [x] token refresh 흐름을 추가한다.
- [x] API client 구현
  - [x] `EXPO_PUBLIC_ATLAS_API_BASE_URL`을 읽는다.
  - [x] bearer token을 자동 첨부한다.
  - [x] network error, unauthorized, server error를 분리한다.
- [x] 연결 확인 화면 구현
  - [x] `/actuator/health` 결과 표시
  - [x] `/api/habitat-cells/nearby` authenticated request 결과 표시

## Phase 2: Map Home

- [x] foreground location permission 요청
- [x] 권한 거부/허용/로딩 상태 UI 구현
- [x] 현재 위치를 지도 중심으로 설정
- [x] backend nearby cells를 지도 state로 보관
- [x] 빈 셀 상태를 명확히 표시
- [x] 셀 overlay 1차 구현
  - [x] 우선 polygon 또는 marker로 단순 표시
  - [x] bloom state별 색상 token 적용
  - [x] 셀 탭 시 cell summary 표시
- [x] 레퍼런스 UI 방향 반영
  - [x] 지도 위 HabitatCell overlay를 홈 화면의 중심 시각 요소로 재구성
  - [x] “내 생태 지도”, “기록 심기”, “셀 도감 보기” 흐름 추가
  - [x] 실제 backend cell이 없을 때도 제품 흐름을 볼 수 있는 preview cell 제공

## Phase 3: Capture and Upload

- [x] 사진 선택을 먼저 구현
- [x] 관찰 시작 화면 1차 구현
  - [x] 사진/영상/소리 segmented control
  - [x] 위치 기록 상태 표시
  - [x] 레퍼런스 기반 capture controls
- [x] Firebase Storage REST upload 유틸 구현
- [x] Firebase Storage object path 규칙 구현
  - [x] `users/{firebaseUid}/observations/{timestamp}-{filename}`
- [x] upload 완료 후 metadata 추출
- [x] `POST /api/media/register` 연결
- [ ] 이후 카메라 촬영 추가
- [ ] 소리 녹음 모듈 추가
- [ ] 실제 upload progress percentage 구현
- [ ] Firebase Storage Security Rules를 실기기 업로드로 검증

## Phase 4: Observation Create

- [x] 현재 위치와 media id를 묶어 observation 생성
- [x] `POST /api/observations` 연결
- [x] 성공 후 observation detail state 생성
- [ ] 실패 시 retry 가능하게 유지
- [x] exact location은 화면에 공개 표시하지 않는다.

## Phase 5: Analysis Flow

- [x] Gemini 분석 화면 1차 구현
  - [x] “기록을 읽는 중” 분석 ring
  - [x] species candidate card
  - [x] confidence/evidence 표시
  - [x] failed/schema validation 안내 copy
- [x] `POST /api/observations/{id}/analyze` 연결
- [x] 분석 결과를 앱 state에 보관
- [x] `GET /api/analysis-jobs/{id}` polling 구현
- [x] queued/running/succeeded/failed 기본 상태 UI 구현
- [x] 사용자가 후보를 지도에 심을 수 있게 한다.
- [x] 여러 후보 중 선택 UI 구현

## Phase 6: Plant and Codex

- [x] 서식지 셀 도감 화면 1차 구현
  - [x] bloom percentage card
  - [x] CodexEntryCard list
  - [x] contributor display setting
  - [x] HabitatCell 상태 legend
- [x] `POST /api/observations/{id}/plant` 연결
- [x] planted 성공 화면 구현
- [x] `GET /api/habitat-cells/{cellId}/codex` 연결
- [x] cell codex list/card UI 구현
- [ ] cell bloom score 갱신을 실제 DB row와 대조 확인

## Phase 7: Design Refinement

- [x] `skills/frontend.md`의 frontend-design 원칙을 읽고 디자인 방향을 고정한다.
- [x] 지도 화면의 브랜드 언어를 `Living Archive + Habitat Bloom`으로 맞춘다.
- [x] 점령/영토 언어는 피하고 기록/개화/서식지 언어를 사용한다.
- [x] 화면 밀도는 모바일 현장 사용에 맞게 낮게 유지한다.
- [x] 셀 overlay, capture button, analysis result card를 하나의 제품처럼 보이게 정리한다.
- [x] Expo Router 5탭 구조 추가: 도감/홈/기록/커뮤니티/마이
- [x] iPhone 전용 앱 느낌의 glassmorphism shell 1차 구현
- [x] 홈 지도 위 glass panel과 floating tab bar 적용
- [x] 커뮤니티 5km 최근 발견 카드 UI 1차 구현
- [x] 로그인/회원가입 UI shell 구현
- [ ] `expo-blur`, `expo-linear-gradient` 기반 native glass pass 적용
- [ ] 실제 식물/곤충 bitmap asset 또는 촬영 thumbnail을 연결한다.
- [ ] iOS/Android 실기기에서 화면 밀도와 터치 영역을 조정한다.

## Phase 8: QA

- [ ] iOS simulator smoke test
- [ ] Android smoke test
- [ ] 실제 Firebase Auth token으로 backend 200 확인
- [ ] token 없는 요청 401 확인
- [ ] 위치 권한 거부 상태 확인
- [ ] Firebase Storage upload 성공 확인
- [ ] upload 실패 상태 확인
- [ ] observation 생성 후 DB row 확인
- [ ] planted 후 codex row 확인

## Definition of Done for Frontend MVP

- [ ] 사용자가 모바일 앱에서 로그인된다.
- [ ] 현재 위치 기반 지도 홈이 열린다.
- [ ] 사진을 업로드할 수 있다.
- [ ] 관찰 기록이 Cloud SQL에 저장된다.
- [ ] Gemini 분석 후보가 보인다.
- [ ] 후보를 선택해 셀 도감에 심을 수 있다.
- [ ] 해당 셀의 도감과 bloom state가 앱에서 갱신된다.
