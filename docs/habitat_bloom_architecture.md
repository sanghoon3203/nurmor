# Habitat Bloom Architecture

This document defines the product, frontend, backend, data, and AI analysis logic for Atlas's cell-based ecological codex.

## 1. Product Model

Atlas turns real-world observations into a map-based ecological database.

The user captures a photo, video, or sound at a real location. The backend sends the media and context to Gemini, receives structured species candidates, and creates an observation record. After user confirmation, the record is planted into the map cell for that location. The cell's codex, contributor list, bloom progress, and ecological density are updated.

Core product sentence:

> 사용자가 사진, 영상, 소리로 생물을 기록하면 Gemini 분석을 거쳐 지도 위 서식지 셀에 도감 항목으로 심어진다.

## 2. AI Model

Use Gemini API with the model ID:

```text
gemini-3-flash-preview
```

Relevant official capabilities:

- Inputs: text, image, video, audio, PDF
- Output: text
- Structured JSON output supported
- Function calling supported
- Search grounding supported
- Google Maps grounding is not supported for Gemini 3 Flash Preview

Implementation rule:

- The backend owns all Gemini calls.
- The mobile app never stores or sends Gemini API keys directly.
- Gemini output must be requested as structured JSON and validated server-side before it can create records.

## 3. Core Entities

### User

Represents an Atlas account.

Fields:

- `id`
- `displayName`
- `publicContributorName`
- `contributorVisibility`: `private | cell_only | public`
- `createdAt`

Rules:

- `displayName` may be private.
- `publicContributorName` is shown on map cells only when the user opts in.
- If visibility is private, records show as `익명 관찰자` in public surfaces.

### HabitatCell

Represents one map overlay cell.

Fields:

- `id`
- `gridType`: `hex | square | geohash`
- `cellKey`
- `centerLat`
- `centerLng`
- `bounds`
- `bloomState`: `unobserved | visited | seeded | growing | bloomed`
- `bloomScore`
- `observationCount`
- `speciesCount`
- `mediaTypeCounts`
- `topSpeciesCandidates`
- `contributors`
- `updatedAt`

Rules:

- `cellKey` is derived from latitude/longitude and zoom-independent grid rules.
- Public map views should use cell-level data, not exact coordinates.
- `bloomScore` increases with unique observations, media diversity, species diversity, and repeat confirmations.

### ObservationRecord

Represents a single user-submitted observation event.

Fields:

- `id`
- `userId`
- `habitatCellId`
- `mediaAssetIds`
- `capturedAt`
- `exactLat`
- `exactLng`
- `publicLat`
- `publicLng`
- `locationAccuracyMeters`
- `mediaTypes`: `photo | video | audio`
- `analysisJobId`
- `selectedSpeciesCandidateId`
- `visibility`: `private | cell | public`
- `status`: `captured | analyzing | needs_review | planted | rejected | failed`
- `createdAt`

Rules:

- Exact coordinates are private by default.
- Public coordinates should be snapped to the cell centroid or fuzzed within the cell.
- A record is not planted until analysis succeeds and the user confirms.

### MediaAsset

Represents uploaded capture media.

Fields:

- `id`
- `userId`
- `type`: `photo | video | audio`
- `storageKey`
- `mimeType`
- `durationMs`
- `sizeBytes`
- `checksum`
- `createdAt`

Rules:

- Store original media separately from derived thumbnails or compressed analysis copies.
- Use checksum to detect duplicate upload attempts.
- Generate smaller analysis copies when needed to control Gemini cost and latency.

### AnalysisJob

Tracks one Gemini analysis attempt.

Fields:

- `id`
- `observationRecordId`
- `model`: `gemini-3-flash-preview`
- `status`: `queued | running | succeeded | failed`
- `promptVersion`
- `inputSummary`
- `rawResponseStorageKey`
- `validatedResult`
- `errorCode`
- `errorMessage`
- `startedAt`
- `completedAt`

Rules:

- Store raw responses in private server storage for debugging, not in public APIs.
- Store only validated structured fields in app-facing APIs.
- Analysis should be idempotent per `observationRecordId`.

### SpeciesCandidate

Represents a possible identification returned by Gemini.

Fields:

- `id`
- `analysisJobId`
- `commonNameKo`
- `commonNameEn`
- `scientificName`
- `taxonRank`
- `confidence`
- `evidence`
- `visualTraits`
- `audioTraits`
- `behaviorNotes`
- `habitatHints`
- `riskFlags`

Rules:

