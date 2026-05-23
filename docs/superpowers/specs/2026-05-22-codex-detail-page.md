# Codex Detail Page Spec

## Goal

Add an Atlas codex detail page that matches the supplied reference: warm paper surface, large species hero, biological facts, species description, same-species photo gallery, recorded audio panel, discovery location/date cards, and bottom actions.

## Data Rules

- A card tap opens a stack-level detail route so the shared tab navigation stays untouched.
- The detail page receives the selected codex entry through route params and can also load Firestore codex/community records when the user is authenticated.
- The photo gallery must show the selected/my image first, then other same-species public images, deduplicated by URL.
- Same-species matching prioritizes exact scientific name or `speciesKey`; Korean/common-name fallback is allowed only after removing `로 추정`/`으로 추정`.
- If there are no photos, use tasteful category-specific illustration placeholders rather than mixing unrelated species.

## Visual Direction

Use the same warm paper field-guide style as the redesigned codex list. The top half emphasizes species identity and illustration; lower sections use rounded cards for facts, explanation, photo gallery, audio, location, and date. Exact coordinates are not shown.
