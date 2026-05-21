# Atlas Component Specification

이 문서는 Atlas의 공통 컴포넌트와 주요 화면 컴포넌트를 정의한다. 모든 컴포넌트는 [design_system.md](./design_system.md)의 `Habitat Bloom` 토큰을 기준으로 구현한다.

## 1. Button

### Component Name
`Button`

### Purpose
주요 액션, 보조 액션, 위험 액션을 일관된 크기와 상태로 제공한다.

### Anatomy
- Container
- Optional leading icon
- Label
- Optional trailing icon
- Loading indicator

### Variants
- `primary`: 가장 중요한 화면당 1개 CTA. 예: 분석 시작, 캡처 저장
- `secondary`: 보조 액션. 예: 다시 촬영
- `ghost`: 낮은 위계 액션. 예: 닫기, 건너뛰기
- `destructive`: 삭제, 초기화 같은 위험 액션

### States
- `default`
- `pressed`
- `focused`
- `disabled`
- `loading`

### Usage Guidelines
- 화면당 `primary` 버튼은 1개를 원칙으로 한다.
- 버튼 label은 동사로 시작한다. 예: `분석 시작`, `다시 촬영`, `지도에서 보기`
- loading 중에는 중복 터치를 막고 label을 유지하거나 `분석 중`처럼 상태를 명확히 쓴다.

### Do / Don't
- Do: `primary`는 `color.brand.primary` 배경과 `color.background.default` 텍스트를 사용한다.
- Do: 터치 피드백은 `motion.scale.pressed`를 사용한다.
- Don't: 기본 버튼에 그라디언트, 픽셀 더블 보더, 강한 glow를 적용하지 않는다.

### Design Tokens
- `color.brand.primary`
- `color.brand.primaryHover`
- `color.semantic.danger`
- `radius.md`
- `spacing.sm`
- `spacing.md`
- `motion.duration.fast`

### Example UI Behavior
사용자가 `분석 시작`을 누르면 버튼은 `scale: 0.98`로 짧게 반응하고 loading 상태로 전환된다. 분석 요청 중에는 disabled 상태를 유지한다.

### Implementation Notes
React Native에서는 `Pressable` 기반으로 구현하고 `accessibilityRole="button"`을 지정한다. loading 상태에서는 spinner와 label을 함께 제공해 상태를 숨기지 않는다.

## 2. SurfaceCard

### Component Name
`SurfaceCard`

### Purpose
도감 항목, 분석 결과, 지도 핀 상세 정보처럼 하나의 정보 단위를 안정적으로 묶는다.

### Anatomy
- Container
- Optional media thumbnail
- Header row
- Title
- Metadata
- Optional action row

### Variants
- `default`: 일반 카드
- `selected`: 선택된 항목
- `interactive`: press 가능한 카드
- `compact`: 리스트 밀도가 높은 카드

### States
- `default`
- `pressed`
- `focused`
- `selected`
- `disabled`

### Usage Guidelines
- 카드 내부 padding은 기본 `spacing.md`, compact는 `spacing.sm`를 사용한다.
- 카드 제목은 1~2줄로 제한하고, 긴 설명은 상세 화면으로 보낸다.
- 같은 리스트 안에서 카드 radius와 border 두께를 바꾸지 않는다.

### Do / Don't
- Do: 정보 위계는 title, metadata, action 순서로 만든다.
- Do: selected 상태는 border와 subtle background tint로 표현한다.
- Don't: 모든 카드에 그림자와 glow를 동시에 넣지 않는다.

### Design Tokens
- `color.surface.card`
- `color.border.default`
- `color.border.strong`
- `color.text.primary`
- `color.text.secondary`
- `radius.md`
- `spacing.md`
- `shadow.none`

### Example UI Behavior
도감 리스트에서 카드를 누르면 pressed 상태가 120ms 동안 적용되고 상세 bottom sheet가 열린다. 선택된 카드는 `color.border.strong`과 `color.brand.subtle`을 사용한다.

### Implementation Notes
카드는 기본적으로 shadow를 갖지 않는다. 지도나 카메라 위에 떠 있는 카드만 `shadow.sm`을 허용한다.

## 3. Typography

### Component Name
`Text`

### Purpose
Atlas 전역 텍스트의 크기, 굵기, 줄높이, 색상 위계를 통일한다.

### Anatomy
- Text node
- Variant style
- Color role
- Optional truncation behavior

### Variants
- `caption`
- `body`
- `bodyStrong`
- `title`
- `display`
- `badgeDisplay`

### States
- `default`
- `secondary`
- `tertiary`
- `danger`
- `success`

### Usage Guidelines
- 본문은 시스템 폰트와 `font.size.body`를 사용한다.
- `badgeDisplay`만 `font.family.display`를 사용할 수 있다.
- 긴 값은 truncate보다 정보 구조를 재설계하는 것을 우선한다.