- Every candidate must be displayed as an estimate.
- If confidence is low, the UI should ask the user to save as `미확인 생물`.
- Scientific names should be nullable because media may be insufficient.

### CodexEntry

Represents a cell-linked ecological database item.

Fields:

- `id`
- `habitatCellId`
- `speciesKey`
- `displayName`
- `scientificName`
- `observationRecordIds`
- `bestConfidence`
- `confirmationCount`
- `firstObservedAt`
- `lastObservedAt`
- `contributors`
- `representativeMediaAssetId`

Rules:

- A codex entry belongs to a habitat cell.
- Similar observations in the same cell should merge into an existing `CodexEntry` when species identity is likely the same.
- Users can still keep separate records under one codex entry.

## 4. Backend Responsibilities

### 4.1 API Surface

Recommended endpoints:

```text
POST /api/media/upload
POST /api/observations
POST /api/observations/:id/analyze
GET  /api/analysis-jobs/:id
POST /api/observations/:id/plant
GET  /api/habitat-cells/nearby
GET  /api/habitat-cells/:id
GET  /api/habitat-cells/:id/codex
GET  /api/codex-entries/:id
PATCH /api/observations/:id/visibility
```

Endpoint behavior:

- `POST /api/media/upload`: uploads media, validates MIME type and size, returns `MediaAsset`.
- `POST /api/observations`: creates a captured observation with location and media IDs.
- `POST /api/observations/:id/analyze`: queues or starts Gemini analysis.
- `GET /api/analysis-jobs/:id`: returns analysis status and validated result when ready.
- `POST /api/observations/:id/plant`: user confirms candidate and plants record into cell.
- `GET /api/habitat-cells/nearby`: returns cell summaries for map viewport.
- `GET /api/habitat-cells/:id`: returns one cell summary and contributor-safe public data.
- `GET /api/habitat-cells/:id/codex`: returns codex entries inside one cell.
- `PATCH /api/observations/:id/visibility`: changes record or contributor visibility.

### 4.2 Media Upload Logic

Flow:

1. Authenticate user.
2. Validate file type: image, video, or audio only.
3. Validate file size and duration.
4. Store original media.
5. Generate thumbnail or waveform preview where applicable.
6. Generate analysis-optimized derivative if needed.
7. Return media asset IDs to the client.

Security:

- Reject unknown MIME types.
- Do not trust file extensions.
- Rate-limit uploads by user.
- Scan or validate media metadata before processing.
- Strip sensitive EXIF fields from public derivatives.

### 4.3 Cell Resolution Logic

Flow:

1. Receive exact latitude/longitude from the client.
2. Validate coordinate range and accuracy.
3. Convert coordinate to `cellKey`.
4. Find or create `HabitatCell`.
5. Store exact coordinates only on private `ObservationRecord`.
6. Store public display coordinates as cell centroid or fuzzed coordinates.

Grid choice:

- Use hex cells if the product wants an organic exploration map.
- Use geohash if backend simplicity and spatial querying matter more.
- Use square cells if implementation speed is the highest priority.

Recommendation:

- Start with geohash or H3-style hex indexing.
- Keep the `HabitatCell` abstraction independent from the underlying grid library so it can change later.

### 4.4 Gemini Analysis Logic

Prompt responsibilities:

- Explain that the model is identifying wildlife or ecological evidence from user media.
- Ask for cautious estimates, not definitive claims.
- Request multiple candidates when uncertain.
- Ask for visual/audio evidence used for each candidate.
- Ask for safety and uncertainty flags.
- Include location context only as metadata, not as proof.

Structured output shape:

```json
{
  "summaryKo": "string",
  "isBiologicalObservation": true,
  "primaryMediaSignals": ["string"],
  "candidates": [
    {
      "commonNameKo": "string",
      "commonNameEn": "string",
      "scientificName": "string|null",
      "taxonRank": "species|genus|family|unknown",
      "confidence": 0.87,
      "evidence": ["string"],
      "visualTraits": ["string"],
      "audioTraits": ["string"],
      "habitatHints": ["string"],
      "uncertaintyReasons": ["string"]
    }
  ],
  "safetyFlags": ["string"],
  "recommendedUserAction": "plant|retake|save_as_unknown|discard"
}
```

Validation rules:

- `confidence` must be between 0 and 1.
- Candidate list must not be empty if `isBiologicalObservation` is true.
- If confidence is below a threshold, recommended action should not be direct planting.
- If media does not show or capture biological evidence, recommended action should be `retake` or `discard`.

### 4.5 Duplicate Candidate Logic

Before planting:

