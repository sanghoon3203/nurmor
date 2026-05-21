# Atlas Mobile

Expo + React Native mobile workspace for the Atlas Habitat Bloom MVP.

## Current Scope

This app is currently a safe starter shell. It has Expo Router configured and a first screen that lists the frontend build order.

Next implementation target:

```text
Firebase anonymous sign-in -> Atlas API bearer request -> location-aware map home
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

## Commands

```bash
npm install
npm run ios
npm run android
npm run typecheck
```

## To-Do

See `../docs/frontend_todo.md`.
