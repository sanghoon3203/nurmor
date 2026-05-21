# Atlas Product Specification

Atlas는 사용자가 주변 생태 환경을 사진, 비디오, 오디오로 기록하고 Gemini 기반 AI 분석을 통해 관찰 결과를 정리하며, 지도 위 셀 단위 생태 데이터베이스를 도감처럼 채워가는 React Native 기반 모바일 앱이다.

## 1. Product Direction

Atlas는 게임처럼 과장된 도감이 아니라, 자연 관찰과 위치 기반 탐사를 위한 밝고 신뢰 가능한 생태 지도 도감을 목표로 한다. 핵심 브랜딩은 `Habitat Bloom`이다. 사용자는 실제 위치에서 관찰 기록을 남기고, AI 분석을 거쳐 지도 셀을 하나씩 밝히며 지역 생태 데이터베이스를 함께 만들어간다.

## 2. Core Requirements

### 2.1 Capture Suite
- `VISUAL` 모드: 사진 및 비디오 촬영. 비디오 촬영 시 주변 음성을 함께 수집한다.
- `AUDIO` 모드: 카메라 preview 없이 소리만 단독 녹음한다.
- recording 상태는 `StatusBadge`와 `CaptureControl` 상태 변화로 표현한다.
- 실시간 오디오 입력은 `WaveformMeter`로 표시한다.

### 2.2 AI Analysis
- 촬영/녹음 파일을 AI 분석 요청으로 전달한다.
- AI 분석 기본 모델은 Gemini API의 `gemini-3.1-flash-lite`를 사용한다.
- 사진, 비디오, 오디오 입력을 모두 생물 추정과 관찰 근거 추출에 사용할 수 있어야 한다.
- 분석 중에는 중복 제출을 막고 진행 상태를 명확히 표시한다.
- 분석 성공 시 생물 후보, 신뢰도, 주요 특징, 관찰 근거, 위치 metadata를 보여준다.
- AI 결과는 확정 판정이 아니라 `추정`으로 표시한다.
- 분석 실패 시 원인과 다음 행동을 함께 제공한다.

### 2.3 Atlas Map
- 지도 위에 셀 overlay를 표시한다.
- 각 셀은 해당 지역의 관찰 기록, 생물 후보, 기여자, 개화도 데이터를 가진다.
- 사용자가 셀 안에서 기록을 등록하면 해당 셀의 생태 데이터베이스와 도감 항목이 갱신된다.
- 공개 지도에는 정확 좌표 대신 셀 단위 위치를 우선 표시한다.
- 발견 위치와 사용자 기여 기록은 지도 위 `HabitatCell` 상태와 셀 내부 record marker로 구분한다.

### 2.4 Habitat Codex
- 도감은 단일 전역 리스트가 아니라 지도 셀과 연결된 지역 생태 데이터베이스다.
- 도감 항목은 생물명, AI 추정 신뢰도, 미디어 근거, 위치 셀, 시간, 기여자 표시명을 포함한다.
- 같은 셀 안에서 유사한 생물 후보가 반복 등록될 경우 중복 후보를 표시하고 병합 또는 별도 기록 선택을 제공한다.
- 유저 이름 공개는 기본 opt-in으로 처리한다.

## 3. Design System Summary

Atlas는 다음 foundation을 사용한다. 자세한 브랜딩 방향은 [redesign_moodboard.md](./redesign_moodboard.md)를 따른다.

- Color: morning field, warm paper, moss green, sky metadata, bloom yellow
- Typography: 시스템 폰트 기반의 높은 가독성
- Spacing: 4/8 기반 scale
- Radius: 기본 8px, modal/sheet 12px
- Shadow: 카드에는 기본 shadow 없음, floating panel에만 낮은 elevation
- Motion: 빠르고 조용한 상태 전환

기존 `pokemon-bw.ttf`는 본문 폰트가 아니라 발견 완료 같은 짧은 특수 연출에만 사용한다.

## 4. Primary Components

- `Button`
- `SurfaceCard`
- `Text`
- `StatusBadge`
- `CaptureControl`
- `ModeSegmentedControl`
- `WaveformMeter`
- `HabitatCell`
- `CodexEntryCard`

컴포넌트 상세는 [components.md](./components.md)를 따른다.

## 5. Roadmap

- Day 1: Expo/React Native 프로젝트 구조와 미디어 권한 설정
- Day 2: Atlas design tokens와 기본 primitives 구현
- Day 3: Capture Suite와 `WaveformMeter` 구현
- Day 4: Gemini 3.1 Flash 분석 요청/결과 상태 UI 구현
- Day 5: 지도 셀 overlay, `HabitatCell`, 도감 등록 흐름 구현
- Day 6: 백엔드 데이터 모델, 중복 후보, 공개 범위, 보안 검증
- Day 7: 접근성, 오류 상태, 성능 검증
