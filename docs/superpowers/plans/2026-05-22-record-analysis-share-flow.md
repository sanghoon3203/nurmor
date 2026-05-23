# Record Analysis Share Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign record capture and analysis/share flow while preserving the existing Firebase upload and planting pipeline.

**Architecture:** Add a small pure helper for share options; keep capture state inside `CaptureScreen`; keep analysis state inside `AnalysisScreen`; continue using `ObservationFlowProvider` for upload, analysis, and planting.

**Tech Stack:** Expo SDK 54, React Native 0.81, Expo Router, TypeScript, Node test runner.

---

### Task 1: Share Option Rules

**Files:**
- Create: `mobile/src/features/capture/recordFlowViewModel.ts`
- Create: `mobile/src/features/capture/recordFlowViewModel.test.ts`
- Modify: `mobile/tsconfig.test.json`

- [ ] Test the three share options map to `PRIVATE`, `CELL`, and `PUBLIC`.
- [ ] Test the default share option is `CELL`.
- [ ] Implement the helper.

### Task 2: Record Screen Redesign

**Files:**
- Modify: `mobile/src/features/capture/CaptureScreen.tsx`

- [ ] Build the `탐색` header and two mode cards.
- [ ] Make photo mode functional through existing media picker.
- [ ] Show a camera-style preview with focus corners and selected image preview.
- [ ] Keep album and capture buttons functional with existing `pickMedia`.

### Task 3: Photo Judgment And Share

**Files:**
- Modify: `mobile/src/features/analysis/AnalysisScreen.tsx`

- [ ] Show selected photo from `flow.state.media.uri`.
- [ ] Redesign candidate judgment card around confidence, evidence, and candidate picker.
- [ ] Add share options and pass selected visibility to `plantCandidate`.
- [ ] Keep retry/back flow.

### Task 4: Verification

**Files:**
- Read: `mobile/package.json`

- [ ] Run `npm run typecheck`.
- [ ] Run `npx tsc -p tsconfig.test.json`.
- [ ] Run focused capture tests.
- [ ] Run `npm run test:unit` and record any unrelated blockers.
