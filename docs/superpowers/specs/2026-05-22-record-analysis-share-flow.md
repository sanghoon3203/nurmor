# Record Analysis Share Flow Spec

## Goal

Redesign the Atlas record tab into the supplied `탐색` camera-style screen and extend the flow through photo-based judgment and sharing/privacy selection.

## Scope

- Replace the current record tab layout with a camera exploration screen inspired by the provided image.
- Keep Expo Go compatibility by using the existing media picker as the functional capture path.
- Show the selected photo in the analysis/judgment screen with AI candidate, confidence, evidence, and selected species controls.
- Add share/privacy choices before planting:
  - `나만 보관`: `PRIVATE`
  - `셀 도감 공유`: `CELL`
  - `커뮤니티 공유`: `PUBLIC`
- Keep exact coordinates private. Sharing only affects cell/community visibility.

## Data Notes

The current Storage upload returns a `firebase://` storage key, not a public image URL. The analysis screen can show the local selected photo during the current session through `flow.state.media.uri`. Persisted public gallery images still need a later Storage download URL/token path.

## Visual Direction

Use the same warm white paper background, moss green primary controls, rounded camera preview, corner focus marks, album button, large capture button, and tab navigation from the concept. Analysis should feel like a continuation: selected photo on top, judgment card below, then share options.
