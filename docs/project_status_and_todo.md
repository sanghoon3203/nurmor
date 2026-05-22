# Atlas Project Status and To-Do

## Goal

Atlas는 지도 위 HabitatCell을 중심으로 지역 생태계 관찰 데이터를 수집하고, 사진/영상/소리를 AI로 분석해 셀 단위 도감으로 축적하는 모바일 제품이다. 최종 목표는 프론트엔드와 백엔드가 실제 Firebase Auth, Firebase Storage, Cloud SQL, Gemini 분석 흐름으로 완전히 연결되는 end-to-end MVP를 완성하는 것이다.

2026-05-22 기준으로 GCP 결제 한도 때문에 Cloud SQL/Cloud Run 기반 백엔드는 일시 중단하고, Firebase Spark/free-tier로 모바일 MVP를 먼저 완성한다. Spring Boot 백엔드는 Gemini 분석과 신뢰 가능한 집계 서버가 필요해지는 시점에 다시 활성화한다.

## Completed

### Product and Design Docs

- Atlas 리디자인 방향을 `Living Archive + Habitat Bloom` 구조로 정리했다.
- 지도 위 셀 overlay, 기록 심기, 개화도, 셀 도감 중심의 제품 언어를 정리했다.
- `ObservationRecord`, `MediaAsset`, `AnalysisJob`, `SpeciesCandidate`, `CodexEntry`, `HabitatCell` 중심의 도메인 모델을 문서화했다.
- `docs/project_spec.md`, `docs/components.md`, `docs/workflow.md`, `docs/design_system.md`, `docs/implementation_plan.md`, `docs/habitat_bloom_architecture.md`에 제품/기술 방향을 반영했다.
- 현재 백엔드 구조와 모바일 연결 방법을 `docs/backend_architecture_and_connection.md`에 재정립했다.

### Backend Foundation

- Java 21 + Spring Boot 3.5 API 서버를 생성했다.
- Dockerfile과 `.dockerignore`를 추가했다.
- Spring Web, Spring Data JPA, Spring Security, Actuator, Validation 기반을 구성했다.
- Cloud SQL PostgreSQL 연결을 검증했다.
- PostgreSQL 연결 URL에 `sslmode=require`가 필요함을 README에 반영했다.
- Flyway를 추가하고 `V1__init_atlas_schema.sql`로 초기 테이블을 생성했다.
- 실제 Cloud SQL에 Flyway migration 적용을 확인했다.
- `/actuator/health`가 `200 UP`으로 응답하는 것을 확인했다.

### Backend Auth

- Firebase Admin SDK 기반 ID token 검증 구조를 추가했다.
- `gcp` profile에서는 Firebase Admin SDK로 실제 토큰을 검증한다.
- `local/test` profile에서는 개발용 local token verifier를 사용한다.
- 모든 API는 bearer token 인증이 필요하고, `/actuator/health`만 공개된다.
- request body에서 `userId`를 제거하고 Firebase UID 기반 내부 user UUID를 서버에서 생성하도록 변경했다.

### Backend API and Domain

- `POST /api/media/register`
- `POST /api/observations`
- `POST /api/observations/{id}/analyze`
- `GET /api/analysis-jobs/{id}`
- `POST /api/observations/{id}/plant`
- `GET /api/habitat-cells/nearby?lat={lat}&lng={lng}&radiusKm=5`
- `GET /api/habitat-cells/{id}`
- `GET /api/habitat-cells/{cellId}/codex`
- `GET /api/codex?category={PLANT|ANIMAL|OTHER}&page=0&size=20`
- `GET /api/me`
- `PUT /api/me`
- `GET /api/me/stats`
- `GET /api/me/recent-observations`
- `GET /api/community/discoveries?lat={lat}&lng={lng}&radiusKm=5`

### Backend Mobile View Support

- `user_profiles` table을 추가해 마이페이지와 기여자 표시 opt-in을 지원한다.
- `CodexEntry`에 `category`, `representativeMediaKey`, `discoveryNumber`를 추가해 도감 2열 그리드와 필터 UI를 지원한다.
- 주변 지도/커뮤니티 API가 위치와 반경을 받도록 변경했다.
- 커뮤니티 feed는 planted observation을 기반으로 만들며 private 기록은 제외한다.
- 위치 공개는 계속 cell center/publicLat/publicLng만 사용한다.
- likes/comments는 현재 0 placeholder이며, 실제 상호작용 테이블은 다음 단계다.

