# Atlas Mobile MVP Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Expo mobile app shell that can sign in with Firebase, call the Atlas API with a bearer token, and show a location-aware map home.

**Architecture:** Add a standalone Expo app under `mobile/`. Keep Firebase, API access, and location logic in focused modules so later capture/upload/analysis screens can reuse them.

**Tech Stack:** Expo, React Native, TypeScript, Expo Router, Firebase JS SDK, Expo Location, React Native Maps, TanStack Query.

---

### Task 1: Scaffold Expo App

**Files:**
- Create: `mobile/package.json`
- Create: `mobile/app.json`
- Create: `mobile/tsconfig.json`
- Create: `mobile/.env.example`

- [ ] Create a blank TypeScript Expo project under `mobile/`.
- [ ] Add dependencies for routing, Firebase Auth, location, maps, and API state.
- [ ] Add `EXPO_PUBLIC_` environment placeholders for Atlas API and Firebase client config.

### Task 2: App Core Modules

**Files:**
- Create: `mobile/src/config/env.ts`
- Create: `mobile/src/services/firebase.ts`
- Create: `mobile/src/services/api.ts`
- Create: `mobile/src/features/auth/AuthProvider.tsx`

- [ ] Validate public environment variables at startup.
- [ ] Initialize Firebase Auth and expose anonymous sign-in for MVP.
- [ ] Create an API client that attaches `Authorization: Bearer <id-token>`.
- [ ] Provide auth state to screens through a small React context.

### Task 3: Home UI

**Files:**
- Create: `mobile/app/_layout.tsx`
- Create: `mobile/app/index.tsx`
- Create: `mobile/src/features/map/MapHomeScreen.tsx`
- Create: `mobile/src/features/map/types.ts`

- [ ] Show logged-in/auth-loading/error states.
- [ ] Request foreground location permission.
- [ ] Render a map centered on the user when permission is granted.
- [ ] Call `/actuator/health` and `/api/habitat-cells/nearby`.
- [ ] Show API, auth, and location status in compact panels.

### Task 4: Verification

**Files:**
- Modify: `README.md`
- Create: `mobile/README.md`

- [ ] Run TypeScript check.
- [ ] Run Expo dependency validation if available.
- [ ] Document required mobile `.env` values and how to run against the local backend.
