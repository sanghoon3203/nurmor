# Codex View Redesign Spec

## Goal

Redesign the Atlas mobile codex tab into an illustrated two-column field guide that matches the supplied reference while keeping the existing Firestore and observation-flow data path.

## Scope

- Remove the current profile-style progress header from the codex tab.
- Keep the existing shared `AtlasTabBar` navigation.
- Add six filters: `전체`, `식물`, `동물`, `어류`, `곤충`, `기타`.
- Present entries as two-column illustrated cards with number, category mark, display name, scientific name, category badge, date/place metadata, and bookmark affordance.
- Add a soft screen reveal using existing React Native `Animated`-based `RevealView`.

## Data Rules

The backend currently stores `PLANT`, `ANIMAL`, and `OTHER`. The mobile view will derive finer UI families client-side:

- `PLANT`: Firestore/API category `PLANT`
- `FISH`: fish-related Korean/common/scientific-name keywords
- `INSECT`: insect-related Korean/common/scientific-name keywords
- `ANIMAL`: Firestore/API category `ANIMAL`, excluding fish and insects
- `OTHER`: everything else

When a filter can be served directly by Firestore (`PLANT`, broad `ANIMAL`, `OTHER`), the screen may request that category. The final UI list is always filtered client-side so fish and insect remain separate in the interface.

## Visual Direction

The screen uses Atlas `Habitat Bloom` styling: warm paper cards, moss green selected states, quiet shadows, readable Korean hierarchy, and playful but restrained biological illustration placeholders. Real entry images should be used when available; otherwise the card shows a category-specific illustrated symbol and field foliage accents.

## Verification

- Unit tests cover family inference, filter behavior, display numbering, and Firestore query category selection.
- TypeScript typecheck must pass.
- The mobile test command should include codex tests.
