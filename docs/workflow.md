# 시스템 워크플로우 정의서 (System Workflow)

이 문서는 에코 도감(Eco-Pokedex) 프로젝트의 사용자 시나리오별 미디어 처리, AI 분석, 지도 탐사 연동 및 데이터 상태 흐름(Workflow)을 도식화하고 상세히 정의합니다.

---

## 1. 캡처 및 AI 분석 워크플로우

사용자가 생명체를 포착하여 Gemini 3.5 Flash 분석을 받고 도감을 해금하기까지의 미디어 데이터 상태 전이 흐름입니다.

```mermaid
graph TD
    A[캡처 버튼 터치] --> B{촬영 모드 설정}
    B -- VISUAL 모드 --> C1[동영상 촬영 시작 - 마이크 병렬 녹음]
    B -- AUDIO 모드 --> C2[단독 오디오 레코딩 시작]
    
    C1 --> D1[촬영 중 스캔라인 루프 및 REC LED 깜빡임]
    C2 --> D2[레트로 픽셀 사운드 파형 실시간 Decibel 출력]
    
    D1 & D2 --> E[파일 임시 로컬 저장 - mp4 또는 m4a/wav]
    E --> F[Gemini 3.5 Flash API 병렬 Request 송신]
    F --> G{species morphology & acoustic pattern 일치 여부}
    
    G -- 매칭 성공 --> H[도감 해금 프로세스 실행]
    G -- 매칭 실패 --> I[에러 HUD 피드백 & 촬영 화면 복귀]
```

---

## 2. 지역 지도 기반 생태 탐사 워크플로우 (Eco-Map)

사용자의 현재 위치와 도감 수집 상태가 어떻게 탐사 지도(Eco-Map)와 연결되는지를 나타냅니다.

```mermaid
graph TD
    A[Eco-Map 화면 진입] --> B[GPS 위치 수집 시작]
    B --> C[현재 내 위치 픽셀 캐릭터로 마킹]
    C --> D[이동 시 My Trail 실시간 궤적을 픽셀 점선 라인으로 지도 상에 그림]
    
    D --> E{현재 GPS 좌표가 미발견 영역 Fog of War 그리드 내부인가?}
    E -- 예 --> F[반투명 격자 안개 레이어 활성화]
    E -- 아니오 --> G[해당 구역 지도 선명하게 노출]
    
    H[생명체 해금 성공] --> I[해당 생명체가 발견된 GPS 좌표에 커뮤니티 핀 생성]
    I --> J[해당 좌표 반경 200m 범위 내의 미발견 안개 그리드 제거 해제]
```

---

## 3. 화면 전환 워크플로우 (12 UI Animation 원칙 연동)

1.  **진입 대기 (Splash Screen)**:
    *   앱 최초 실행 시 `pokemon-bw.ttf` 로딩 상태 감시.
    *   로딩 완료 시 메인 도감 뷰(Dex Grid)로 페이드 아웃 전환.
2.  **도감 카드 상세 열기 (Detail Transition)**:
    *   사용자가 목록 내 카드를 터치하면, 카드의 배경색과 테두리가 확대되면서 상세 모달로 변형(Transformation) 전개. (Shared Element Transition 동작)
3.  **수치 카운팅 및 해금 연출 (Value & Lottie)**:
    *   도감 등록 시 `success_unlock.json` Lottie 애니메이션이 재생되면서 별가루 효과 오버레이.
    *   새로 얻은 동식물의 통계치 게이지바가 상승하며 실시간 수치 카운팅 적용.
