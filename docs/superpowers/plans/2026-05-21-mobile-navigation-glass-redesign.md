# Mobile Navigation Glass Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Expo Go-ready five-tab Atlas mobile shell with iPhone-style glass UI while preserving the existing observation pipeline.

**Architecture:** Expo Router moves from a single stack landing screen to a nested tab shell under `mobile/app/(tabs)`. Reusable glass primitives live under `mobile/src/features/atlas`, while each new tab owns its screen module. The existing `ObservationFlowProvider`, `CaptureScreen`, `AnalysisScreen`, and `CellDetailScreen` remain the real recording pipeline.

**Tech Stack:** Expo Router, React Native, React Native Animated, `expo-blur`, `expo-linear-gradient`, existing REST/Firebase services.

---

### Task 1: Dependencies And Design Tokens

**Files:**
- Modify: `mobile/package.json`
- Modify: `mobile/src/theme/tokens.ts`

- [x] **Step 1: Add Expo glass dependencies**

Run:

```bash
cd mobile
npx expo install expo-blur expo-linear-gradient
```

Expected: `mobile/package.json` includes `expo-blur` and `expo-linear-gradient` with Expo 54-compatible versions.

- [x] **Step 2: Extend Atlas tokens**

Add glass and motion tokens:

```ts
export const glass = {
  surface: 'rgba(255, 255, 255, 0.68)',
  surfaceStrong: 'rgba(255, 255, 255, 0.82)',
  border: 'rgba(255, 255, 255, 0.72)',
  shadow: 'rgba(22, 63, 45, 0.18)',
  tintGreen: 'rgba(223, 241, 207, 0.68)',
  tintSky: 'rgba(205, 238, 245, 0.7)',
  tintBloom: 'rgba(255, 207, 90, 0.25)',
} as const;

export const motion = {
  panelMs: 380,
  tabMs: 320,
} as const;
```

- [x] **Step 3: Verify dependency/types**

Run:

```bash
cd mobile
npm run typecheck
```

Expected: command exits 0 after later implementation tasks are complete.

### Task 2: Glass Primitive Components

**Files:**
- Create: `mobile/src/features/atlas/glass.tsx`

- [x] **Step 1: Create glass surfaces**

Implement:

```ts
export function GradientScreen(...)
export function GlassPanel(...)
export function GlassCard(...)
export function FloatingGlassBar(...)
export function RevealView(...)
```

Rules:
- Use `BlurView` with a translucent fallback child.
- Use `LinearGradient` for soft ecological backgrounds.
- Use `Animated` opacity/translateY for `RevealView`.
- Keep all visible copy passed from screen modules.

- [x] **Step 2: Verify imports**

Run:

```bash
cd mobile
npm run typecheck
```

Expected: no missing `expo-blur` or `expo-linear-gradient` modules.

### Task 3: Expo Router Tab Shell

**Files:**
- Modify: `mobile/app/_layout.tsx`
- Create: `mobile/app/(tabs)/_layout.tsx`
- Create: `mobile/app/(tabs)/index.tsx`
- Create: `mobile/app/(tabs)/codex.tsx`
- Create: `mobile/app/(tabs)/record.tsx`
- Create: `mobile/app/(tabs)/community.tsx`
- Create: `mobile/app/(tabs)/profile.tsx`
- Modify: `mobile/app/index.tsx`
- Create: `mobile/src/features/navigation/AtlasTabBar.tsx`

- [x] **Step 1: Add tab routes**

The route files should render:

```tsx
// mobile/app/(tabs)/index.tsx
import { MapHomeScreen } from '../../src/features/map/MapHomeScreen';
export default function HomeTab() {
  return <MapHomeScreen />;
}
```

Repeat for codex, record, community, and profile screen modules.

- [x] **Step 2: Add custom glass tab bar**

`AtlasTabBar` must render labels in this order:

```text
도감 | 홈 | 기록 | 커뮤니티 | 마이
```

Use `router`-provided tab navigation props and keep `기록` visually raised.

- [x] **Step 3: Keep stack detail routes**

`analysis.tsx` and `cell.tsx` stay stack-level detail routes. Existing `router.push('/analysis')` and `router.push('/cell')` must keep working.

### Task 4: Codex Tab

**Files:**
- Create: `mobile/src/features/codex/CodexScreen.tsx`

- [x] **Step 1: Render real flow state first**

Use:

```ts
const { state } = useObservationFlow();
```

If `state.codexEntries` exists, render those. Otherwise show fallback archive cards from existing mock data.

- [x] **Step 2: Add empty/CTA state**

Add a button that routes to the record tab:

```ts
router.push('/(tabs)/record');
```

### Task 5: Community Tab

**Files:**
- Create: `mobile/src/features/community/CommunityScreen.tsx`

- [x] **Step 1: Add 5km sample feed**

Create a local sample array with no exact coordinates:

```ts
[
  { commonNameKo: '노랑나비로 추정', distanceMeters: 1240, observedAtLabel: '18분 전' },
  { commonNameKo: '개망초', distanceMeters: 860, observedAtLabel: '42분 전' },
  { commonNameKo: '직박구리', distanceMeters: 3120, observedAtLabel: '1시간 전' }
]
```

- [x] **Step 2: Request foreground location**

Use `expo-location` to show either `현재 위치 기준 5km` or a permission-needed state. Do not render exact lat/lng.

### Task 6: Profile And Auth UI Shells

**Files:**
- Create: `mobile/src/features/profile/ProfileScreen.tsx`
- Create: `mobile/src/features/auth/LoginScreen.tsx`
- Create: `mobile/src/features/auth/SignupScreen.tsx`
- Create: `mobile/app/login.tsx`
- Create: `mobile/app/signup.tsx`

- [x] **Step 1: Profile screen**

Show:
- auth status
- shortened Firebase UID
- Cloud Run API base URL status copy
- buttons to login and signup routes
- contributor visibility explanation

- [x] **Step 2: Login/signup UI**

Build forms with local `useState` only. Do not claim production email auth. The operational access path remains anonymous Firebase auth.

### Task 7: Home And Record Integration

**Files:**
- Modify: `mobile/src/features/map/MapHomeScreen.tsx`
- Create or modify: `mobile/app/(tabs)/record.tsx`
- Modify: `mobile/src/features/capture/CaptureScreen.tsx`

- [x] **Step 1: Update home CTA routes**

Home CTA should route to:

```ts
router.push('/(tabs)/record');
```

- [x] **Step 2: Keep record flow**

Record tab renders existing `CaptureScreen`, preserving media picker -> analysis flow.

### Task 8: Verification And Commit

**Files:**
- Modify: `docs/frontend_todo.md`
- Modify: `mobile/README.md`

- [x] **Step 1: Run checks**

Run:

```bash
cd mobile
npm run typecheck
npm run test:unit
npm run expo:check
git diff --check
```

Expected:
- typecheck exits 0
- unit tests pass
- expo check exits 0 or reports offline dependency map only
- diff check exits 0

- [x] **Step 2: Commit**

Commit:

```bash
git add mobile docs
git commit -m "feat: add mobile glass tab navigation"
```

Expected: working tree is clean after commit.
