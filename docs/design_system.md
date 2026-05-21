# Atlas Design System Specification

Atlas의 디자인 시스템은 생태 관찰, 미디어 캡처, Gemini 분석, 지도 셀 기반 도감화를 하나의 제품 경험으로 묶기 위한 기준이다. 시각 방향은 `Habitat Bloom`이다. 사용자가 실제 위치에서 기록을 심을수록 지도 위 서식지 셀이 밝아지고 피어나는 느낌을 만든다.

## 1. Design Principles

### 1.1 Clear
정보 구조가 장식보다 우선한다. 사용자는 현재 상태, 다음 행동, 분석 결과를 한눈에 이해할 수 있어야 한다.

### 1.2 Grounded
자연, 위치, 관찰이라는 제품 맥락을 밝은 필드 색상과 안정적인 표면 구조로 표현한다. 게임적 보상감은 셀 개화, 기록 심기, 도감 등록 순간에만 제한적으로 사용한다.

### 1.3 Precise
좌표, 녹음 상태, 분석 진행률, 발견 결과처럼 정확성이 중요한 정보는 명확한 레이블, 상태 색상, 일관된 spacing으로 표현한다.

### 1.4 Quiet Premium
고채도 네온 그라디언트와 강한 그림자 대신 밝은 필드 표면, 따뜻한 종이 시트, 얇은 border, 낮은 elevation을 사용한다.

### 1.5 Playful Progress
땅따먹기식 재미는 `점령`이 아니라 `서식지 밝히기`, `기록 심기`, `개화도`로 표현한다. 진행 상태는 지도 셀의 색, bloom ring, record seed로 보여준다.

## 2. Design Tokens

### 2.1 Color Tokens

| token name | value | usage | example |
|---|---:|---|---|
| `color.background.default` | `#F3F5E8` | 앱 기본 필드 배경 | 전체 화면 |
| `color.background.subtle` | `#DDEBCF` | 지도/캡처 보조 배경 | 셀 overlay |
| `color.surface.default` | `#F6E7C8` | 기본 기록 시트 | 분석 결과 |
| `color.surface.card` | `#FFF4D8` | 카드 표면 | 도감 카드 |
| `color.surface.elevated` | `#F8EDCF` | 모달, 플로팅 패널 | 셀 상세 시트 |
| `color.border.default` | `#D8C79F` | 기본 경계선 | 카드, 입력 필드 |
| `color.border.strong` | `#8E9F63` | 강조 경계선 | 선택된 셀 |
| `color.text.primary` | `#243027` | 주요 텍스트 | 제목, 핵심 수치 |
| `color.text.secondary` | `#68715F` | 보조 텍스트 | 설명, metadata |
| `color.text.tertiary` | `#8B927D` | 낮은 위계 텍스트 | placeholder, timestamp |
| `color.brand.primary` | `#5F9B50` | 주요 액션, 개화 진행 | Primary button |
| `color.brand.primaryHover` | `#76B864` | press/hover 강조 | 버튼 눌림 |
| `color.brand.subtle` | `#C7E6A3` | 브랜드 tint 배경 | 피어난 셀 |
| `color.semantic.success` | `#7BCB8F` | 성공 상태 | 분석 완료 |
| `color.semantic.warning` | `#F2B866` | 주의 상태 | 권한 필요 |
| `color.semantic.danger` | `#F07D7D` | 오류/파괴 액션 | 분석 실패 |
| `color.semantic.info` | `#7DBCC8` | 정보 상태 | 위치/AI metadata |
| `color.overlay.scrim` | `#00000099` | 모달 뒤 dim | bottom sheet |

사용 규칙:
- 브랜드 컬러는 주요 CTA, 개화 진행, 저장 가능한 기록 상태에만 사용한다.
- 성공/경고/오류를 브랜드 컬러로 대체하지 않는다.
- 그라디언트는 기본 UI에 사용하지 않는다. 기록 심기, 셀 개화 같은 순간적 피드백에만 제한한다.

### 2.2 Typography Tokens

기본 폰트는 플랫폼 시스템 폰트를 사용한다. `pokemon-bw.ttf`는 Atlas의 본문 폰트가 아니라 디스플레이/획득 연출 전용 폰트로 제한한다.

| token name | value | usage | example |
|---|---:|---|---|
| `font.family.sans` | `System` | 기본 UI 텍스트 | 모든 본문 |
| `font.family.display` | `pokemon-bw.ttf` | 특수 연출 | 발견 완료 배지 |
| `font.size.caption` | `12` | 보조 정보 | 좌표, timestamp |
| `font.size.body` | `15` | 기본 본문 | 설명 문장 |
| `font.size.bodyStrong` | `16` | 강조 본문 | 리스트 주요값 |
| `font.size.title` | `20` | 화면 섹션 제목 | 카드 상세 제목 |
| `font.size.display` | `28` | 핵심 결과 | 분석 결과명 |
| `font.weight.regular` | `400` | 일반 텍스트 | 설명 |
| `font.weight.medium` | `500` | 보조 강조 | label |
| `font.weight.semibold` | `600` | 주요 강조 | button, title |
| `lineHeight.body` | `22` | 본문 줄높이 | 설명 텍스트 |
| `lineHeight.title` | `28` | 제목 줄높이 | 화면 제목 |