### Verification

- Docker Maven test 통과: `13 tests, 0 failures`
- 모바일 백엔드 계약 테스트 통과: profile, stats, recent observations, nearby cells, global codex, community discoveries
- Docker image build 성공
- Local Docker backend smoke test 성공
- Cloud SQL direct `psql select 1` 성공
- Cloud SQL Flyway migration 성공
- `gcp` profile backend boot 성공 when Firebase service account JSON is mounted
- Unauthenticated API request returns `401`

### Mobile Foundation

- `/mobile`에 Expo + React Native + TypeScript 앱을 생성했다.
- Expo Router, Location, Image Picker, React Native Maps 기반 의존성을 추가했다.
- `mobile/.env.example`에 프론트엔드 public env 목록을 추가했다.
- Firebase anonymous sign-in REST flow를 추가했다.
- Firebase ID token persistence/refresh를 추가했다.
- 초기 진입 logo dissolve + leaf curtain launch gate를 추가했다.
- 기존 Firebase 세션이 있을 때만 자동으로 지도 탭으로 이동하고, 세션이 없으면 로그인 화면으로 이동하도록 변경했다.
- Atlas API health와 authenticated nearby-cell request를 연결했다.
- foreground location permission과 현재 위치 기반 지도 홈을 구현했다.
- 지도 홈의 nearby-cell request가 `lat/lng/radiusKm=5`를 전달하도록 연결했다.
- HabitatCell polygon/marker overlay와 cell summary panel을 구현했다.
- Firebase-only MVP 전환 계획을 `docs/firebase_only_mvp.md`에 정리했다.
- Firestore REST repository를 추가해 `habitatCells`, `codexEntries`, `users`, `communityDiscoveries`를 읽거나 생성할 수 있게 했다.
- 지도 홈은 Firestore `habitatCells`를 읽고 5km 반경 필터를 적용한다.
- 도감 화면은 Firestore `codexEntries`를 읽고 `전체/식물/동물/기타` 필터를 제공한다.
- 마이페이지는 Firestore `users/{uid}`를 읽거나 최초 접속 시 생성한다.
- 커뮤니티 화면은 Firestore `communityDiscoveries`를 읽고 5km 반경 공개 발견을 보여준다.
- 기록 심기 플로우는 Firebase Storage 업로드 후 Firestore `observations`, `codexEntries`, `communityDiscoveries`, `habitatCells`, `users/{uid}`를 쓰는 Firebase-only path로 전환했다.
- opening view는 logo dissolve + leaf curtain 라우팅으로 구성했고, 잎 타일 수를 2배로 늘려 전환 중 빈 공간을 줄였다.
- login view는 참고 PNG 방향으로 재구성했고, 브랜드명 텍스트 대신 `mobile/assets/brand/logo.png`를 사용한다.
- `firebase.json`, `firestore.rules`, `storage.rules`를 추가했다.

## Current State

```text
Backend MVP foundation: paused
Backend mobile read APIs: paused
Cloud SQL connection: paused due billing limit
Firebase-only mobile MVP: in progress
Firestore rules: drafted
Firebase Storage upload path: implemented in mobile
Gemini real structured response hardening: pending
Mobile app shell: Phase 1-2 complete
Frontend/backend full integration: replaced by frontend/Firebase integration for now
Cloud Run deployment: blocked by billing disabled
Production hardening: pending
```

## Backend To-Do

Firebase-only MVP가 완료될 때까지 아래 Spring/Cloud SQL 항목은 보류한다.

- [ ] Firebase Storage object 검증을 구현한다.
  - [ ] `storageKey`가 실제 Firebase Storage에 존재하는지 확인한다.
  - [ ] authenticated user가 해당 경로에 업로드한 파일인지 확인한다.
  - [ ] MIME type, size, checksum 검증 정책을 확정한다.
- [ ] media upload contract를 정리한다.
  - [ ] 프론트가 Firebase Storage에 직접 업로드한다.
  - [ ] 백엔드는 업로드된 object metadata만 검증하고 `MediaAsset`으로 등록한다.
- [ ] Gemini 분석 응답을 구조화한다.
  - [ ] JSON schema 또는 strict parser를 둔다.
  - [ ] 후보 생물 confidence/evidence validation을 추가한다.
  - [ ] 분석 실패 시 retry/error status를 명확히 한다.
