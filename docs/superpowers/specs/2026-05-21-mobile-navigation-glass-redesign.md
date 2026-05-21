# Mobile Navigation Glass Redesign Spec

## Goal

Atlas mobile should feel like a complete iPhone-native ecological field app, not a single map screen. The app will move to a five-tab structure with a glassmorphism interface, preserving the existing observation pipeline while adding clear destinations for codex, recording, community, and profile flows.

## Product Position

Atlas remains a Living Archive + Habitat Bloom product. The map is still the product center, but it no longer has to carry every workflow alone. The navigation model should make the product feel like a full app:

- `도감`: collected species and cell archive
- `홈`: current ecological map and nearby habitat context
- `기록`: photo/video/sound observation flow
- `커뮤니티`: recent nearby discoveries within 5 km
- `마이페이지`: identity, contributor preferences, and account state

The language must avoid occupation/territory framing. Use words like `기록`, `발견`, `서식지`, `도감`, `개화`, `근처`, and `기여`.

## Primary Workflow

The first implementation must keep the existing working vertical flow intact:

```text
Firebase Auth -> 홈 지도 -> 기록 탭 -> media 선택 -> Firebase Storage upload
-> MediaAsset 등록 -> ObservationRecord 생성 -> Gemini 분석 -> 후보 선택
-> 지도에 심기 -> 셀 도감 갱신
```

The new navigation should make this flow easier to understand:

1. The user lands on `홈`.
2. The user taps the center `기록` tab or a home CTA.
3. The user selects photo/video/sound and starts analysis.
4. The app moves through analysis and planting without losing the bottom navigation shell.
5. After planting, the user can move to `도감` or the relevant cell detail.

## Navigation Architecture

Use Expo Router tab routes:

```text
mobile/app/_layout.tsx
mobile/app/(tabs)/_layout.tsx
mobile/app/(tabs)/index.tsx
mobile/app/(tabs)/codex.tsx
mobile/app/(tabs)/record.tsx
mobile/app/(tabs)/community.tsx
mobile/app/(tabs)/profile.tsx
mobile/app/analysis.tsx
mobile/app/cell.tsx
```

`analysis.tsx` and `cell.tsx` may remain stack-level detail routes because they are transient detail states. The tab bar should remain visible for normal tab screens and can be hidden or visually reduced for focused analysis screens if the implementation needs more vertical space.

The tab order is:

```text
도감 | 홈 | 기록 | 커뮤니티 | 마이
```

`기록` is the primary action and should be visually stronger than the other tabs. It can use a lifted glass capsule or bloom button treatment, but it must remain a normal tab destination rather than a modal-only action.

## Screen Responsibilities

### 홈

`홈` owns the live ecological map. It should show:

- current location and HabitatCell overlays
- selected cell summary in a glass panel
- compact API/auth/location state
- primary CTA to start a record
- a small preview rail of nearby recent discoveries

The map remains full-screen behind glass panels. UI panels should not cover the map so heavily that the habitat cells become secondary.

### 기록

`기록` owns the capture and upload entry point. It should reuse the current `CaptureScreen` flow:

- photo/video/sound segmented control
- current location status
- media picker for Expo Go
- Firebase Storage upload status
- `Gemini로 읽기` action

Direct camera capture, sound recording, and upload progress percentage are follow-up enhancements. The 1st redesign pass should not break the current image picker path.

### 도감

`도감` shows archived ecological records. First pass content:

- recently planted codex entries from `ObservationFlowProvider` when available
- fallback sample codex cards when no real entries exist
- cell bloom summary
- empty state that points the user to `기록`

Later API work can add a dedicated `/api/me/codex` or `/api/users/me/codex` endpoint. The 1st pass should not invent a backend dependency that does not exist yet.

### 커뮤니티

`커뮤니티` shows recent discovery cards within 5 km. First pass behavior:

- use current location permission when available
- show a card feed with distance labels such as `1.2km 근처`
- show common name, confidence, discovery time, contributor display name, bloom state, and cell-level location only
- never show exact latitude/longitude
- fallback to sample cards until a backend endpoint exists

Target backend contract for later:

```http
GET /api/community/discoveries?lat={lat}&lng={lng}&radiusMeters=5000
Authorization: Bearer <firebase-id-token>
```

Response shape:

```json
{
  "items": [
    {
      "id": "entry-id",
      "commonNameKo": "노랑나비로 추정",
      "scientificName": "Pieris rapae",
      "confidence": 0.87,
      "observedAt": "2026-05-21T07:30:00Z",
      "distanceMeters": 1240,
      "cellId": "cell-id",
      "cellKey": "cell-key",
      "bloomState": "GROWING",
      "contributorName": "김상훈",
      "mediaPreviewUrl": null
    }
  ]
}
```

### 마이페이지

`마이페이지` owns account state and contributor preferences. First pass content:

- current auth status
- Firebase UID shortened display
- login screen entry
- signup screen entry
- contributor name visibility explanation
- logout or reset-session affordance if supported by the current auth provider

The current Firebase anonymous auth remains the functional auth path. Login and signup screens should be production-quality UI shells first, then real email/social provider wiring can be added in a later backend/auth task.

## Login And Signup Screens

The app needs visible login and signup surfaces even if the first implementation still uses Firebase anonymous auth for the actual session.

Login screen:

- Atlas brand mark and Habitat Bloom copy
- email field
- password field
- primary login button
- anonymous field mode button labeled `둘러보기`
- route to signup

Signup screen:

