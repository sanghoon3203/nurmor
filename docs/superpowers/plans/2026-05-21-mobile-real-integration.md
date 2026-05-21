# Mobile Real Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the Expo mobile capture flow to Firebase Storage and the existing Atlas backend media, observation, analysis, plant, and codex endpoints.

**Architecture:** Keep Firebase Storage upload logic in a pure service, backend HTTP contracts in `mobile/src/services/api.ts`, and screen orchestration in `ObservationFlowProvider`. UI screens should observe flow state instead of owning backend sequencing.

**Tech Stack:** Expo React Native, Firebase Auth REST token, Firebase Storage REST upload endpoint, Spring Boot Atlas API, Cloud SQL-backed domain models.

---

### Task 1: Storage Upload Service

**Files:**
- Create: `mobile/src/services/firebaseStorageRest.ts`
- Create: `mobile/src/services/firebaseStorageRest.test.ts`
- Modify: `mobile/package.json`
- Modify: `mobile/tsconfig.test.json`

- [x] **Step 1: Write failing unit tests**

Run: `cd mobile && npm run test:unit`

Expected first failure: `Cannot find module './firebaseStorageRest'`.

- [x] **Step 2: Implement storage helpers**

Add helpers for MIME to Atlas media type, object path generation, FNV checksum, local blob reading, and Firebase Storage REST upload.

- [x] **Step 3: Verify**

Run: `cd mobile && npm run test:unit`

Expected: storage tests pass.

### Task 2: Atlas API Client

**Files:**
- Modify: `mobile/src/services/api.ts`
- Create: `mobile/src/services/api.test.ts`

- [x] **Step 1: Write failing API contract tests**

Run: `cd mobile && npm run test:unit`

Expected first failure: missing exports for `registerMediaAsset`, `createObservation`, `analyzeObservation`, `plantObservation`, and `getCodexEntries`.

- [x] **Step 2: Implement API methods**

Add typed request and response contracts for:

```text
POST /api/media/register
POST /api/observations
POST /api/observations/{id}/analyze
GET  /api/analysis-jobs/{id}
POST /api/observations/{id}/plant
GET  /api/habitat-cells/{cellId}/codex
```

- [x] **Step 3: Verify**

Run: `cd mobile && npm run test:unit`

Expected: API tests pass.

### Task 3: Mobile Flow Orchestration

**Files:**
- Create: `mobile/src/features/observation/ObservationFlowProvider.tsx`
- Modify: `mobile/app/_layout.tsx`
- Modify: `mobile/src/features/capture/CaptureScreen.tsx`
- Modify: `mobile/src/features/analysis/AnalysisScreen.tsx`
- Modify: `mobile/src/features/cell/CellDetailScreen.tsx`

- [x] **Step 1: Add flow provider**

Wrap Expo routes with `ObservationFlowProvider` inside `AuthProvider`.

- [x] **Step 2: Connect capture**

When a user selects media and taps `Gemini로 읽기`, run:

```text
location -> blob -> checksum -> Firebase Storage upload -> media register -> observation create -> analysis
```

- [x] **Step 3: Connect analysis and plant**

Render actual `AnalysisResponse.candidates[0]` when available, then call `POST /api/observations/{id}/plant` with `visibility: CELL`.

- [x] **Step 4: Connect cell codex**

After plant succeeds, fetch `GET /api/habitat-cells/{cellId}/codex` and render returned entries.

### Task 4: Remaining Verification

**Files:**
- Modify: `docs/frontend_todo.md`

- [ ] **Step 1: Real device Firebase Storage upload**

Run Expo Go on a physical device and select a photo.

Expected: Firebase Storage contains an object under `users/{firebaseUid}/observations/...`.

- [ ] **Step 2: Cloud SQL row verification**

Expected rows:

```text
media_assets: 1 new row
observation_records: 1 new row
analysis_jobs: 1 new row
species_candidates: >= 1 new row
codex_entries: >= 1 new row after plant
```

- [ ] **Step 3: Failure state verification**

Temporarily deny location permission and confirm the app shows an error before upload starts.
