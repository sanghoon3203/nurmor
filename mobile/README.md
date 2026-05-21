# Atlas Mobile

Expo + React Native mobile workspace for the Atlas Habitat Bloom MVP.

## Current Scope

This app now has the first connected mobile shell:

- Firebase anonymous sign-in through Firebase Auth REST API
- Firebase ID token persistence and refresh
- Five-tab Expo Router shell: `도감`, `홈`, `기록`, `커뮤니티`, `마이`
- Bright glassmorphism UI primitives using pure React Native translucent surfaces
- Atlas API health request
- Authenticated nearby HabitatCell request
- Foreground location permission
- Map home with user location, cell polygons, cell markers, and cell summary panel
- Community preview feed for recent nearby discoveries within 5 km
- Login and signup UI shells, with anonymous Firebase auth still serving as the operational MVP path
- Photo/video picker to Firebase Storage upload
- MediaAsset registration and ObservationRecord creation
- Analysis request with polling, multi-candidate review, selected candidate planting, and cell codex fetch

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
native blur/gradient pass -> camera capture -> upload progress percentage -> real-device Firebase/Cloud SQL/Gemini smoke test
```

## Environment

Create `mobile/.env` from `mobile/.env.example`.

```bash
cp .env.example .env
```

Required values:

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=http://127.0.0.1:18081
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-web-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
```

Use your machine LAN IP instead of `127.0.0.1` when testing from a physical phone.
Anonymous sign-in must be enabled in Firebase Authentication.
When using the deployed Cloud Run backend, set:

```env
EXPO_PUBLIC_ATLAS_API_BASE_URL=https://atlas-api-ngaj2pc2na-du.a.run.app
```

## Firebase Storage Rules

For the current mobile upload path, Storage rules should allow authenticated users to write only under their own uid:

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/observations/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

The app uploads to:

```text
users/{firebaseUid}/observations/{timestamp}-{filename}
```

The Atlas backend stores the returned object as a private `storageKey`, not as a public download URL.

## Commands

```bash
npm install
npm run ios
npm run android
npm run typecheck
npm run test:unit
npm run expo:check
```

## To-Do

See `../docs/frontend_todo.md`.
