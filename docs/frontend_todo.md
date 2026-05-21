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

- [ ] Firebase anonymous sign-in 구현
  - [ ] Firebase Web API key를 `EXPO_PUBLIC_FIREBASE_API_KEY`로 읽는다.
  - [ ] anonymous sign-in REST call 또는 Firebase JS SDK 중 하나로 ID token을 얻는다.
  - [ ] token refresh 흐름을 추가한다.
- [ ] API client 구현
  - [ ] `EXPO_PUBLIC_ATLAS_API_BASE_URL`을 읽는다.
  - [ ] bearer token을 자동 첨부한다.
  - [ ] network error, unauthorized, server error를 분리한다.
- [ ] 연결 확인 화면 구현
  - [ ] `/actuator/health` 결과 표시
  - [ ] `/api/habitat-cells/nearby` authenticated request 결과 표시

## Phase 2: Map Home

- [ ] foreground location permission 요청
- [ ] 권한 거부/허용/로딩 상태 UI 구현
- [ ] 현재 위치를 지도 중심으로 설정
- [ ] backend nearby cells를 지도 state로 보관
- [ ] 빈 셀 상태를 명확히 표시
- [ ] 셀 overlay 1차 구현
  - [ ] 우선 polygon 또는 marker로 단순 표시
  - [ ] bloom state별 색상 token 적용
  - [ ] 셀 탭 시 cell summary 표시

## Phase 3: Capture and Upload

- [ ] 사진 선택을 먼저 구현
- [ ] 이후 카메라 촬영 추가
- [ ] Firebase Storage path 규칙 확정
  - [ ] `users/{firebaseUid}/observations/{timestamp}-{filename}`
- [ ] Firebase Storage upload 구현
- [ ] upload progress UI 구현
- [ ] upload 완료 후 metadata 추출
- [ ] `POST /api/media/register` 연결

## Phase 4: Observation Create

- [ ] 현재 위치와 media id를 묶어 observation 생성
- [ ] `POST /api/observations` 연결
- [ ] 성공 후 observation detail state 생성
- [ ] 실패 시 retry 가능하게 유지
- [ ] exact location은 화면에 공개 표시하지 않는다.

## Phase 5: Analysis Flow

- [ ] `POST /api/observations/{id}/analyze` 연결
- [ ] `GET /api/analysis-jobs/{id}` polling 구현
- [ ] queued/running/succeeded/failed 상태 UI 구현
- [ ] species candidates card 구현
- [ ] confidence/evidence 표시
- [ ] 사용자가 후보를 선택할 수 있게 한다.

## Phase 6: Plant and Codex

- [ ] `POST /api/observations/{id}/plant` 연결
- [ ] planted 성공 화면 구현
- [ ] cell bloom score 갱신 확인
- [ ] `GET /api/habitat-cells/{cellId}/codex` 연결
- [ ] cell codex list/card UI 구현

## Phase 7: Design Refinement

- [ ] `skills/frontend.md`의 frontend-design 원칙을 읽고 디자인 방향을 고정한다.
- [ ] 지도 화면의 브랜드 언어를 `Living Archive + Habitat Bloom`으로 맞춘다.
- [ ] 점령/영토 언어는 피하고 기록/개화/서식지 언어를 사용한다.
- [ ] 화면 밀도는 모바일 현장 사용에 맞게 낮게 유지한다.
- [ ] 셀 overlay, capture button, analysis result card를 하나의 제품처럼 보이게 정리한다.

## Phase 8: QA

- [ ] iOS simulator smoke test
- [ ] Android smoke test
- [ ] 실제 Firebase Auth token으로 backend 200 확인
- [ ] token 없는 요청 401 확인
- [ ] 위치 권한 거부 상태 확인
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
