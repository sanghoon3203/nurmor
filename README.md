<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<p align="center">
  <img src="https://img.shields.io/badge/Java-21-007396?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 54" />
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=20232A" alt="React Native" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Storage-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</p>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/sanghoon3203/atlas">
    <img src="logo_sum.svg" alt="Atlas Logo" width="96" height="96">
  </a>

  <h1 align="center">Nurmor</h1>

  <p align="center">
    사진과 소리로 주변 생명을 기록하고, 기록을 지도 셀·도감·커뮤니티로 연결하는 AI 기반 생태 탐색 앱
    <br />
    <br />
    <a href="#getting-started"><strong>로컬 실행하기 »</strong></a>
    <br />
    <br />
    <a href="#usage">사용 흐름</a>
    &middot;
    <a href="#built-with">기술 스택</a>
    &middot;
    <a href="#roadmap">로드맵</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">프로젝트 소개</a>
      <ul>
        <li><a href="#core-features">핵심 기능</a></li>
        <li><a href="#built-with">기술 스택</a></li>
      </ul>
    </li>
    <li>
      <a href="#architecture">구조</a>
      <ul>
        <li><a href="#data-flow">데이터 흐름</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">시작하기</a>
      <ul>
        <li><a href="#prerequisites">사전 준비</a></li>
        <li><a href="#environment-variables">환경 변수</a></li>
        <li><a href="#installation">설치</a></li>
      </ul>
    </li>
    <li><a href="#usage">사용 방법</a></li>
    <li><a href="#api-summary">API 요약</a></li>
    <li><a href="#testing">테스트</a></li>
    <li><a href="#build">모바일 빌드</a></li>
    <li><a href="#roadmap">로드맵</a></li>
    <li><a href="#troubleshooting">문제 해결</a></li>
    <li><a href="#team">팀</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

**Atlas**는 사용자가 길가, 공원, 하천 등 일상 공간에서 발견한 생명을 사진이나 소리로 기록하고, 그 기록을 지역 생태 데이터로 확장하는 모바일 앱입니다.

요즘 아이들과 시민들은 직접 자연을 관찰하고 기록할 기회가 줄어들고 있습니다. Atlas는 이 문제를 해결하기 위해 **AI 판정**, **생태 도감**, **지도 셀**, **커뮤니티 기록**을 하나의 흐름으로 연결합니다.

사용자는 생물을 촬영하거나 소리를 녹음하고, 앱은 해당 기록을 저장한 뒤 AI 분석 후보를 제공합니다. 사용자가 후보를 선택하면 기록은 지역 셀 도감에 심어지고, 지도와 커뮤니티, 마이페이지 통계에 반영됩니다.

> 현재 프로젝트는 발표 및 MVP 검증을 위해 일부 화면에서 임시 후보 또는 Firestore 기반 데이터를 함께 사용할 수 있습니다. 실제 서비스 흐름은 Atlas Java API와 Gemini 분석 연동을 기준으로 확장됩니다.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Core Features

- **사진/소리 기반 생태 기록**
  - 카메라 촬영, 앨범 선택, 오디오 녹음 지원
  - Firebase Storage에 원본 미디어 업로드

- **AI 생물 후보 분석**
  - 백엔드에서 Gemini API를 활용해 생물 후보 생성
  - 후보명, 학명, 신뢰도, 판정 근거 제공
  - 개발 및 발표 상황에서는 임시 후보 fallback 사용 가능

- **지도 셀 기반 생태 데이터**
  - 좌표를 habitat cell로 변환
  - 셀 중심 좌표, 생태 점수, 관찰 수, 발견 생물 수 관리
  - 지도 마커와 지역 생태보고서 제공

- **도감 시스템**
  - 사용자가 심은 관찰 기록을 지역 도감으로 누적
  - 식물, 조류, 어류, 곤충, 동물 등 표시 그룹 분류

