# Atlas Project Status and To-Do

## Goal

Atlas는 지도 위 HabitatCell을 중심으로 지역 생태계 관찰 데이터를 수집하고, 사진/영상/소리를 AI로 분석해 셀 단위 도감으로 축적하는 모바일 제품이다. 최종 목표는 프론트엔드와 백엔드가 실제 Firebase Auth, Firebase Storage, Cloud SQL, Gemini 분석 흐름으로 완전히 연결되는 end-to-end MVP를 완성하는 것이다.

## Completed

### Product and Design Docs

- Atlas 리디자인 방향을 `Living Archive + Habitat Bloom` 구조로 정리했다.
- 지도 위 셀 overlay, 기록 심기, 개화도, 셀 도감 중심의 제품 언어를 정리했다.
- `ObservationRecord`, `MediaAsset`, `AnalysisJob`, `SpeciesCandidate`, `CodexEntry`, `HabitatCell` 중심의 도메인 모델을 문서화했다.
- `docs/project_spec.md`, `docs/components.md`, `docs/workflow.md`, `docs/design_system.md`, `docs/implementation_plan.md`, `docs/habitat_bloom_architecture.md`에 제품/기술 방향을 반영했다.

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
- `GET /api/habitat-cells/nearby`
- `GET /api/habitat-cells/{id}`
- `GET /api/habitat-cells/{cellId}/codex`

### Verification

- Docker Maven test 통과: `9 tests, 0 failures`
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
- Atlas API health와 authenticated nearby-cell request를 연결했다.
- foreground location permission과 현재 위치 기반 지도 홈을 구현했다.
- HabitatCell polygon/marker overlay와 cell summary panel을 구현했다.

## Current State

```text
Backend MVP foundation: complete
Cloud SQL connection: complete
Firebase Auth backend verification path: complete
Firebase Storage upload verification: pending
Gemini real structured response hardening: pending
Mobile app shell: Phase 1-2 complete
Frontend/backend full integration: in progress
Production deployment: pending
```

## Backend To-Do

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
- [ ] API 통합 테스트를 확장한다.
  - [ ] auth success/failure
  - [ ] media register
  - [ ] observation create
  - [ ] analysis request
  - [ ] plant into codex
- [ ] Cloud Run 배포 구성을 만든다.
  - [ ] Secret Manager 연동
  - [ ] Cloud SQL connector 또는 private IP 전략
  - [ ] Firebase Admin credentials를 service account 기반으로 전환
  - [ ] 배포용 README/runbook 작성

## Frontend To-Do

- [ ] Firebase anonymous login으로 ID token을 확보한다.
- [ ] Atlas API client를 만든다.
  - [ ] `/actuator/health`
  - [ ] authenticated `/api/habitat-cells/nearby`
- [ ] 위치 권한 요청과 현재 위치 표시를 구현한다.
- [ ] 지도 홈 화면을 구현한다.
- [ ] HabitatCell overlay 또는 우선순위 셀 리스트를 구현한다.
- [ ] 사진 선택/촬영을 구현한다.
- [ ] Firebase Storage 업로드를 구현한다.
- [ ] `POST /api/media/register`와 `POST /api/observations`를 연결한다.
- [ ] Gemini 분석 요청과 결과 후보 UI를 구현한다.
- [ ] 후보 선택 후 셀 도감에 심는 flow를 구현한다.

## Integration Milestones

- [ ] Milestone 1: Mobile app boots and shows backend health.
- [ ] Milestone 2: Firebase Auth ID token authenticates against Spring Boot API.
- [ ] Milestone 3: Current location drives nearby HabitatCell request.
- [ ] Milestone 4: Photo upload reaches Firebase Storage and registers `MediaAsset`.
- [ ] Milestone 5: Observation is created with location and media.
- [ ] Milestone 6: Gemini analysis creates species candidates.
- [ ] Milestone 7: User plants one candidate into a HabitatCell codex.
- [ ] Milestone 8: Map cell bloom state updates from real observation data.

## Operational Risks

- Firebase service account JSON must not be committed.
- `.env` and `mobile/.env` must stay local only.
- Public Cloud SQL IP is acceptable for local testing but should be replaced by Cloud Run/Cloud SQL connector or private networking for production.
- The frontend must never send `userId`; identity must come from Firebase ID token.
- Exact location must not be exposed in public APIs.
