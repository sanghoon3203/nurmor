# Backend Community Profile Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Atlas Spring Boot backend so the redesigned mobile app can use real profile, stats, nearby map, codex, and community data without replacing the existing observation engine.

**Architecture:** Keep the existing Firebase Auth, MediaAsset, ObservationRecord, Gemini, HabitatCell, and CodexEntry flow. Add focused read/write APIs around that engine: `profile`, location-scoped `nearby`, global codex listing, community discoveries, and my-page stats. Preserve privacy by returning public cell coordinates rather than exact observation coordinates.

**Tech Stack:** Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA, Flyway, PostgreSQL/H2, Firebase ID token auth.

---

### Task 1: Add Backend Contract Tests

**Files:**
- Create: `src/test/java/com/atlas/api/mobile/MobileBackendContractIntegrationTest.java`

- [ ] **Step 1: Write failing tests for redesigned mobile APIs**

Add integration tests that cover:

- `GET /api/me`
- `PUT /api/me`
- `GET /api/me/stats`
- `GET /api/me/recent-observations`
- `GET /api/habitat-cells/nearby?lat=...&lng=...&radiusKm=5`
- `GET /api/codex?category=PLANT&page=0&size=20`
- `GET /api/community/discoveries?lat=...&lng=...&radiusKm=5`

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
mvn test -Dtest=MobileBackendContractIntegrationTest
```

Expected: fail with `404` for the new endpoints and query contract gaps.

### Task 2: Add User Profile Domain

**Files:**
- Create: `src/main/java/com/atlas/api/profile/UserProfile.java`
- Create: `src/main/java/com/atlas/api/profile/UserProfileRepository.java`
- Create: `src/main/java/com/atlas/api/profile/UserProfileResponse.java`
- Create: `src/main/java/com/atlas/api/profile/UpdateProfileRequest.java`
- Create: `src/main/java/com/atlas/api/profile/ProfileService.java`
- Create: `src/main/java/com/atlas/api/profile/ProfileController.java`
- Modify: `src/main/resources/db/migration/V2__mobile_social_profile_schema.sql`

- [ ] **Step 1: Implement profile table and JPA entity**

Create `user_profiles` with internal `user_id`, Firebase UID, display name, avatar URL, public contributor flag, and timestamps.

- [ ] **Step 2: Implement `/api/me` read/write endpoints**

`GET /api/me` should auto-create a default profile from Firebase identity if missing. `PUT /api/me` should update display name, avatar URL, and public contributor opt-in.

- [ ] **Step 3: Run profile tests**

Run:

```bash
mvn test -Dtest=MobileBackendContractIntegrationTest
```

Expected: profile assertions pass; remaining endpoints still fail until later tasks.

### Task 3: Add Stats And Recent Observation APIs

**Files:**
- Create: `src/main/java/com/atlas/api/profile/UserStatsResponse.java`
- Create: `src/main/java/com/atlas/api/profile/RecentObservationResponse.java`
- Modify: `src/main/java/com/atlas/api/profile/ProfileService.java`
- Modify: `src/main/java/com/atlas/api/profile/ProfileController.java`
- Modify: `src/main/java/com/atlas/api/observation/ObservationRecordRepository.java`

- [ ] **Step 1: Add repository queries**

Add user-scoped count and recent observation queries. Counts should use planted observations for discovered species and all observations for report count.

- [ ] **Step 2: Implement `/api/me/stats` and `/api/me/recent-observations`**

Return numbers needed by MyPage and a list of recent public-cell observations. Do not return exact latitude or longitude.

- [ ] **Step 3: Run stats tests**

Run:

```bash
mvn test -Dtest=MobileBackendContractIntegrationTest
```

Expected: profile and stats tests pass; nearby/codex/community may still fail.

### Task 4: Replace Nearby All-Cells Behavior With Location Radius Query

**Files:**
- Modify: `src/main/java/com/atlas/api/habitat/HabitatCellRepository.java`
- Modify: `src/main/java/com/atlas/api/habitat/HabitatCellService.java`
- Modify: `src/main/java/com/atlas/api/habitat/HabitatCellController.java`

- [ ] **Step 1: Add lat/lng/radius validation**

Reject invalid latitude, longitude, and radius values with a `400` response.

- [ ] **Step 2: Add radius filtering**

Fetch cells by bounding box first, then sort/filter by haversine distance. Default radius is 5km when omitted. Return only public cell data.

- [ ] **Step 3: Keep local smoke compatibility**

Allow `/api/habitat-cells/nearby` without query params to use a default Seoul center for development clients until mobile is updated.

### Task 5: Add Global Codex List API

**Files:**
- Create: `src/main/java/com/atlas/api/codex/CodexCategory.java`
- Create: `src/main/java/com/atlas/api/codex/CodexListResponse.java`
- Modify: `src/main/java/com/atlas/api/codex/CodexEntry.java`
- Modify: `src/main/java/com/atlas/api/codex/CodexEntryRepository.java`
- Modify: `src/main/java/com/atlas/api/codex/CodexController.java`
- Modify: `src/main/resources/db/migration/V2__mobile_social_profile_schema.sql`

- [ ] **Step 1: Add codex display fields**

Add `category`, `representativeMediaKey`, and `discoveryNumber` to `codex_entries`.

- [ ] **Step 2: Add `GET /api/codex`**

Support `category`, `page`, and `size`. Return entries sorted by latest observation. The first implementation can categorize unknown species as `OTHER` until explicit taxonomy rules are added.

### Task 6: Add Community Discoveries API

**Files:**
- Create: `src/main/java/com/atlas/api/community/CommunityDiscoveryResponse.java`
- Create: `src/main/java/com/atlas/api/community/CommunityController.java`
- Create: `src/main/java/com/atlas/api/community/CommunityService.java`
- Modify: `src/main/java/com/atlas/api/observation/ObservationRecordRepository.java`

- [ ] **Step 1: Query recent planted public/cell observations around location**

Use public cell coordinates and visibility, not exact coordinates.

- [ ] **Step 2: Return feed cards**

Return discovery ID, display name, confidence, distance, public cell center, captured time, contributor display name when opt-in is true, and placeholder like/comment counts set to zero.

### Task 7: Docs And Verification

**Files:**
- Modify: `docs/backend_architecture_and_connection.md`
- Modify: `docs/project_status_and_todo.md`
- Modify: `README.md`

- [ ] **Step 1: Document the new APIs**

Update backend architecture docs with profile, stats, codex list, and community APIs.

- [ ] **Step 2: Run full verification**

Run:

```bash
mvn test
git diff --check
```

Expected: all tests pass and no whitespace errors.

