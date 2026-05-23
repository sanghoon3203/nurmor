# Codex Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a codex detail route from the redesigned codex grid with same-species photo aggregation.

**Architecture:** Keep list rendering in `CodexScreen`; add a pure `codexDetailViewModel` helper for matching/gallery rules; add a stack-level `CodexDetailScreen` and route file. The screen uses route params plus optional Firestore community/codex entries.

**Tech Stack:** Expo SDK 54, React Native 0.81, Expo Router, TypeScript, Node test runner.

---

### Task 1: Detail Data Rules

**Files:**
- Create: `mobile/src/features/codex/codexDetailViewModel.ts`
- Create: `mobile/src/features/codex/codexDetailViewModel.test.ts`
- Modify: `mobile/tsconfig.test.json`

- [ ] Test that exact scientific name matches same species.
- [ ] Test that unrelated animals are excluded even when category matches.
- [ ] Test that gallery order is selected/my image first, then public images, deduped.
- [ ] Implement the helper.

### Task 2: Detail Route And Navigation

**Files:**
- Create: `mobile/app/codex-detail.tsx`
- Modify: `mobile/app/_layout.tsx`
- Modify: `mobile/src/features/codex/CodexScreen.tsx`
- Create: `mobile/src/features/codex/CodexDetailScreen.tsx`

- [ ] Register the stack route.
- [ ] Navigate from codex cards with selected species params.
- [ ] Build the detail screen layout from the supplied reference.
- [ ] Load Firestore codex/community records when authenticated and use the helper to build the gallery.

### Task 3: Verification

**Files:**
- Read: `mobile/package.json`

- [ ] Run `npm run typecheck`.
- [ ] Run `npx tsc -p tsconfig.test.json`.
- [ ] Run codex-specific tests.
- [ ] Record any existing unrelated test blockers.