### Do / Don't
- Do: timestamp, 좌표, 파일 타입은 `caption`을 사용한다.
- Do: 분석 결과명은 `display` 또는 `title`을 사용한다.
- Don't: 본문 전체에 `pokemon-bw.ttf`를 적용하지 않는다.
- Don't: 기본 텍스트에 pixel shadow를 적용하지 않는다.

### Design Tokens
- `font.family.sans`
- `font.family.display`
- `font.size.caption`
- `font.size.body`
- `font.size.title`
- `font.size.display`
- `color.text.primary`
- `color.text.secondary`
- `color.text.tertiary`

### Example UI Behavior
발견 완료 화면의 짧은 라벨 `FOUND`는 `badgeDisplay`를 사용할 수 있지만, 생물명과 설명은 시스템 폰트로 표시한다.

### Implementation Notes
텍스트 variant와 semantic color를 props로 분리한다. 예: `<Text variant="body" tone="secondary" />`.

## 4. StatusBadge

### Component Name
`StatusBadge`

### Purpose
분석 상태, 녹화 상태, 권한 상태, 발견 희귀도 같은 짧은 상태 정보를 표현한다.

### Anatomy
- Container
- Optional status dot
- Label

### Variants
- `neutral`
- `info`
- `success`
- `warning`
- `danger`
- `brand`

### States
- `default`
- `active`
- `disabled`

### Usage Guidelines
- 상태 label은 1~2단어로 제한한다. 예: `REC`, `분석 중`, `완료`, `권한 필요`
- `danger`는 실제 오류/녹화 중단 같은 긴급 상태에만 사용한다.

### Do / Don't
- Do: 녹화 중 `REC`는 status dot과 함께 표시한다.
- Don't: badge에 긴 설명 문장을 넣지 않는다.

### Design Tokens
- `radius.full`
- `spacing.xs`
- `font.size.caption`
- `color.semantic.success`
- `color.semantic.warning`
- `color.semantic.danger`
- `color.semantic.info`

### Example UI Behavior
녹화가 시작되면 상단 HUD에 `REC` badge가 나타나고 status dot만 부드럽게 pulse한다. 전체 badge가 과하게 깜빡이지 않는다.

### Implementation Notes
상태 색상은 semantic token만 사용한다. 브랜드 컬러로 오류 상태를 표현하지 않는다.

## 5. CaptureControl

### Component Name
`CaptureControl`

### Purpose
사진, 비디오, 오디오 캡처의 시작/중지 액션을 제공하는 핵심 미디어 컨트롤이다.

### Anatomy
- Outer ring
- Inner action fill
- Mode indicator
- Optional progress ring

### Variants
- `photo`
- `video`
- `audio`
- `stop`

### States
- `idle`
- `pressed`
- `recording`
- `processing`
- `disabled`

### Usage Guidelines
- 캡처 컨트롤은 화면 하단 중앙에 고정한다.
- video/audio recording 중에는 중지 가능 상태를 명확히 보여준다.
- progress ring은 녹화 시간 또는 분석 진행률에만 사용한다.

### Do / Don't
- Do: recording 상태는 `color.semantic.danger`를 제한적으로 사용한다.
- Do: processing 상태는 `color.brand.primary`와 loading motion을 사용한다.
- Don't: 캡처 버튼에 다색 그라디언트를 기본 적용하지 않는다.

### Design Tokens
- `color.brand.primary`
- `color.semantic.danger`
- `color.background.subtle`
- `radius.full`
- `border.width.strong`
- `motion.duration.fast`

### Example UI Behavior
사용자가 오디오 모드에서 컨트롤을 누르면 inner fill이 `recording` 상태로 바뀌고 HUD에 `REC` badge와 waveform이 표시된다.

### Implementation Notes
햅틱은 캡처 시작, 캡처 중지, 분석 완료처럼 의미 있는 순간에만 사용한다.

## 6. ModeSegmentedControl

### Component Name
`ModeSegmentedControl`

### Purpose
`VISUAL`과 `AUDIO` 같은 캡처 모드를 빠르게 전환한다.

### Anatomy
- Container
- Segment item
- Selected indicator
- Label

### Variants
- `default`
- `compact`

### States
- `default`
- `selected`
- `disabled`

### Usage Guidelines
- segment는 2~4개까지만 사용한다.
- selected 상태는 background tint와 text weight로 표현한다.

### Do / Don't
- Do: 모드명은 짧고 예측 가능하게 유지한다.
- Don't: 탭처럼 화면 전체 navigation에 사용하지 않는다.

### Design Tokens
- `color.surface.default`
- `color.brand.subtle`
- `color.brand.primary`
- `color.text.primary`
- `color.text.secondary`
- `radius.full`
- `spacing.xs`

### Example UI Behavior
`AUDIO`를 선택하면 카메라 preview는 밝은 field surface로 전환되고 waveform이 중심 정보가 된다.

### Implementation Notes
선택 상태는 controlled value로 관리한다. 화면별 내부 상태와 전역 navigation 상태를 섞지 않는다.

