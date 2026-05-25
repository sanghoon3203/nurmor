# Atlas

Atlas는 사용자가 사진이나 소리로 생명을 기록하고, 그 기록을 지도 셀·도감·커뮤니티·마이페이지 통계로 연결하는 생태 탐색 앱입니다.

현재 저장소는 두 영역으로 구성됩니다.

- `src/`: Java 21 + Spring Boot 기반 Atlas API 서버
- `mobile/`: Expo + React Native 기반 모바일 앱

## 현재 구현 범위

### 백엔드

- Firebase ID Token 기반 인증
- Firebase Storage에 업로드된 미디어 metadata 등록
- 관찰 기록 생성
- Gemini 분석 후보 생성
- 사용자가 선택한 후보를 지역 셀 도감에 심기
- 주변 지도 셀 조회
- 지도 마커용 발견 데이터 조회
- 지역 생태보고서 조회
- 커뮤니티 발견 목록 조회
- 마이페이지 프로필, 통계, 최근 기록 조회

### 모바일

- Expo Router 기반 5탭 구조
  - `지도`
  - `도감`
  - `탐색`
  - `커뮤니티`
  - `마이페이지`
- Firebase Auth REST 로그인
- Firebase Storage 업로드
- Java Atlas API를 통한 관찰 기록, 분석, 심기 흐름
- Java Atlas API를 통한 지도 셀, 지도 마커, 커뮤니티 발견 조회
- 일부 화면의 기존 Firestore 기반 데이터 조회 유지
  - 프로필 일부
  - 도감 목록 일부

## 기술 스택

### API 서버

- Java 21
- Spring Boot 3.5
- Spring Web
- Spring Security
- Spring Data JPA
- Flyway
- PostgreSQL
- H2
- Firebase Admin SDK
- Gemini API

### 모바일

- Expo SDK 54
- React 19
- React Native 0.81
- Expo Router
- React Native Maps
- Expo Camera
- Expo Audio
- Expo Blur
- Expo Location
- Firebase Auth REST
- Firebase Storage REST

## 사전 준비

### 필수

- JDK 21
- Maven
- Node.js
- npm
- Expo CLI 또는 `npx expo`
- Firebase 프로젝트

### Firebase에서 준비할 것

Firebase Console에서 다음을 활성화합니다.

1. Authentication
2. Email/Password 로그인
3. 필요한 경우 Google 로그인
4. Firebase Storage
5. Firestore
6. iOS 앱 ID: `com.team3.atlas`
7. Android package name: `com.team3.atlas`

현재 앱은 Firebase REST API를 사용하므로 `GoogleService-Info.plist`, `google-services.json`은 필수는 아닙니다. 나중에 Native Firebase SDK, Analytics, Crashlytics를 붙이면 필요합니다.

## 환경 변수

이 프로젝트는 `.env.example`을 사용하지 않습니다. 필요한 값은 각자 로컬 `.env`나 실행 환경 변수에 직접 넣어 사용합니다.

### 모바일 환경 변수

파일 위치:

```text
mobile/.env
```

필수:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=Firebase Web API Key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=Firebase Project ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=Firebase Storage Bucket
```

선택:

```env
EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=Google OAuth Client ID
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://localhost:8080
```

실기기에서 로컬 백엔드를 테스트할 때는 `localhost` 대신 Mac의 같은 Wi-Fi 대역 LAN IP를 사용합니다.

예:

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://192.168.0.12:8080
```

주의:

- `EXPO_PUBLIC_*` 값은 앱 번들에 포함됩니다.
- 이 값들은 비밀키가 아니라 공개 클라이언트 설정으로 다뤄야 합니다.
- 보안은 Firebase Auth, Storage Rules, Firestore Rules, 백엔드 인증 검증에서 처리합니다.

### 백엔드 로컬 환경 변수

로컬 기본 프로필은 `local`입니다. H2 인메모리 DB와 로컬 토큰 검증을 사용합니다.

로컬에서는 아래 값 없이도 서버를 띄울 수 있습니다.

