# Atlas Product Specification

Atlas는 사용자가 주변 생태 환경을 사진, 비디오, 오디오로 기록하고 AI 분석을 통해 관찰 결과를 정리하며 지도 위에서 탐사 이력을 확인하는 React Native 기반 모바일 앱이다.

## 1. Product Direction

Atlas는 게임처럼 과장된 도감이 아니라, 자연 관찰과 위치 기반 탐사를 위한 차분하고 신뢰 가능한 기록 도구를 목표로 한다. 기존의 캡처, AI 분석, 지도 탐사 컨셉은 유지하되 시각 시스템은 `Calm Field System`으로 정리한다.

## 2. Core Requirements

### 2.1 Capture Suite
- `VISUAL` 모드: 사진 및 비디오 촬영. 비디오 촬영 시 주변 음성을 함께 수집한다.
- `AUDIO` 모드: 카메라 preview 없이 소리만 단독 녹음한다.
- recording 상태는 `StatusBadge`와 `CaptureControl` 상태 변화로 표현한다.
- 실시간 오디오 입력은 `WaveformMeter`로 표시한다.

### 2.2 AI Analysis
- 촬영/녹음 파일을 AI 분석 요청으로 전달한다.
- 분석 중에는 중복 제출을 막고 진행 상태를 명확히 표시한다.
- 분석 성공 시 발견 결과, 신뢰도, 주요 특징, 위치 metadata를 보여준다.
- 분석 실패 시 원인과 다음 행동을 함께 제공한다.

### 2.3 Atlas Map
- 현재 위치, 이동 경로, 발견 위치를 지도 위에 표시한다.
- 미탐사 영역은 과한 게임식 Fog of War보다 낮은 대비의 grid overlay로 표현한다.
- 발견 위치와 커뮤니티 핫스팟은 `MapPin` variant로 구분한다.

## 3. Design System Summary

Atlas는 다음 foundation을 사용한다.

- Color: 어두운 neutral surface와 teal 계열 brand color
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
- `MapPin`

컴포넌트 상세는 [components.md](./components.md)를 따른다.

## 5. Roadmap

- Day 1: Expo/React Native 프로젝트 구조와 미디어 권한 설정
- Day 2: Atlas design tokens와 기본 primitives 구현
- Day 3: Capture Suite와 `WaveformMeter` 구현
- Day 4: AI 분석 요청/결과 상태 UI 구현
- Day 5: Atlas Map, discovery pin, 탐사 overlay 구현
- Day 6: 접근성, 오류 상태, 성능 검증
