# Atlas Mobile

Expo + React Native mobile workspace for the Atlas Habitat Bloom MVP.

## Current Scope

This app now has the first connected mobile shell:

- Firebase anonymous sign-in through Firebase Auth REST API
- Firebase ID token persistence and refresh
- Initial launch gate with logo dissolve and staggered leaf-curtain routing
- Five-tab Expo Router shell: `도감`, `홈`, `기록`, `커뮤니티`, `마이`
- Bright glassmorphism UI primitives using pure React Native translucent surfaces
- Firebase-only MVP data path through Firestore REST
- Authenticated nearby HabitatCell request with current location and 5km radius
- Foreground location permission
- Map home with user location, cell polygons, cell markers, and cell summary panel
- Dex category filters backed by Firestore `codexEntries`
- Profile read/create backed by Firestore `users/{uid}`
- Community feed backed by Firestore `communityDiscoveries` with preview fallback
- Login and signup UI shells, with anonymous Firebase auth available through the explicit browse/login action
- Photo/video picker to Firebase Storage upload
- Firebase-only record planting path writing Firestore `observations`, `codexEntries`, `communityDiscoveries`, `habitatCells`, and profile stats
- Spring API/Gemini flow is paused while the Firebase-only MVP is active

## Native App Identity

Atlas is an Expo native mobile app. EAS/native builds will use these app identifiers:

```text
iOS bundle ID: com.team3.atlas
Android package name: com.team3.atlas
```

Create both apps in Firebase Console with those exact identifiers:

```text
Firebase Console -> Project settings -> Your apps -> iOS+
Firebase Console -> Project settings -> Your apps -> Android
```

The current implementation signs in through Firebase Auth REST, so it still needs the Firebase Web client config in `mobile/.env`. Native Firebase config files are not required for the current REST-auth path. If we later switch to native Firebase SDKs or add Analytics/Crashlytics, then we should add:

```text
GoogleService-Info.plist
google-services.json
```

and wire them into the Expo native build config.

Next implementation target:

```text
real-device Firebase smoke test -> email/social auth -> replace placeholder candidate with backend Gemini analysis
```

## Environment

Create `mobile/.env` from `mobile/.env.example`.

```bash
cp .env.example .env
```

Required values:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-web-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
```

Use your machine LAN IP instead of `127.0.0.1` when testing from a physical phone.
Anonymous sign-in must be enabled in Firebase Authentication for the current browse/login action.
The Spring/Gemini backend is optional during the Firebase-only MVP. If it is running again, set:

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://your-backend-host
```

See `../docs/firebase_only_mvp.md` for Firestore collections and security rules.

## Firebase Storage Rules

Rules are now checked into the repo:

```text
../storage.rules
../firestore.rules
../firebase.json
```

Deploy with Firebase CLI:

```bash
firebase use atlas-dex
firebase deploy --only firestore:rules,storage
```

The app uploads to:

```text
users/{firebaseUid}/observations/{timestamp}-{filename}
```

The Atlas backend stores the returned object as a private `storageKey`, not as a public download URL.

## Commands

```bash
npm ci --legacy-peer-deps
npm run ios
npm run android
npm run typecheck
npm run test:unit
npm run expo:check
```

## To-Do

See `../docs/frontend_todo.md`.
