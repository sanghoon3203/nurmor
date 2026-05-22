# Firebase-Only MVP Plan

## Why This Path

Cloud SQL and Cloud Run are paused because the current GCP billing limit blocks paid resources. The MVP should keep moving on Firebase Spark/free-tier services:

- Firebase Authentication for login/session.
- Firebase Storage for private observation media.
- Cloud Firestore for map cells, 도감, profile, and community feed.
- Expo Go for mobile validation.

The Spring Boot backend remains in the repository as the future Gemini/secure aggregation server, but mobile screens should not depend on it during the Firebase-only MVP phase.

## Mobile Environment

Required in `mobile/.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=atlas-dex.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=atlas-dex
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=atlas-dex.firebasestorage.app
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Optional:

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=
```

Use `EXPO_PUBLIC_ATLAS_API_BASE_URL` only when the Spring/Gemini backend is running again.

## Firestore Collections

### `users/{uid}`

Used by `마이` view.

```ts
{
  uid: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  reportCount: number;
  speciesCount: number;
  achievementCount: number;
  publicContributor: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### `habitatCells/{cellKey}`

Used by map overlay.

```ts
{
  cellKey: string;
  centerLat: number;
  centerLng: number;
  bloomState: 'UNOBSERVED' | 'VISITED' | 'SEEDED' | 'GROWING' | 'BLOOMED';
  bloomScore: number;
  observationCount: number;
  speciesCount: number;
  contributorCount: number;
  updatedAt: string;
}
```

### `codexEntries/{entryId}`

Used by `도감` view and category filters.

```ts
{
  userId: string;
  habitatCellId: string;
  cellKey: string;
  speciesKey: string;
  displayName: string;
  scientificName: string | null;
  category: 'PLANT' | 'ANIMAL' | 'OTHER';
  imageUrl: string | null;
  discoveryNumber: number;
  observationCount: number;
  bestConfidence: number;
  createdAt: string;
  updatedAt: string;
}
```

### `communityDiscoveries/{discoveryId}`

Used by the 5km community feed.

```ts
{
  observationId: string;
  cellKey: string;
  userId: string;
  contributorName: string;
  displayName: string;
  scientificName: string | null;
  category: 'PLANT' | 'ANIMAL' | 'OTHER';
  imageUrl: string | null;
  publicLat: number;
  publicLng: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}
```

Subcollections:

- `communityDiscoveries/{discoveryId}/comments/{commentId}`
- `communityDiscoveries/{discoveryId}/likes/{uid}`

## Current Mobile Connections

- `MapHomeScreen` reads `habitatCells` through Firestore REST and filters cells within 5km on the client.
- `CodexScreen` reads `codexEntries` and applies `전체/식물/동물/기타` filters.
- `ProfileScreen` reads or creates `users/{uid}`.
- `CommunityScreen` reads `communityDiscoveries` and filters public cell locations within 5km.
- `ObservationFlowProvider` uploads media to Firebase Storage, writes a private Firestore `observations` draft, shows a Firebase-only review candidate, and plants the selected candidate into `codexEntries`, `communityDiscoveries`, `habitatCells`, and `users/{uid}` stats.

Client-side radius filtering is acceptable for the MVP dataset size. If data grows, move this to geohash queries or the Spring backend.

## Record Planting Flow

1. User selects photo/video in the `기록` tab.
2. App requests foreground location.
3. App uploads the original file to Firebase Storage under `users/{uid}/observations/...`.
4. App creates `observations/{observationId}` in Firestore with exact coordinates private and public coordinates snapped to the habitat cell center.
5. App shows a `Firebase-only MVP` candidate in the analysis screen. This is intentionally not a real Gemini species identification.
6. User taps `지도에 심기`.
7. App updates:
   - `observations/{observationId}` to `PLANTED`.
   - `codexEntries/{codexId}` with selected candidate metadata.
   - `communityDiscoveries/{observationId}` when visibility is `CELL` or `PUBLIC`.
   - `habitatCells/{cellKey}` bloom aggregate.
   - `users/{uid}` report/species stats.

Gemini 3.1 Flash should be restored through the Spring backend later. The mobile app should not call Gemini directly because API keys and abuse controls must remain server-side.

## Security Rules

Rules are stored at:

- `firestore.rules`
- `storage.rules`
- `firebase.json`

Deploy when Firebase CLI is installed and logged in:

```bash
firebase use atlas-dex
firebase deploy --only firestore:rules,storage
```

The current rules intentionally allow public reads for `habitatCells`, `codexEntries`, and `communityDiscoveries` because those documents must power the public map/community surfaces. Exact private coordinates remain in `observations` and should only be readable by the owner.

## Remaining Work

- Replace REST Firestore calls with native Firebase SDK if Expo native build needs offline cache/listeners.
- Seed Firestore with initial `habitatCells` documents for Seoul test areas.
- Replace the Firebase-only placeholder candidate with server-backed Gemini 3.1 Flash analysis when the backend can run again.
- Add email/Google/Apple auth providers instead of anonymous-only login.
- Add likes/comments writes after the community UI is finalized.
- Restore Spring backend later for Gemini 3.1 Flash analysis, trusted aggregation, rate limiting, and abuse controls.
