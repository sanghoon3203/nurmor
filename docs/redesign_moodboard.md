# Atlas Redesign Moodboard

## 1. Direction

Atlas should feel like a playful ecological map where field observations make nearby habitats bloom.

The product can borrow the pleasure of territory expansion, but it should not use conquest language. Atlas is not about owning land. It is about noticing life, recording evidence, and gradually revealing the ecological character of places the user actually visits.

Working phrase:

> Walk, observe, and make your habitat map bloom.

Korean product phrase:

> 걷고, 관찰하고, 내 주변 서식지를 피워요.

## 2. Brand Concept

### Habitat Bloom

`Habitat Bloom` is the core redesign concept.

The map starts quiet and lightly veiled. As the user captures photos, videos, sounds, and AI-confirmed discoveries, map areas become brighter, richer, and more alive. This gives Atlas a game-like loop without making it feel like a creature game or a battle map.

Core idea:

- The user does not claim territory.
- The user reveals habitat.
- Records are planted into places.
- Repeated observations make each area bloom.
- The archive becomes a living map of ecological attention.

## 3. Product Loop

### Primary Loop

1. Walk through a real place.
2. Capture a plant, animal, sound, trace, or scene.
3. AI helps identify and summarize the observation.
4. The record is planted into the current map cell.
5. The cell gains bloom progress.
6. Neighboring cells invite more exploration.

### Emotional Loop

- Empty area: "What lives here?"
- First record: "I noticed something."
- Repeated records: "This place is becoming known."
- Completed cell: "This habitat has bloomed."

## 4. Vocabulary

Use ecological, playful language instead of conquest language.

| Avoid | Use |
|---|---|
| 점령 | 밝히기, 피우기 |
| 영토 | 서식지, 관찰 구역 |
| 땅따먹기 | 서식지 밝히기 |
| 기지 | 관찰 지점 |
| 레벨 | 탐사도, 생태 밀도 |
| 획득 | 기록 심기 |
| 완료율 | 개화도 |
| 미점령 | 아직 관찰되지 않음 |

Recommended Korean UI terms:

- `내 생태 지도`
- `서식지 밝히기`
- `기록 심기`
- `개화도`
- `관찰 셀`
- `새 발견`
- `오늘 밝힌 구역`
- `생태 밀도`
- `주변 서식지`
- `기록이 피었어요`

## 5. Core Mood

### Primary Mood

**Fresh Field Game + Living Archive**

- More playful than a pure field journal.
- More grounded than a collection game.
- Brighter than the previous mist archive direction.
- Still credible as an observation and AI analysis tool.

### Texture Pairing

**Map Cells + Bloom Rings**

- Map cells express exploration and progress.
- Bloom rings express repeated observations and living accumulation.
- Warm paper sheets keep analysis results human and readable.
- Fresh field surfaces keep capture and map modes light and energetic.

## 6. Visual Motifs

### Habitat Cells

Use a soft grid, hex, or organic cell system on the map. It should suggest territory expansion without looking militaristic.

Where it applies:

- Atlas map base
- Exploration progress
- Nearby area suggestions
- Empty states
- Weekly/monthly summaries

Cell states:

- `unobserved`: pale, quiet, lightly veiled
- `visited`: faint outline
- `seeded`: first record planted
- `growing`: multiple observations
- `bloomed`: habitat cell completed or richly observed

### Bloom Rings

Use rings as the main symbol for growth, time, and repeated observation.

Where it applies:

- Discovery completion
- Map cell progress
- Archive item thumbnails
- Confidence or observation count metadata
- Summary charts

Rings should feel botanical and cartographic, not arcade-like.

### Record Seeds

Use small seed/leaf marks for planted records.

Where it applies:

- Map pins
- Capture completion
- Archive cards
- Timeline markers

Keep them simple and symbolic. Avoid mascot-style characters.

## 7. Brightness And Color

Atlas should be bright, fresh, and slightly playful.

### Foundation

- Morning field neutrals for the app base
- Warm paper for result and archive surfaces
- Fresh moss green for primary progress and positive action
- Sky blue for AI, sensor, and location metadata
- Clay/amber for rare findings and warnings
- Soft bloom colors for completed habitat cells

### Suggested Palette Roles

| Role | Mood | Example |
|---|---|---|
| Field light | morning field | `#F3F5E8` |
| Field fresh | pale leaf | `#DDEBCF` |
| Field bloom | active habitat | `#C7E6A3` |
| Archive paper | warm record surface | `#F6E7C8` |
| Archive muted | aged label | `#D8C79F` |
| Moss primary | growth/action | `#5F9B50` |
| Moss deep | selected/pressed | `#3D6B36` |
| Sky metadata | AI/location | `#7DBCC8` |
| Bloom yellow | completion/reward | `#E5C95F` |
| Clay amber | warning/rare | `#C78347` |
| Ink primary | text | `#243027` |
| Ink muted | secondary text | `#68715F` |

These are moodboard values, not final token values.

## 8. Surface Language

### Recommended System

