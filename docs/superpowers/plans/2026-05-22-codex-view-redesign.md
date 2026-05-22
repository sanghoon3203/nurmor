# Codex View Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved illustrated two-column Atlas codex tab with six category filters and smooth entrance motion.

**Architecture:** Keep data loading in `CodexScreen`, move filter/view-model logic into a small pure helper file, and render the redesigned screen with local React Native components. Preserve Firestore and observation-flow sources.

**Tech Stack:** Expo SDK 54, React Native 0.81, Expo Router, TypeScript, Node test runner.

---

### Task 1: Codex View-Model Tests

**Files:**
- Create: `mobile/src/features/codex/codexViewModel.test.ts`
- Create: `mobile/src/features/codex/codexViewModel.ts`
- Modify: `mobile/package.json`

- [ ] Add tests for family inference, filter behavior, numbering, and remote query category.
- [ ] Run `npm run test:unit` and verify the new tests fail because the helper does not exist yet.
- [ ] Implement the helper functions.
- [ ] Run `npm run test:unit` and verify the tests pass.

### Task 2: Codex Screen Redesign

**Files:**
- Modify: `mobile/src/features/codex/CodexScreen.tsx`

- [ ] Replace the old progress-heavy codex tab with the approved field-guide layout.
- [ ] Keep `listCodexEntries`, `useObservationFlow`, and fallback sample behavior.
- [ ] Render six filters with stable counts.
- [ ] Render two-column codex cards with number, category mark, illustration area, names, category badge, date/place, and bookmark control.
- [ ] Use `RevealView` for header, filters, controls, and card entrance.

### Task 3: Verification

**Files:**
- Read: `mobile/package.json`

- [ ] Run `npm run test:unit`.
- [ ] Run `npm run typecheck`.
- [ ] If native visual verification is possible, run the Expo app and inspect the codex tab. If blocked by local simulator or dev-server constraints, record the blocker.
