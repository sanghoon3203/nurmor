# Atlas Mobile

Atlas Mobile은 Expo와 React Native로 만든 Atlas 생태 탐색 앱입니다.

사용자는 직접 카메라나 녹음 기능으로 생명을 기록하고, 기록은 Atlas Java API를 통해 지도 셀, 도감, 커뮤니티, 마이페이지 데이터로 연결됩니다.

## 현재 앱 구성

- Expo SDK 54
- React 19
- React Native 0.81
- Expo Router
- Firebase Auth REST
- Firebase Storage REST
- Atlas Java API 연동
- React Native Maps
- Expo Camera
- Expo Audio
- Expo Blur
- Expo Location

## 화면 구성

현재 탭 순서:

```text
지도 -> 도감 -> 탐색 -> 커뮤니티 -> 마이페이지
```

### 지도

- 현재 위치 기반 지도
- 주변 habitat cell polygon 표시
- 지도 마커 표시
- 셀 선택 시 하단 생태보고서 토글 패널 표시
- Java API 사용
  - `GET /api/habitat-cells/nearby`
  - `GET /api/map/discoveries`
  - `GET /api/habitat-cells/{id}/report`

### 도감

- 생물 그룹 필터
- 대표 도감 카드
- 상세 도감 화면
- 현재 일부 데이터는 Firestore 기반 MVP 흐름을 유지합니다.

### 탐색

- 기본 동작은 직접 카메라 촬영
- 앨범 선택은 보조 버튼
- 소리 탐색은 녹음 UI 전환
- 촬영/녹음 결과는 Firebase Storage 업로드 후 Atlas API에 등록됩니다.

### 커뮤니티

- 주변 공개 발견 목록
- 카드 뉴스형 UI
- Java API 사용
  - `GET /api/community/discoveries`

### 마이페이지

- 프로필 정보
- 보고 횟수
- 발견 생물
- 업적 달성
- 탐험 지역
- 발자국 통계
- 현재 일부 데이터는 Firestore 기반 MVP 흐름을 유지합니다.

## 앱 식별자

EAS 또는 네이티브 빌드에서 사용할 식별자입니다.

```text
iOS bundle ID: com.team3.atlas
Android package name: com.team3.atlas
```

Firebase Console에서 iOS 앱과 Android 앱을 만들 때 동일한 값을 사용합니다.

```text
Firebase Console -> Project settings -> Your apps -> iOS+
Firebase Console -> Project settings -> Your apps -> Android
```

현재 앱은 Firebase Auth REST와 Storage REST를 사용하므로 아래 파일은 필수는 아닙니다.

```text
GoogleService-Info.plist
google-services.json
```

나중에 Native Firebase SDK, Analytics, Crashlytics를 붙일 때 추가합니다.

## 환경 변수

`mobile/.env` 파일을 직접 만듭니다. 이 파일은 로컬 전용이며 커밋하지 않습니다.

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

실기기에서 로컬 백엔드에 붙을 때:

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://192.168.0.12:8080
```

`192.168.0.12` 부분은 Mac의 실제 LAN IP로 바꿉니다.

주의:

- `EXPO_PUBLIC_*` 값은 클라이언트 앱에 포함됩니다.
- Firebase Web API Key는 공개 클라이언트 설정입니다.
- 보안은 Firebase Auth, Storage Rules, Firestore Rules, 백엔드 인증 검증으로 처리합니다.
- 다른 사람이 자신의 Firebase 프로젝트를 쓰려면 위 값을 본인 프로젝트 값으로 바꾸면 됩니다.

## Firebase 설정

새 Firebase 프로젝트에서 실행하려면 다음을 준비합니다.

1. Firebase Authentication 활성화
2. Email/Password 로그인 활성화
3. 필요한 경우 Google 로그인 활성화
4. Firebase Storage 활성화
5. Firestore 활성화
6. iOS 앱 ID `com.team3.atlas` 등록
7. Android package name `com.team3.atlas` 등록
8. 저장소의 `firestore.rules`, `storage.rules` 배포

규칙 배포:

```bash
firebase use <project-id>
firebase deploy --only firestore:rules,storage
```

## 설치

```bash
cd mobile
npm ci --legacy-peer-deps
```

## 실행

Expo 개발 서버:

```bash
npm start
```

iOS:

```bash
npm run ios
```

Android:

```bash
npm run android
```

Web:

```bash
npm run web
```

## Atlas API 연결

로컬 API 서버를 먼저 실행합니다.

루트 디렉터리:

```bash
mvn spring-boot:run
```

모바일 `.env`:

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://localhost:8080
```

실기기에서는:

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://<Mac-LAN-IP>:8080
```

## 기록 생성 흐름

현재 탐색 탭의 기록 흐름은 다음 순서로 동작합니다.

```text
카메라 촬영 또는 소리 녹음
  -> Firebase Storage 업로드
  -> POST /api/media/register
  -> POST /api/observations
  -> POST /api/observations/{id}/analyze
  -> 후보 선택
  -> POST /api/observations/{id}/plant
  -> GET /api/habitat-cells/{cellId}/codex
```

이 흐름 때문에 커뮤니티와 지도에서 같은 기록을 다시 사용할 수 있습니다.

## 지도 데이터 흐름

지도 화면은 Java API에서 데이터를 가져옵니다.

```text
GET /api/habitat-cells/nearby
  -> 지역 셀 polygon, 중심 좌표, 생태 점수

GET /api/map/discoveries
  -> 지도 마커

GET /api/habitat-cells/{id}/report
  -> 생태보고서 패널
```

지도 마커에 필요한 필드:

- 공개 좌표
- 도감 번호
- 동식물 이름
- 학명
- 표시 분류
- 등록 시간
- 발견한 사람 이름
- 이미지 링크
- 지역 이름

표시 분류:

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

## 주요 명령어

```bash
npm run typecheck
npm run test:unit
npm run expo:check
```

## 문제 해결

### 앱에서 API 연결 실패

실기기에서는 `localhost`를 사용할 수 없습니다. Mac의 LAN IP를 사용합니다.

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://192.168.0.12:8080
```

### Firebase 로그인 실패

확인할 것:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- Firebase Authentication 활성화 여부
- Email/Password 또는 Google 로그인 provider 활성화 여부

### Storage 업로드 실패

확인할 것:

- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- Firebase Storage 활성화 여부
- `storage.rules` 배포 여부
- 로그인 토큰 만료 여부

### 지도나 커뮤니티가 비어 있음

공개 가능한 기록이 아직 없을 수 있습니다.

기록이 지도와 커뮤니티에 나오려면:

1. 탐색 탭에서 기록 생성
2. 분석 후보 선택
3. 공개 범위를 `CELL` 또는 `PUBLIC`으로 선택
4. `plant` 완료

`PRIVATE` 기록은 공개 지도와 커뮤니티 목록에 나오지 않습니다.

## 관련 문서

- 루트 프로젝트 가이드: `../README.md`
- 백엔드 구조와 연결 가이드: `../docs/backend_architecture_and_connection.md`
- 프론트엔드 할 일: `../docs/frontend_todo.md`
- 프로젝트 상태: `../docs/project_status_and_todo.md`