1. Compare selected candidate against existing `CodexEntry` records in the same cell.
2. Match by scientific name when available.
3. Fall back to normalized Korean/common name plus taxon rank.
4. If match confidence is high, suggest adding this observation to the existing entry.
5. If match confidence is low, create a new codex entry.

UI result options:

- `기존 도감 항목에 추가`
- `새 항목으로 등록`
- `미확인 생물로 저장`

### 4.6 Bloom Score Logic

Bloom score should reward useful ecological coverage, not spam.

Inputs:

- Unique observation count
- Distinct media types
- Distinct candidate species
- Repeat observations across different times
- Confidence-weighted confirmations
- Contributor diversity, if community features are enabled

Example formula:

```text
bloomScore =
  min(100,
    uniqueObservationScore +
    mediaDiversityScore +
    speciesDiversityScore +
    repeatConfirmationScore +
    contributorDiversityScore
  )
```

State thresholds:

- `unobserved`: 0
- `visited`: location seen but no planted record
- `seeded`: 1-20
- `growing`: 21-79
- `bloomed`: 80-100

Anti-spam rules:

- Repeated uploads from the same user, same cell, same media checksum should not increase score.
- Very low-confidence records should add little or no bloom score.
- Records marked private can contribute to private progress but should not affect public community score unless the user permits it.

## 5. Frontend Responsibilities

### 5.1 Map UI Logic

The map should render cells as the main product surface.

Required states:

- `비어 있음`: pale cell, no record
- `방문함`: faint outline
- `씨앗`: first planted record
- `자라는 중`: richer fill, bloom ring marks
- `피어남`: completed bloom state with strong but restrained color

Client behavior:

- Fetch cells for the current viewport.
- Cache nearby cell summaries.
- Render current location and selected cell separately.
- Open a `FieldRevealSheet` when a cell is selected.
- Keep exact coordinates out of public UI unless the user views their own private record.

### 5.2 Capture UI Logic

Capture modes:

- `사진`
- `영상`
- `소리`

Flow:

1. Check camera, microphone, and location permissions.
2. Show mode-specific capture controls.
3. Capture media.
4. Attach location metadata and accuracy.
5. Upload media.
6. Create observation record.
7. Start analysis.
8. Move to analysis pending screen.

Failure states:

- Camera permission denied
- Microphone permission denied
- Location unavailable
- Upload failed
- Analysis failed
- Media too long or too large

### 5.3 Analysis Result UI Logic

Pending state:

- Show `기록을 읽는 중`.
- Disable duplicate submissions.
- Show media preview and cell context.

Success state:

- Show `새 발견이 피었어요`.
- Display candidates as estimates.
- Show confidence and evidence.
- Let the user choose a candidate.
- Let the user choose contributor visibility.
- Primary action: `지도에 심기`.

Low-confidence state:

- Use `미확인 생물로 저장` as the safer default.
- Suggest retake if media quality is poor.

### 5.4 Codex UI Logic

The codex should be navigable by both species and cell.

Views:

- `내 생태 지도`: cell-first map view
- `서식지 셀`: selected cell detail
- `나의 기록`: user's observation records
- `지역 도감`: codex entries for a selected area
- `생물 상세`: candidate/species detail with evidence records

Record card fields:

- Estimated name
- Confidence
- Cell or neighborhood label
- Contributor display name
- Media type
- Observed time

### 5.5 Contributor UI Logic

Before planting a public record, ask how the contributor should appear.

Options:

- `익명으로 등록`
- `셀 안에서만 이름 표시`
- `공개 도감에 이름 표시`

Default:

- Use the user's saved preference.
- If no preference exists, default to private or cell-only, not full public.

## 6. Privacy And Safety

Location privacy:

- Exact coordinates are private by default.
- Public map data should use cell-level precision.
- Sensitive species or private places may require coarser cell display.

User identity:

- Public contributor display must be opt-in.
- Users can change visibility after planting.
- Existing public references should update when visibility changes.

AI safety:

- Never claim final biological certainty from Gemini alone.
- Label outputs as estimates.
- Preserve uncertainty reasons.
- Allow user correction or reporting.

Abuse prevention:

- Rate-limit uploads and analysis jobs.
- Detect duplicate media checksums.
- Require authentication for planting.
- Keep moderation hooks for public records.

## 7. Open Decisions

- Grid system: H3-style hex, geohash, or custom square cells.
- Minimum cell size for privacy and useful local exploration.
- Whether community records affect the same bloom score as private records.
- Whether expert verification is needed for high-impact species records.
- How long original media should be retained after analysis.
