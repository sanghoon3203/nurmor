# Atlas System Workflow

이 문서는 Atlas의 캡처, Gemini 분석, 지도 셀 도감화 흐름을 정의한다. UI 표현은 `Habitat Bloom` 방향을 기준으로 하며, 사용자가 실제 위치에서 기록을 심을수록 지도 위 서식지 셀이 피어나는 경험을 만든다.

## 1. Capture And Gemini Analysis Workflow

```mermaid
graph TD
    A[사용자가 CaptureControl 터치] --> B{캡처 모드}
    B -- VISUAL --> C1[사진 또는 비디오 촬영]
    B -- AUDIO --> C2[오디오 단독 녹음]

    C1 --> D1[StatusBadge로 REC/촬영 상태 표시]
    C2 --> D2[WaveformMeter로 입력 레벨 표시]

    D1 --> E[미디어 파일과 위치 metadata 생성]
    D2 --> E
    E --> F[백엔드에 분석 작업 생성]
    F --> G[Gemini gemini-3-flash-preview 분석 요청]
    G --> H{분석 결과}

    H -- 성공 --> I[생물 후보, 신뢰도, 근거 표시]
    H -- 실패 --> J[오류 원인과 다음 행동 표시]
    I --> K[사용자 확인]
    K --> L[도감 record 생성]
    L --> M[현재 HabitatCell에 기록 심기]
    M --> N[개화도와 생태 밀도 갱신]
```

### UI Rules
- recording 상태는 `StatusBadge`와 `CaptureControl` 상태로 표현한다.
- 분석 중에는 primary action을 loading/disabled로 전환한다.
- 분석 결과는 확정이 아니라 `추정`으로 표현한다. 예: `노랑나비로 추정`.
- 실패 상태는 `color.semantic.danger`만으로 끝내지 말고 다시 시도할 행동을 함께 제공한다.
- 사용자가 분석 결과를 확인한 뒤 `지도에 심기`를 눌러 도감 등록을 완료한다.

## 2. Habitat Cell Map Workflow

```mermaid
graph TD
    A[Atlas Map 진입] --> B[위치 권한 확인]
    B -- 허용 --> C[현재 좌표를 HabitatCell ID로 변환]
    B -- 거부 --> D[권한 안내와 수동 탐색 상태 표시]

    C --> E[주변 셀과 개화도 불러오기]
    E --> F[셀 상태 overlay 표시]
    F --> G[셀 선택]
    G --> H[셀 상세 Warm Paper Sheet 표시]

    I[새 기록 등록] --> J[record를 셀에 연결]
    J --> K[셀 개화도 계산]
    K --> L[셀 상태 seeded/growing/bloomed 갱신]
    L --> F
```

### UI Rules
- 지도는 셀 overlay를 기본 정보 구조로 사용한다.
- 지도 위 텍스트는 최소화하고 셀 상세는 bottom sheet에서 제공한다.
- 셀 상태는 `unobserved`, `visited`, `seeded`, `growing`, `bloomed`로 구분한다.
- 공개 지도에는 정확 좌표가 아니라 셀 단위 위치와 기여자 표시명을 우선 사용한다.

## 3. Codex Registration Workflow

```mermaid
graph TD
    A[Gemini 분석 성공] --> B[후보 species 목록 생성]
    B --> C[중복 후보 검사]
    C -- 기존 항목 있음 --> D[기존 도감 항목에 observation 추가 제안]
    C -- 기존 항목 없음 --> E[새 도감 항목 생성 제안]
    D --> F[사용자 확인]
    E --> F
    F --> G[ObservationRecord 저장]
    G --> H[CodexEntry 갱신]
    H --> I[HabitatCell 통계 갱신]
    I --> J[기여자 표시 정책 적용]
```

### Data Rules
- `ObservationRecord`는 원본 관찰 이벤트다.
- `CodexEntry`는 같은 생물 후보를 지역/셀 단위로 묶은 도감 항목이다.
- `HabitatCell`은 지도 위 셀의 상태, 개화도, 기록 수, 대표 생물 후보를 가진다.
- 한 관찰 기록은 하나의 정확 좌표를 가질 수 있지만, 공개 표시는 셀 centroid 또는 흐린 위치를 사용한다.
- 기여자 이름은 사용자가 공개를 허용한 경우에만 표시한다.

## 4. Screen Transition Workflow

### 3.1 App Launch
- font와 권한 상태를 확인한다.
- 주변 `HabitatCell` 요약과 최근 도감 기록을 불러온다.

### 3.2 Capture To Result
- 캡처 완료 후 분석 pending 상태로 전환한다.
- 분석 성공 시 결과 sheet를 열고 생물 후보, 신뢰도, 관찰 근거, 위치 metadata를 표시한다.

### 3.3 Result To Map
- 사용자가 `지도에 심기`를 선택하면 해당 위치의 `HabitatCell`에 기록을 등록한다.
- 등록 후 셀의 개화도 변화와 새 도감 항목을 보여준다.

## 4. Motion Rules

- press feedback: `motion.duration.fast`, `motion.scale.pressed`
- 일반 상태 전환: `motion.duration.base`
- bottom sheet 진입: `motion.duration.slow`
- REC dot, waveform, bloom ring 외에는 반복 애니메이션을 사용하지 않는다.
