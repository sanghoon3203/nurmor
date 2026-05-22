# Mobile Launch Gate Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Atlas initial entry screen with a #FFFDF4 background, logo dissolve, staggered leaf curtain transition, and session-based routing to login or map.

**Architecture:** Keep routing decisions in small pure helpers and render the visual transition as a focused Expo Router launch route. `AuthProvider` must stop auto-creating anonymous sessions during bootstrap so the launch gate can route users without a previous session to `/login`.

**Tech Stack:** Expo Router, React Native Animated, AsyncStorage-backed Firebase REST auth session, TypeScript node tests.

---

### Task 1: Auth Session Route Decision

**Files:**
- Create: `mobile/src/features/launch/launchFlow.ts`
- Modify: `mobile/src/features/auth/types.ts`
- Test: `mobile/src/features/launch/launchFlow.test.ts`
- Modify: `mobile/tsconfig.test.json`

- [ ] Write a failing test that proves `authenticated` routes to `/(tabs)` and non-session states route to `/login`.
- [ ] Implement `resolveLaunchRoute(status)`.
- [ ] Extend `AuthStatus` with `unauthenticated`.
- [ ] Include the launch test in `tsconfig.test.json`.

### Task 2: AuthProvider Bootstrap Behavior

**Files:**
- Modify: `mobile/src/features/auth/AuthProvider.tsx`

- [ ] Stop anonymous sign-in during bootstrap when no stored session exists.
- [ ] Keep explicit `signIn()` behavior for the login screen.
- [ ] Set `unauthenticated` when no session exists or a stored session cannot be parsed.

### Task 3: Launch Animation Route

**Files:**
- Create: `mobile/src/features/launch/AppLaunchGate.tsx`
- Create: `mobile/app/index.tsx`
- Modify: `mobile/app/_layout.tsx`
- Copy assets: `logo.png` and `Leaves.png` into `mobile/assets/brand/`

- [ ] Render a full-screen `#FFFDF4` launch view.
- [ ] Fade/scale the logo at center with `translateY: -30`.
- [ ] Build a staggered leaf curtain using repeated `Leaves.png` image tiles.
- [ ] After the curtain covers the screen and auth status resolves, `router.replace(targetRoute)`.
- [ ] Fade the curtain out so the destination is revealed.

### Task 4: Nearby API Uses Location

**Files:**
- Modify: `mobile/src/services/api.ts`
- Modify: `mobile/src/services/api.test.ts`
- Modify: `mobile/src/features/map/MapHomeScreen.tsx`

- [ ] Update `getNearbyHabitatCells` to accept optional `{ latitude, longitude, radiusKm }`.
- [ ] Serialize docs-compatible query parameters.
- [ ] Pass granted Expo location coordinates from `MapHomeScreen`.

### Task 5: Verification

**Commands:**
- `cd mobile && npm run test:unit`
- `cd mobile && npm run typecheck`

- [ ] Confirm unit tests pass.
- [ ] Confirm TypeScript typecheck passes.
- [ ] Update docs if route or auth behavior changed.
