# Atlas API

Atlas is a Habitat Bloom backend for a map-based ecological codex.

## Stack

- Java 21
- Spring Boot 3.5
- Spring Web
- Spring Security with Firebase ID token authentication
- Spring Data JPA
- PostgreSQL for GCP/production
- H2 for local/test bootstrap
- Firebase Authentication and Firebase Storage
- Gemini API model: `gemini-3.1-flash-lite` by default, overrideable with `GEMINI_MODEL`

## Local Run

Install JDK 21 and Maven, then run:

```bash
mvn spring-boot:run
```

The default `local` profile uses an in-memory H2 database and a stub Gemini client so frontend development can start without GCP credentials.
Local auth accepts any non-empty bearer token except `invalid`.

```bash
curl -H "Authorization: Bearer local-user" \
  "http://localhost:8080/api/habitat-cells/nearby"
```

## Firebase Auth Setup

User identity must come from Firebase Auth. Clients should never send `userId` in request bodies.
The frontend signs in with Firebase, reads the ID token, and sends it to the API:

```http
Authorization: Bearer <firebase-id-token>
```

Backend behavior:

- `local` profile: uses `LocalTokenVerifier` for fast development.
- `gcp` profile: uses Firebase Admin SDK and verifies the real Firebase ID token.
- `/actuator/health` is public.
- All other API routes require a bearer token.
- The backend derives the internal user UUID from the Firebase UID.

What you need to configure:

1. Create or select a Firebase project.
2. Enable Firebase Authentication sign-in providers, for example Google, Apple, email, or anonymous auth.
3. Create a Firebase Storage bucket for captured photo, video, and sound files.
4. Set `FIREBASE_STORAGE_BUCKET` to the bucket name.
5. For Cloud Run, prefer Application Default Credentials through the Cloud Run service account.
6. For local real-token testing, create a service account JSON file and set `FIREBASE_SERVICE_ACCOUNT_PATH`. Do not commit this file.
7. Grant the runtime service account only the permissions it needs for Firebase Auth token verification and Storage access.

## GCP Profile

Set environment variables:

```bash
export DB_JDBC_URL="jdbc:postgresql://<host>:5432/atlas?sslmode=require"
export DB_USERNAME="atlas"
export DB_PASSWORD="..."
export GEMINI_API_KEY="..."
export GEMINI_MODEL="gemini-3.1-flash-lite"
export FIREBASE_STORAGE_BUCKET="<firebase-storage-bucket>"
# Optional for local real-token testing. Prefer Cloud Run service account credentials in GCP.
export FIREBASE_SERVICE_ACCOUNT_PATH="/path/to/firebase-service-account.json"
```

`gemini-3.1-flash-lite` is the default because it is the stable Gemini 3.1 Flash-Lite model code in the Gemini API model docs. Keep `GEMINI_MODEL` configurable so preview or newer 3.1 model codes can be tested without code changes.

Run:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=gcp
```

## MVP API

- `POST /api/media/register`
- `POST /api/observations`
- `POST /api/observations/{id}/analyze`
- `GET /api/analysis-jobs/{id}`
- `POST /api/observations/{id}/plant`
- `GET /api/habitat-cells/nearby`
- `GET /api/habitat-cells/{id}`
- `GET /api/habitat-cells/{cellId}/codex`

## Product Flow

1. Register uploaded media metadata.
2. Create an `ObservationRecord` with exact coordinates.
3. Resolve coordinates into a `HabitatCell`.
4. Analyze with Gemini.
5. Return species candidates for user review.
6. Plant the chosen candidate into the cell.
7. Update `CodexEntry` and the cell bloom score.

## Project Tracking

- Backend architecture and connection guide: `docs/backend_architecture_and_connection.md`
- Current completion status and project-wide to-do: `docs/project_status_and_todo.md`
- Mobile frontend implementation checklist: `docs/frontend_todo.md`
- Frontend design guidance for future UI work: `skills/frontend.md`
- Mobile app workspace: `mobile/`