```bash
mvn spring-boot:run
```

로컬 프로필 인증 규칙:

- `Authorization: Bearer <아무_문자열>` 허용
- 빈 토큰 또는 `invalid`는 거부

예:

```bash
curl -H "Authorization: Bearer local-user" \
  "http://localhost:8080/api/habitat-cells/nearby"
```

### 백엔드 GCP/운영 환경 변수

운영 또는 실제 Firebase/Gemini 연동에서는 다음 값을 설정합니다.

```env
DB_JDBC_URL=jdbc:postgresql://<host>:5432/atlas?sslmode=require
DB_USERNAME=atlas
DB_PASSWORD=database-password
GEMINI_API_KEY=gemini-api-key
GEMINI_MODEL=gemini-3.1-flash-lite
FIREBASE_STORAGE_BUCKET=firebase-storage-bucket
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
```

Cloud Run에서는 `FIREBASE_SERVICE_ACCOUNT_PATH` 대신 서비스 계정의 Application Default Credentials 사용을 우선합니다.

운영 프로필 실행:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=gcp
```

## 설치와 실행

### 1. 백엔드 실행

루트 디렉터리에서 실행합니다.

```bash
mvn spring-boot:run
```

서버 기본 주소:

```text
http://localhost:8080
```

헬스 체크:

```bash
curl "http://localhost:8080/actuator/health"
```

인증이 필요한 API 확인:

```bash
curl -H "Authorization: Bearer local-user" \
  "http://localhost:8080/api/map/discoveries?lat=37.5665&lng=126.9780&radiusKm=5"