Use **Fresh Field Map** as the product base and **Warm Paper Sheet** as the record surface.

This gives Atlas two clear layers:

- Map layer: bright, cellular, exploratory, playful
- Archive layer: warm, readable, catalogued, trustworthy

### Fresh Field Map

Used for:

- Home map
- Capture context
- Exploration progress
- Nearby habitat suggestions

Properties:

- Pale field background
- Soft cell grid or organic tile overlay
- Bloom color fills by progress
- Small seed/leaf record marks
- Light coordinate metadata

### Warm Paper Sheet

Used for:

- Analysis results
- Archive detail
- Field notes
- Habitat cell detail

Properties:

- Warm off-white or muted paper background
- Thin ink-like border
- Label zones for species, confidence, place, time
- Faint bloom-ring marks
- Minimal shadow

## 9. Signature Interactions

### Field Reveal Sheet

Panels should reveal like a record sheet rising from the map.

Behavior:

- Translate Y from a short distance
- Fade opacity from 0 to 1
- Cross-blur from light blur to sharp
- Use one duration/easing curve

Recommended behavior:

- Open duration: around `400ms`
- Close duration: around `320-350ms`
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Travel: about `40-56px`
- Blur: about `2-3px`

### Habitat Bloom

After a record is saved, the current map cell should visibly change.

Behavior:

- A small seed mark appears.
- A bloom ring expands softly from the record point.
- The cell fill becomes slightly warmer or greener.
- Progress text updates, such as `개화도 42%`.

This is the product's main reward moment. It should feel satisfying but not arcade-like.

## 10. Screen-Level Design

### Home / Map

Purpose:

- Show the user's living ecological map.
- Make nearby unexplored cells inviting.

UI ideas:

- Header: `내 생태 지도`
- Today module: `오늘 밝힌 구역 3`
- Main map: soft habitat cells with bloom states
- CTA: `기록 심기`
- Nearby prompt: `주변에 아직 비어 있는 서식지가 있어요`

### Capture

Purpose:

- Let users plant a record into the current place.

UI ideas:

- Mode switch: `사진`, `소리`, `영상`
- Status: `위치 기록 중`
- Primary action: `관찰 시작`
- After capture: `이 구역에 기록을 심을까요?`

### AI Analysis

Purpose:

- Turn captured media into a useful ecological record.

UI ideas:

- Pending: `기록을 읽는 중`
- Success: `새 발견이 피었어요`
- Metadata: `신뢰도`, `주요 특징`, `서식지`, `시간`
- Primary action: `지도에 심기`
- Secondary action: `다시 촬영`

### Habitat Cell Detail

Purpose:

- Show progress and records inside one map cell.

UI ideas:

- Title: `서식지 셀`
- Progress: `개화도 64%`
- Stats: `기록 8개`, `소리 2개`, `식물 4개`
- CTA: `이 구역 더 관찰하기`

### Archive

Purpose:

- Make planted records feel collected and organized.

UI ideas:

- Header: `나의 기록`
- Filters: `전체`, `식물`, `소리`, `흔적`
- Card metadata: `심은 위치`, `관찰 시간`, `신뢰도`
- Summary: `이번 주 12개의 기록이 피었어요`

## 11. Approaches Considered

### Approach A: Field Journal

Warm paper everywhere, field notes first.

Strength:

- Trustworthy and tasteful.

Risk:

- Not playful enough.
- Map loop can feel secondary.

### Approach B: Territory Game

Grid map, progress, area expansion, strong reward loop.

Strength:

- Fun and easy to understand.
- Strong reason to revisit the app.

Risk:

- Can feel like conquest or a game skin if language is wrong.
- May weaken the natural observation purpose.

### Approach C: Habitat Bloom

Territory-expansion pleasure reframed as ecological revealing and blooming.

Strength:

- Keeps the fun of land-claiming without conquest language.
- Makes capture, AI analysis, archive, and map feel like one loop.
- Gives Atlas a distinct brand idea.

Risk:

- Requires careful copywriting so it does not become childish.
- Cell progress must be visually restrained and credible.

Recommendation:

Proceed with **Approach C: Habitat Bloom**.

## 12. Design Guardrails

Do:

- Make the map feel like it grows through observation.
- Use `개화도`, `기록 심기`, and `서식지 밝히기` as product language.
- Use bloom rings and habitat cells as recurring motifs.
- Keep record sheets warm, readable, and credible.
- Make progress visible but not noisy.

Do not:

- Use conquest, battle, or ownership language.
- Make the UI look like a strategy game map.
- Use Pokemon-like collection framing as the main identity.
- Turn every discovery into an exaggerated reward animation.
- Make the map too dark, technical, or military.
- Add decorative plants that do not explain state or progress.

## 13. Moodboard Keywords

- Habitat Bloom
- Living Archive
- Field Game
- Fresh Field
- Bloom Rings
- Habitat Cells
- Record Seeds
- Warm Paper
- Moss
- Morning Map
- Observation Grid
- Planted Records
- Ecological Progress
- Soft Discovery
- My Habitat Map
