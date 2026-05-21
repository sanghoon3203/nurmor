# Atlas Mobile

Expo + React Native mobile workspace for the Atlas Habitat Bloom MVP.

## Current Scope

This app now has the first connected mobile shell:

- Firebase anonymous sign-in through Firebase Auth REST API
- Firebase ID token persistence and refresh
- Atlas API health request
- Authenticated nearby HabitatCell request
- Foreground location permission
- Map home with user location, cell polygons, cell markers, and cell summary panel

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
photo picker -> Firebase Storage upload -> media register -> observation create
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

## Commands

```bash
npm install
npm run ios
npm run android
npm run typecheck
npm run expo:check
```

## To-Do

See `../docs/frontend_todo.md`.