## 7. WaveformMeter

### Component Name
`WaveformMeter`

### Purpose
오디오 입력 크기를 실시간으로 보여주되, 분석 도구처럼 차분하고 읽기 쉽게 표현한다.

### Anatomy
- Meter container
- Bar group
- Current level marker
- Optional dB label

### Variants
- `compact`
- `large`

### States
- `idle`
- `listening`
- `clipping`
- `disabled`

### Usage Guidelines
- 막대 색상은 기본 brand color를 쓰고, clipping 상태만 warning/danger로 전환한다.
- 변화는 부드럽게 보간하되 과한 bounce를 사용하지 않는다.

### Do / Don't
- Do: 오디오 모드에서는 중앙 주요 정보로 배치한다.
- Don't: 모든 막대에 다색 네온 그라디언트를 적용하지 않는다.

### Design Tokens
- `color.brand.primary`
- `color.semantic.warning`
- `color.semantic.danger`
- `color.text.secondary`
- `spacing.2xs`
- `motion.duration.base`

### Example UI Behavior
마이크 입력이 커지면 bar height가 `motion.duration.base`로 반응한다. 입력이 clipping에 가까워지면 상단 marker가 warning 색상으로 바뀐다.

### Implementation Notes
렌더링 빈도를 제어해 배터리와 프레임 저하를 줄인다. 값이 없을 때는 idle skeleton이 아니라 조용한 baseline을 표시한다.

## 8. HabitatCell

### Component Name
`HabitatCell`

### Purpose
지도 위 셀 단위 생태 데이터베이스의 상태와 개화도를 표현한다.

### Anatomy
- Cell shape
- Bloom fill
- Optional record seed
- Optional count
- Selected outline

### Variants
- `unobserved`
- `visited`
- `seeded`
- `growing`
- `bloomed`
- `selected`

### States
- `default`
- `selected`
- `loading`
- `disabled`

### Usage Guidelines
- 셀은 지도 위 주요 정보 구조다.
- 색상은 개화도와 기록 밀도를 표현하되 전략 게임 지도처럼 보이지 않게 낮은 대비를 유지한다.
- 지도 위 label은 최소화하고 상세 정보는 `FieldRevealSheet`에서 제공한다.

### Do / Don't
- Do: selected cell은 outline과 bloom ring으로 구분한다.
- Do: 첫 기록이 심어진 셀은 작은 seed marker를 표시한다.
- Don't: 점령, 영토, 전투 UI처럼 보이는 강한 경계와 색면을 사용하지 않는다.

### Design Tokens
- `color.brand.primary`
- `color.brand.subtle`
- `color.semantic.success`
- `color.semantic.info`
- `color.surface.elevated`
- `border.width.strong`
- `motion.duration.base`

### Example UI Behavior
사용자가 셀을 누르면 selected outline이 생기고 하단에 `FieldRevealSheet`가 열린다. 새 기록이 등록되면 seed marker가 나타나고 bloom ring이 짧게 확장된다.

### Implementation Notes
셀 터치 가능 영역은 44px 이상 확보한다. 공개 지도에서는 정확 좌표 대신 셀 centroid 또는 흐린 위치를 사용한다.

## 9. CodexEntryCard

### Component Name
`CodexEntryCard`

### Purpose
셀에 심어진 관찰 기록을 도감 항목으로 보여준다.

### Anatomy
- Warm paper container
- Estimated species name
- Confidence badge
- Media type indicator
- Habitat cell label
- Contributor display
- Timestamp

### Variants
- `default`
- `compact`
- `selected`
- `needsReview`

### States
- `default`
- `pressed`
- `selected`
- `loading`

### Usage Guidelines
- 생물명은 확정이 아니라 추정으로 표시한다. 예: `노랑나비로 추정`.
- 기여자 이름은 공개 설정이 허용된 경우에만 표시한다.
- 같은 셀의 기존 항목과 중복 가능성이 있으면 `기존 항목에 추가` 행동을 제공한다.

### Do / Don't
- Do: 신뢰도, 관찰 근거, 위치 셀을 함께 보여준다.
- Do: 낮은 신뢰도는 `미확인 생물` 저장을 우선 제안한다.
- Don't: AI 분석 결과를 생물학적 확정 판정처럼 표현하지 않는다.

### Design Tokens
- `color.surface.card`
- `color.border.default`
- `color.text.primary`
- `color.text.secondary`
- `color.brand.primary`
- `color.semantic.warning`
- `radius.md`
- `spacing.md`

### Example UI Behavior
사용자가 분석 후보를 선택하면 `CodexEntryCard` preview가 생성된다. `지도에 심기`를 누르면 카드가 현재 셀에 연결되고 셀 개화도가 갱신된다.

### Implementation Notes
카드는 `ObservationRecord`와 `CodexEntry`를 구분해서 표현해야 한다. 하나의 도감 항목 안에 여러 관찰 기록이 포함될 수 있다.