```

### 2. 모바일 실행

모바일 디렉터리로 이동합니다.

```bash
cd mobile
npm ci --legacy-peer-deps
npm run ios
```

Android:

```bash
npm run android
```

Expo 개발 서버:

```bash
npm start
```

## 주요 API

모든 `/api/**` 경로는 Bearer 토큰이 필요합니다. `/actuator/health`만 공개입니다.

### 인증

```http
Authorization: Bearer <firebase-id-token>
```

### 미디어

```http
POST /api/media/register
```

Firebase Storage에 업로드한 사진, 영상, 소리 파일의 metadata를 백엔드에 등록합니다.

### 관찰 기록

```http
POST /api/observations
POST /api/observations/{id}/analyze
GET /api/analysis-jobs/{id}
POST /api/observations/{id}/plant
```

흐름:

1. 모바일에서 Firebase Storage에 원본 미디어 업로드
2. `/api/media/register`로 metadata 등록
3. `/api/observations`로 정확 좌표와 기록 생성
4. `/api/observations/{id}/analyze`로 Gemini 분석
5. 사용자가 후보 선택
6. `/api/observations/{id}/plant`로 셀 도감, 지도, 커뮤니티에 반영

### 지도

```http
GET /api/habitat-cells/nearby?lat={lat}&lng={lng}&radiusKm={radius}
GET /api/habitat-cells/{id}
GET /api/habitat-cells/{id}/report
GET /api/map/discoveries?lat={lat}&lng={lng}&radiusKm={radius}
```

지도 셀 응답에는 다음 데이터가 포함됩니다.

- 셀 ID
- 셀 키
- 지역 이름
- 지역 설명
- 중심 좌표
- 생태 점수
- 관찰 수
- 발견 생물 수
- 기여자 수
- 서식지 타입
- 구역 polygon 좌표

지도 마커 응답에는 다음 데이터가 포함됩니다.

- 발견 ID
- 도감 번호
- 동식물 이름
- 학명
- 표시 분류
- 공개 좌표
- 등록 시간
- 발견한 사람 이름
- 이미지 링크
- 지역 이름
- 거리

표시 분류는 다음 값을 사용합니다.

```text
PLANT
ANIMAL
BIRD
FISH
INSECT
AMPHIBIAN
REPTILE
MAMMAL
FUNGI
OTHER
```

### 지역 도감/생태보고서

```http
GET /api/habitat-cells/{id}/report
```

응답에는 다음 데이터가 포함됩니다.

- 지역 이름
- 요약
- 지형 설명
- 서식지 타입
- 생태 점수
- 관찰 수
- 발견 생물 수
- 주요 발견 생물
- 대표 이미지
- 최근 발견 기록

### 도감

```http
GET /api/codex?category={category}&page={page}&size={size}
GET /api/habitat-cells/{cellId}/codex
```

카테고리:

```text
PLANT
ANIMAL
OTHER
```

UI에서는 `displayGroup`을 이용해 조류, 어류, 곤충 등으로 더 세분화합니다.

### 커뮤니티

```http
GET /api/community/discoveries?lat={lat}&lng={lng}&radiusKm={radius}
```

커뮤니티 카드는 지도 마커와 같은 발견 데이터를 재사용합니다.

### 마이페이지

```http
GET /api/me
PUT /api/me
GET /api/me/stats
GET /api/me/recent-observations
```

## 데이터 흐름

```text
사진/소리 촬영
  -> Firebase Storage 업로드
  -> media/register
  -> observations 생성
  -> Gemini 분석
  -> 후보 선택
  -> plant
  -> habitat_cells 집계 갱신
  -> codex_entries 갱신
  -> map/community/profile 화면에서 재사용
```

## 보안 원칙

- 클라이언트는 `userId`를 직접 보내지 않습니다.
- 백엔드는 Firebase UID에서 내부 사용자 ID를 파생합니다.
- 정확 좌표는 서버에 저장하되, 공개 화면에는 셀 중심 좌표 또는 공개 좌표만 사용합니다.
- `PRIVATE` 기록은 커뮤니티/지도 공개 발견 목록에서 제외합니다.
- 서비스 계정 JSON, DB 비밀번호, Gemini API Key는 절대 커밋하지 않습니다.

## 테스트와 검증

### 백엔드

```bash
mvn test
```

특정 통합 테스트:

```bash
mvn test -Dtest=MobileBackendContractIntegrationTest
```

### 모바일

```bash
cd mobile
npm run typecheck
npm run test:unit
npm run expo:check
```

## 배포 참고

### Firebase Rules

규칙 파일:

```text
firestore.rules
storage.rules
firebase.json
```

배포:

```bash
firebase use <project-id>
firebase deploy --only firestore:rules,storage
```

### 백엔드

운영 배포 시 확인할 항목:

- PostgreSQL 연결 문자열
- Flyway 마이그레이션 적용
- Firebase Admin 인증
- Firebase Storage bucket 권한
- Gemini API Key
- Cloud Run 서비스 계정 권한

## 자주 막히는 문제

### 모바일에서 로컬 API가 연결되지 않음

실기기에서는 `localhost`가 Mac이 아니라 기기 자신을 가리킵니다.

`mobile/.env`에 Mac의 LAN IP를 넣습니다.

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://192.168.0.12:8080
```

### `401 unauthorized`

- Bearer 토큰이 빠졌는지 확인합니다.
- 로컬 API 테스트에서는 `Authorization: Bearer local-user`처럼 임의 토큰을 넣습니다.
- GCP 프로필에서는 실제 Firebase ID Token이어야 합니다.

### 지도, 커뮤니티가 비어 있음

- 공개 또는 셀 공개 기록이 아직 없으면 비어 있을 수 있습니다.
- 기록을 생성한 뒤 후보를 선택하고 `plant`까지 완료해야 지도/커뮤니티에 반영됩니다.
- `PRIVATE` 기록은 공개 목록에 나오지 않습니다.

### Maven 명령이 없음

로컬에 Maven을 설치해야 합니다.

```bash
brew install maven
```

## 문서 위치

- 백엔드 구조와 연결 가이드: `docs/backend_architecture_and_connection.md`
- 프로젝트 상태와 할 일: `docs/project_status_and_todo.md`
- 모바일 프론트엔드 체크리스트: `docs/frontend_todo.md`
- 프론트엔드 디자인 가이드: `skills/frontend.md`
- 모바일 앱 워크스페이스: `mobile/`