사용 규칙:
- 본문에는 강한 text shadow를 적용하지 않는다.
- `font.family.display`는 한 화면에서 1개 영역 이하로 제한한다.
- 버튼과 label은 `font.weight.semibold`를 기본으로 한다.

### 2.3 Spacing Tokens

| token name | value | usage | example |
|---|---:|---|---|
| `spacing.2xs` | `4` | 밀착 요소 간격 | icon/text gap |
| `spacing.xs` | `8` | 작은 내부 여백 | compact chip |
| `spacing.sm` | `12` | 기본 요소 간격 | form field gap |
| `spacing.md` | `16` | 카드 내부 여백 | card padding |
| `spacing.lg` | `24` | 섹션 간격 | panel group |
| `spacing.xl` | `32` | 화면 블록 간격 | page section |
| `spacing.section` | `40` | 큰 화면 전환 간격 | overview to content |

사용 규칙:
- 모바일 화면의 기본 horizontal padding은 `spacing.md`다.
- 카드 내부 padding은 `spacing.md`, dense card는 `spacing.sm`만 사용한다.
- 임의의 13px, 17px 같은 spacing 값을 만들지 않는다.

### 2.4 Radius Tokens

| token name | value | usage | example |
|---|---:|---|---|
| `radius.none` | `0` | 지도 타일, 미디어 mask | map grid |
| `radius.xs` | `4` | 작은 control | badge |
| `radius.sm` | `6` | input, chip | text input |
| `radius.md` | `8` | card, button | standard card |
| `radius.lg` | `12` | sheet, modal | bottom sheet |
| `radius.full` | `999` | pill, avatar | status pill |

사용 규칙:
- 기본 card radius는 `radius.md`를 넘지 않는다.
- 플로팅 모달과 bottom sheet만 `radius.lg`를 쓴다.
- 픽셀 보더 스타일은 기본 컴포넌트가 아니라 특수 연출 컴포넌트로 분리한다.

### 2.5 Shadow & Elevation Tokens

| token name | value | usage | example |
|---|---|---|---|
| `shadow.none` | none | 평면 요소 | 기본 card |
| `shadow.sm` | `0 1px 2px #00000033` | 낮은 분리 | toolbar |
| `shadow.md` | `0 8px 24px #00000040` | 플로팅 요소 | bottom sheet |
| `shadow.focus` | `0 0 0 3px #4CC9C033` | 접근성 focus | focused input |

사용 규칙:
- 카드에 그림자를 기본 적용하지 않는다. 배경, border, spacing으로 위계를 만든다.
- 카메라/지도 위 floating control은 `shadow.sm` 또는 `shadow.md`를 사용할 수 있다.

### 2.6 Border Tokens

| token name | value | usage | example |
|---|---:|---|---|
| `border.width.default` | `1` | 기본 경계 | card, input |
| `border.width.strong` | `2` | 선택/활성 상태 | selected map pin |
| `border.color.default` | `color.border.default` | 기본 border | panel |
| `border.color.focus` | `color.brand.primary` | focus/selected | input focus |

### 2.7 Motion Tokens

| token name | value | usage | example |
|---|---:|---|---|
| `motion.duration.fast` | `120ms` | press feedback | button press |
| `motion.duration.base` | `180ms` | 상태 전환 | chip selected |
| `motion.duration.slow` | `280ms` | sheet/modal | result sheet |
| `motion.easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | 일반 전환 | card expand |
| `motion.scale.pressed` | `0.98` | 버튼/카드 press | capture button |

사용 규칙:
- 인터랙션은 빠르고 조용해야 한다. 모든 요소가 튀는 spring animation을 쓰지 않는다.
- 캡처 버튼, 기록 심기, 셀 개화, 카드 상세 전환처럼 피드백이 중요한 순간에만 더 풍부한 motion을 사용한다.

## 3. Surface Rules

### 3.1 Default Surface
기록/도감 UI는 `color.surface.default` 배경, `border.width.default`, `radius.md` 조합을 사용한다.

### 3.2 Elevated Surface
모달, bottom sheet, 셀 상세 패널은 `color.surface.elevated`, `shadow.md`, `radius.lg`를 사용한다.

### 3.3 Media Overlay Surface
카메라/지도 위 오버레이는 배경 콘텐츠를 가리지 않도록 `color.background.subtle`에 88~94% opacity를 사용한다. 지도 셀은 개화도 상태가 읽히도록 색 대비를 유지하되, 전략 게임 지도처럼 강한 소유 경계를 만들지 않는다. 텍스트 대비는 항상 WCAG AA 수준을 목표로 한다.

## 4. Legacy Style Policy

이전 스타일의 네온, 픽셀 보더, 강한 텍스트 섀도우는 Atlas의 기본 디자인 시스템에서 제거한다. 단, 다음 상황에서는 제한적으로 사용할 수 있다.

- 기록 심기, 셀 개화, rare finding 연출
- `font.family.display`가 필요한 짧은 배지/타이틀
- 셀 개화, 분석 완료처럼 사용자가 의미 있는 결과를 얻은 순간

금지:
- 모든 카드에 네온 그라디언트 적용
- 본문 텍스트에 검은색 픽셀 shadow 기본 적용
- 기본 버튼/입력 필드에 픽셀 더블 보더 적용
- 장식 목적의 과한 glassmorphism 사용