- **커뮤니티**
  - 공개 기록을 주변 발견 목록으로 공유
  - 정확 좌표는 보호하고 공개 좌표 또는 셀 중심 좌표 활용

- **마이페이지**
  - 내 기록 수, 발견 생물 수, 심은 기록, 탐험 지역 통계 확인

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

#### Backend

- [![Java][Java]][Java-url]
- [![Spring Boot][SpringBoot]][SpringBoot-url]
- Spring Web
- Spring Security
- Spring Data JPA
- Flyway
- PostgreSQL
- H2
- Firebase Admin SDK
- Gemini API

#### Mobile

- [![Expo][Expo]][Expo-url]
- [![React Native][ReactNative]][ReactNative-url]
- [![React][React]][React-url]
- TypeScript
- Expo Router
- React Native Maps
- Expo Camera
- Expo Audio
- Expo Location
- Expo Blur
- Firebase Auth REST
- Firebase Storage REST

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ARCHITECTURE -->
## Architecture

```text
atlas/
├── src/                         # Java 21 + Spring Boot Atlas API
│   ├── main/java/com/atlas/api
│   │   ├── analysis/             # Gemini 분석 클라이언트, 응답 파서
│   │   ├── codex/                # 도감 엔트리, 표시 그룹, 종 분류
│   │   ├── community/            # 커뮤니티 발견 목록
│   │   ├── habitat/              # 지도 셀, 생태보고서
│   │   ├── map/                  # 지도 마커 API
│   │   ├── media/                # 미디어 metadata 등록
│   │   ├── observation/          # 관찰 기록 생성, 분석, 심기
│   │   └── user/                 # 마이페이지, 프로필, 통계
│   └── main/resources
│       ├── application.yml
│       └── db/migration/
│
├── mobile/                       # Expo + React Native 앱
│   ├── app/                      # Expo Router route
│   ├── src/features              # 지도, 도감, 탐색, 커뮤니티, 마이페이지
│   ├── src/services              # Atlas API, Firebase REST 연동
│   └── assets/
│
├── firestore.rules
├── storage.rules
├── firebase.json
└── README.md
```

### Data Flow

```text
사진/소리 촬영
  -> Firebase Storage 업로드
  -> /api/media/register
  -> /api/observations
  -> /api/observations/{id}/analyze
  -> 사용자 후보 선택
  -> /api/observations/{id}/plant
  -> habitat_cells 집계 갱신
  -> codex_entries 갱신
  -> 지도 / 도감 / 커뮤니티 / 마이페이지 반영
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

아래 단계는 로컬에서 Atlas 백엔드와 모바일 앱을 실행하는 방법입니다.

### Prerequisites

- JDK 21
- Maven
- Node.js
- npm
- Expo CLI 또는 `npx expo`
- Firebase 프로젝트
- 선택: Android Studio 또는 Xcode
- 선택: EAS CLI

```sh
npm install -g eas-cli
```

### Environment Variables

#### Mobile

`mobile/.env` 파일을 직접 생성합니다.

```env
EXPO_PUBLIC_FIREBASE_API_KEY=Firebase Web API Key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=Firebase Project ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=Firebase Storage Bucket
EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=Google OAuth Client ID
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://localhost:8080
```

실기기에서 로컬 백엔드에 연결할 때는 `localhost` 대신 같은 Wi-Fi 대역의 Mac/PC LAN IP를 사용합니다.

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://192.168.0.12:8080
```

#### Backend - Local

로컬 기본 프로필은 `local`입니다. 별도 환경 변수 없이 H2 인메모리 DB와 로컬 토큰 검증으로 실행할 수 있습니다.

```sh
mvn spring-boot:run
```

로컬 인증 규칙:

```text
Authorization: Bearer <아무_문자열>
```

단, 빈 토큰 또는 `invalid`는 거부됩니다.

#### Backend - GCP / Production