- nickname field
- email field
- password field
- contributor visibility opt-in
- primary signup button
- route to login

The first pass may simulate form state locally and keep anonymous auth as the operational path. It must not claim real email account creation until Firebase provider wiring exists.

## Visual System

The visual direction is bright ecological glassmorphism for iPhone:

- background: full-screen map, soft nature gradients, and light bloom accents
- surfaces: translucent frosted glass panels with thin white borders
- tab bar: floating bottom capsule with blur, subtle shadow, and selected glow
- primary action: raised `기록` tab with bloom/leaf accent
- cards: rounded but controlled, maximum radius should feel native and not toy-like
- text: dark canopy green, muted moss gray, clear Korean hierarchy
- accents: sky blue for AI/analysis, bloom yellow for discovery, leaf green for save/plant actions

Use the existing Atlas palette, but extend it with glass tokens:

```text
glass.surface: rgba(255, 255, 255, 0.68)
glass.surfaceStrong: rgba(255, 255, 255, 0.82)
glass.border: rgba(255, 255, 255, 0.72)
glass.shadow: rgba(22, 63, 45, 0.18)
glass.tintGreen: rgba(223, 241, 207, 0.68)
glass.tintSky: rgba(205, 238, 245, 0.7)
glass.tintBloom: rgba(255, 207, 90, 0.25)
```

Preferred Expo dependencies for a later native blur pass:

```text
expo-blur
expo-linear-gradient
```

The first implementation may use translucent React Native `View` layers only, because this keeps Expo Go verification independent from dependency installation. Use `BlurView` for glass panels later when `expo-blur` is installed and verified. Use translucent fallback styling whenever blur is not available on a device.

## Motion System

Motion should borrow the transitions.dev panel reveal feeling:

```text
closed: translateY(20-40), opacity 0, blur/tint stronger
open: translateY(0), opacity 1, blur/tint normal
duration: 350-420ms
easing: soft ease-out
```

React Native implementation constraints:

- use `Animated` from React Native for Expo Go compatibility
- use opacity and translateY as the reliable baseline
- do not depend on CSS `filter: blur`
- respect reduced motion by keeping transitions short and nonessential

Motion should be applied to:

- selected tab content reveal
- map bottom cell panel reveal
- community card list stagger
- login/signup form panel entrance

Avoid excessive animation on the map itself.

## Component Inventory

Create or extend reusable components:

```text
mobile/src/features/atlas/glass.tsx
- GlassPanel
- GlassCard
- GlassTabIcon
- GradientScreen
- FloatingGlassBar

mobile/src/features/navigation/AtlasTabBar.tsx
- Custom Expo Router tab bar

mobile/src/features/community/CommunityScreen.tsx
- 5km recent discovery feed

mobile/src/features/codex/CodexScreen.tsx
- personal codex landing

mobile/src/features/profile/ProfileScreen.tsx
- account and auth entry

mobile/src/features/auth/LoginScreen.tsx
mobile/src/features/auth/SignupScreen.tsx
- visible auth forms
```

The implementation should keep files focused. Avoid turning `MapHomeScreen.tsx` or `ui.tsx` into a general dumping ground.

## Data And Privacy Rules

- Exact coordinates stay private.
- Community cards show distance and cell-level context only.
- Contributor names are opt-in. If opt-in is false or unknown, show `익명 관찰자`.
- Media preview URLs should not be public download URLs unless backend policy explicitly allows it.
- Firebase ID token remains the source of identity. The frontend must not send `userId`.

## Implementation Scope For First Pass

Included:

- five-tab Expo Router shell
- custom glass tab bar
- glass visual tokens and reusable glass components
- home map screen adapted into tab shell
- record tab reusing existing capture flow
- codex tab with real flow state plus fallback data
- community tab with 5km sample feed and location-aware copy
- profile tab with auth state, login, and signup entry screens
- documentation updates for next session continuity

Excluded from first pass:

- real email/password Firebase provider integration
- backend community endpoint
- camera-native capture implementation
- sound recording implementation
- real public media preview URL policy
- production analytics, crash reporting, and push notification setup

## Verification

Required commands:

```bash
cd mobile
npm run typecheck
npm run test:unit
npm run expo:check
npm run start -- --host lan --clear
```

Manual Expo Go smoke test:

1. App opens on `홈`.
2. Bottom navigation shows `도감`, `홈`, `기록`, `커뮤니티`, `마이`.
3. `기록` tab opens the existing capture flow.
4. Photo picker path still reaches analysis screen.
5. `커뮤니티` shows nearby discovery cards without exact coordinates.
6. `마이` shows auth state and login/signup entry points.
7. Cloud Run health still returns `UP` from the mobile environment URL.

## Open Implementation Risks

- Expo Router tab restructuring can break current stack routes if route files are moved carelessly.
- `BlurView` rendering differs by device; fallback glass styling must still look acceptable.
- `react-native-maps` with heavy overlays and translucent panels can become visually noisy.
- Community feed is mock-first until a backend endpoint exists.
- Login/signup UI may imply real account creation; copy must clearly route operational access through the current available auth path until provider wiring is complete.

## Spec Self-Review

- Placeholder scan: no `TBD` or unresolved placeholder requirements remain.
- Scope check: first pass is one frontend shell redesign; backend community endpoint and provider auth are explicitly excluded.
- Consistency check: navigation order, route plan, visual system, and verification steps align with the approved request.
- Ambiguity check: `기록` is defined as a real tab, not a modal-only button; community location is 5 km radius with cell-level privacy.
