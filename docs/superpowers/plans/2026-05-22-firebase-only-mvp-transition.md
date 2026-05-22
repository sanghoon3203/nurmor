# Firebase Only MVP Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the mobile app continue development without Cloud Run or Cloud SQL by reading core product data directly from Firebase Auth, Firestore, and Storage.

**Architecture:** Keep the Spring Boot API code as a legacy path, but move the mobile runtime read model to a `firebaseAtlasDb` repository. Firestore REST is used with Firebase ID tokens so Firestore Security Rules remain the authorization boundary.

**Tech Stack:** Expo React Native, Firebase Auth REST, Cloud Firestore REST API, Firebase Storage REST, TypeScript node tests.

---

### Task 1: Firestore Repository

**Files:**
- Create: `mobile/src/services/firebaseAtlasDb.ts`
- Create: `mobile/src/services/firebaseAtlasDb.test.ts`
- Modify: `mobile/tsconfig.test.json`

- [x] Add Firestore REST document conversion helpers.
- [x] Add collection list helpers for `habitatCells`, `codexEntries`, `communityDiscoveries`.
- [x] Add `getOrCreateUserProfile`.
- [x] Add tests proving Firebase ID token bearer auth and Firestore REST paths.

### Task 2: Firebase-only Mobile Runtime

**Files:**
- Modify: `mobile/src/config/env.ts`
- Modify: `mobile/src/features/map/MapHomeScreen.tsx`
- Modify: `mobile/src/features/map/types.ts`
- Modify: `mobile/src/features/codex/CodexScreen.tsx`
- Modify: `mobile/src/features/community/CommunityScreen.tsx`
- Modify: `mobile/src/features/profile/ProfileScreen.tsx`

- [x] Make `EXPO_PUBLIC_ATLAS_API_BASE_URL` optional.
- [x] Map reads nearby cells from Firestore.
- [x] Dex reads global codex entries from Firestore.
- [x] Community reads nearby discoveries from Firestore.
- [x] Profile reads/creates `users/{uid}` from Firestore.

### Task 3: Firebase Rules And Docs

**Files:**
- Create: `firestore.rules`
- Create: `docs/firebase_only_mvp.md`
- Modify: `mobile/README.md`
- Modify: `docs/project_status_and_todo.md`

- [x] Document Firestore collections.
- [x] Add MVP security rules for users, cells, codex entries, observations, and community discoveries.
- [x] Document the Gemini limitation while Cloud Run is unavailable.

### Task 4: Verification

**Commands:**
- `cd mobile && npm run test:unit`
- `cd mobile && npm run typecheck`
- `cd mobile && npm run expo:check`

- [x] Confirm unit tests pass.
- [x] Confirm TypeScript typecheck passes.
- [x] Confirm Expo dependency check passes.

### Task 5: Firebase-only Record Planting

**Files:**
- Modify: `mobile/src/services/firebaseAtlasDb.ts`
- Modify: `mobile/src/services/firebaseAtlasDb.test.ts`
- Modify: `mobile/src/features/observation/ObservationFlowProvider.tsx`
- Modify: `mobile/src/features/capture/CaptureScreen.tsx`
- Modify: `mobile/src/features/analysis/AnalysisScreen.tsx`
- Modify: `firestore.rules`
- Modify: `docs/firebase_only_mvp.md`

- [x] Write failing tests for observation draft creation and planting writes.
- [x] Create Firestore `observations` draft after Firebase Storage upload.
- [x] Provide a Firebase-only placeholder candidate while Gemini backend is paused.
- [x] Plant selected candidate into `codexEntries`, `communityDiscoveries`, `habitatCells`, and `users/{uid}` stats.
- [x] Update Firestore rules for observation media metadata.
- [x] Confirm unit tests, typecheck, and Expo dependency check pass.