```env
DB_JDBC_URL=jdbc:postgresql://<host>:5432/atlas?sslmode=require
DB_USERNAME=atlas
DB_PASSWORD=database-password
GEMINI_API_KEY=gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
FIREBASE_STORAGE_BUCKET=firebase-storage-bucket
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
```

> Cloud Run에서는 `FIREBASE_SERVICE_ACCOUNT_PATH` 대신 서비스 계정의 Application Default Credentials 사용을 우선합니다.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Installation

1. 저장소 클론

   ```sh
   git clone https://github.com/sanghoon3203/atlas.git
   cd atlas
   ```

2. 백엔드 실행

   ```sh
   mvn spring-boot:run
   ```

3. 백엔드 헬스 체크

   ```sh
   curl "http://localhost:8080/actuator/health"
   ```

4. 모바일 의존성 설치

   ```sh
   cd mobile
   npm ci --legacy-peer-deps
   ```

5. 모바일 실행

   ```sh
   npm start
   ```

6. iOS 또는 Android 실행

   ```sh
   npm run ios
   npm run android
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

### 1. 생물 기록하기

1. `탐색` 탭으로 이동합니다.
2. 카메라로 생물을 촬영하거나 앨범에서 이미지를 선택합니다.
3. 소리 기록이 필요한 경우 오디오 녹음 모드를 사용합니다.
4. 앱이 Firebase Storage에 미디어를 업로드합니다.
5. Atlas API가 관찰 기록을 생성하고 AI 분석 후보를 준비합니다.

### 2. 후보 확인하기

분석 화면에서는 다음 정보를 확인할 수 있습니다.

- 한국어 생물명 또는 임시 후보명
- 학명
- 신뢰도
- 판정 근거
- 기록 공유 범위

현재 Gemini 분석이 실패하거나 개발 환경에서 임시 후보 모드를 사용할 경우, 앱은 fallback 후보를 표시할 수 있습니다.

### 3. 지도/도감에 심기

사용자가 후보를 선택하면 기록은 지역 셀에 반영됩니다.

- `PRIVATE`: 개인 기록 중심
- `PUBLIC`: 커뮤니티와 지도 공개 발견 목록에 반영

### 4. 도감과 커뮤니티 확인

- `도감`: 내가 발견한 생물 기록 확인
- `지도`: 주변 habitat cell, 발견 마커, 생태보고서 확인
- `커뮤니티`: 주변 공개 발견 목록 확인
- `마이페이지`: 내 기록 통계와 발자국 확인

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- API SUMMARY -->
## API Summary

모든 `/api/**` 경로는 Bearer 토큰이 필요합니다. `/actuator/health`만 공개입니다.

### Auth

```http
Authorization: Bearer <firebase-id-token>
```

### Media

```http
POST /api/media/register
```

Firebase Storage에 업로드된 원본 미디어의 metadata를 등록합니다.

### Observations

```http
POST /api/observations
POST /api/observations/{id}/analyze
GET  /api/analysis-jobs/{id}
POST /api/observations/{id}/plant
```

### Habitat Cells / Map

```http
GET /api/habitat-cells/nearby?lat={lat}&lng={lng}&radiusKm={radius}
GET /api/habitat-cells/{id}
GET /api/habitat-cells/{id}/report
GET /api/map/discoveries?lat={lat}&lng={lng}&radiusKm={radius}
```

### Codex

```http
GET /api/codex?category={category}&page={page}&size={size}
GET /api/habitat-cells/{cellId}/codex
```

### Community

```http
GET /api/community/discoveries?lat={lat}&lng={lng}&radiusKm={radius}
```

### My Page

```http
GET /api/me
PUT /api/me
GET /api/me/stats
GET /api/me/recent-observations
GET /api/me/footprints
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TESTING -->
## Testing

### Backend

```sh
mvn test
```

특정 통합 테스트:

```sh
mvn test -Dtest=MobileBackendContractIntegrationTest
```

### Mobile

```sh
cd mobile
npm run typecheck
npm run test:unit
npm run expo:check
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- BUILD -->
## Build

Atlas 모바일 앱은 Expo 기반 React Native 앱입니다. 실제 앱 바이너리는 EAS Build 사용을 권장합니다.

### EAS 설정

```sh
cd mobile
eas login
eas build:configure
```

### Android APK

```sh
eas build --platform android --profile preview
```

### Android App Bundle

```sh
eas build --platform android --profile production
```

### iOS

```sh
eas build --platform ios --profile production
```

> iOS 배포 빌드는 Apple Developer Program 계정이 필요합니다.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Spring Boot 기반 Atlas API 서버 구축
- [x] Expo Router 기반 5탭 모바일 앱 구성
- [x] Firebase Auth REST 로그인
- [x] Firebase Storage 업로드
- [x] 관찰 기록 생성 API 연결
- [x] 지도 셀 및 커뮤니티 데이터 흐름 연결
- [x] 도감 표시 그룹 분류 추가
- [ ] Gemini 분석 실패 시 임시 후보 fallback 안정화
- [ ] GIF/이미지 MIME 처리 개선
- [ ] 도감 대표 이미지와 실제 Storage 이미지 연결
- [ ] 멸종위기 생물 신고 및 관리자 검수 플로우
- [ ] Cloud Run / Cloud SQL 운영 배포
- [ ] EAS 기반 Android/iOS 배포 빌드 자동화
- [ ] 발표용 데모 데이터 및 시연 시나리오 정리

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TROUBLESHOOTING -->
## Troubleshooting

### 모바일에서 로컬 API가 연결되지 않음

실기기에서는 `localhost`가 개발 PC가 아니라 기기 자신을 가리킵니다.

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://<개발PC_LAN_IP>:8080
```

### 401 Unauthorized

- Bearer 토큰이 있는지 확인합니다.
- 로컬 API 테스트에서는 임의 토큰을 사용할 수 있습니다.

```sh
curl -H "Authorization: Bearer local-user"   "http://localhost:8080/api/habitat-cells/nearby"
```

### 판정 화면에서 GIF만 계속 보임

마지막 커밋 이후 분석 화면은 후보가 없으면 로딩 GIF를 보여줍니다. 백엔드 Gemini 분석이 실패하면 후보가 표시되지 않을 수 있습니다.

확인할 항목:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- Firebase Storage object path
- 백엔드 `/api/observations/{id}/analyze` 응답
- 서버 로그의 `Gemini request failed` 또는 `Gemini structured response parsing failed`

개발 중에는 임시 후보 fallback을 켜서 발표 흐름이 끊기지 않게 만들 수 있습니다.

### 지도 또는 커뮤니티가 비어 있음

- 기록 생성 후 후보 선택과 `plant`까지 완료해야 합니다.
- `PRIVATE` 기록은 커뮤니티/지도 공개 발견 목록에 나오지 않습니다.
- 주변 반경 `radiusKm`가 너무 작지 않은지 확인합니다.

### Maven 명령이 없음

```sh
brew install maven
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TEAM -->
## Team

Atlas는 생태 참여 경험을 높이기 위한 팀 프로젝트입니다.

- GitHub Repository: [sanghoon3203/atlas](https://github.com/sanghoon3203/atlas)
- App ID: `com.team3.atlas`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

- Expo
- React Native
- Spring Boot
- Firebase
- Google Gemini API
- React Native Maps
- Open-source ecological data and community science projects

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[Java]: https://img.shields.io/badge/Java-21-007396?style=for-the-badge&logo=openjdk&logoColor=white
[Java-url]: https://openjdk.org/
[SpringBoot]: https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white
[SpringBoot-url]: https://spring.io/projects/spring-boot
[Expo]: https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white
[Expo-url]: https://expo.dev/
[ReactNative]: https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=20232A
[ReactNative-url]: https://reactnative.dev/
[React]: https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