- [ ] 분석 작업을 async로 전환한다.
  - [ ] `AnalysisJob` 생성과 실행을 분리한다.
  - [ ] polling 또는 push notification 전략을 정한다.
- [ ] 위치 privacy 정책을 테스트한다.
  - [ ] exact lat/lng는 private 처리한다.
  - [ ] public 지도에는 cell 단위 좌표만 노출한다.
  - [ ] 사용자 이름 공개는 opt-in으로 제한한다.
- [ ] 커뮤니티 상호작용 API를 설계한다.
  - [ ] `community_likes` 테이블
  - [ ] `community_comments` 테이블
  - [ ] 좋아요 토글 API
  - [ ] 댓글 목록/작성/삭제 API
- [ ] 대표 도감 이미지 정책을 완성한다.
  - [ ] `CodexEntry.representativeMediaKey` 선택 기준
  - [ ] Firebase Storage signed/read URL 전략
  - [ ] 썸네일 생성 또는 Expo client-side preview 전략
- [ ] API 통합 테스트를 확장한다.
  - [ ] auth success/failure
  - [ ] media register
  - [ ] observation create
  - [ ] analysis request
  - [ ] plant into codex
  - [x] mobile profile/stats/recent/codex/community contract
- [ ] Cloud Run 배포 구성을 만든다.
  - [ ] Secret Manager 연동
  - [ ] Cloud SQL connector 또는 private IP 전략
  - [ ] Firebase Admin credentials를 service account 기반으로 전환
  - [ ] 배포용 README/runbook 작성

## Frontend To-Do

- [x] Firebase anonymous login으로 ID token을 확보한다.
- [x] Firebase-only Firestore repository를 만든다.
  - [x] `habitatCells`
  - [x] `codexEntries`
  - [x] `users/{uid}`
  - [x] `communityDiscoveries`
- [ ] Atlas API client를 유지한다.
  - [x] `/actuator/health`
  - [x] authenticated `/api/habitat-cells/nearby?lat={lat}&lng={lng}&radiusKm=5`
  - [ ] Firebase-only MVP 중에는 필수 경로에서 제거한다.
- [x] 위치 권한 요청과 현재 위치 표시를 구현한다.
- [x] 지도 홈 화면을 구현한다.
- [x] HabitatCell overlay 또는 우선순위 셀 리스트를 구현한다.
- [x] 도감 필터 UI를 Firestore 데이터에 연결한다.
- [x] 마이페이지 프로필을 Firestore 데이터에 연결한다.
- [x] 커뮤니티 5km 피드를 Firestore 데이터에 연결한다.
- [ ] 사진 선택/촬영을 구현한다.
- [x] Firebase Storage 업로드를 구현한다.
- [x] Firebase-only 기록 심기 write path를 구현한다.
  - [x] `observations`
  - [x] `codexEntries`
  - [x] `communityDiscoveries`
  - [x] `habitatCells` aggregate update
  - [x] `users/{uid}` stats update
- [ ] 이메일/구글/애플 로그인 가입을 구현한다.
- [ ] Gemini 분석 요청과 결과 후보 UI는 Spring/Gemini 서버 재개 시 연결한다.

## Integration Milestones

- [ ] Milestone 1: Mobile app boots and shows backend health.
- [ ] Milestone 2: Firebase Auth ID token authenticates against Spring Boot API.
- [x] Milestone 3: Current location drives nearby HabitatCell request.
- [ ] Milestone 4: Firestore rules are deployed.
- [x] Milestone 5: Photo upload reaches Firebase Storage.
- [x] Milestone 6: Observation is created with location and media in Firestore.
- [x] Milestone 7: User plants one selected/manual candidate into a HabitatCell codex.
- [x] Milestone 8: Map cell bloom state updates from Firestore observation data.
- [x] Milestone 9: Mypage reads real Firestore profile.
- [x] Milestone 10: Community view reads real nearby Firestore discoveries within 5km.

## Operational Risks

- Firebase service account JSON must not be committed.
- `.env` and `mobile/.env` must stay local only.
- Public Cloud SQL IP is acceptable for local testing but should be replaced by Cloud Run/Cloud SQL connector or private networking for production.
- The frontend must never send `userId`; identity must come from Firebase ID token.
- Exact location must not be exposed in public APIs.
