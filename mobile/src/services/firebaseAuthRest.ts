import { AuthSession } from '../features/auth/types';

type AnonymousSignInResponse = {
  idToken: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
};

type EmailAuthResponse = AnonymousSignInResponse;

type IdpProviderId = 'google.com';

type IdpSignInRequest = {
  providerId: IdpProviderId;
  idToken: string;
  requestUri: string;
  nonce?: string;
};

type RefreshTokenResponse = {
  id_token: string;
  refresh_token: string;
  user_id: string;
  expires_in: string;
};

function expiresAt(expiresInSeconds: string) {
  const parsed = Number.parseInt(expiresInSeconds, 10);
  const seconds = Number.isFinite(parsed) ? parsed : 3600;
  return Date.now() + seconds * 1000;
}

async function readFirebaseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message ?? `Firebase request failed with ${response.status}`;
  } catch {
    return `Firebase request failed with ${response.status}`;
  }
}

function sessionFromIdentityResponse(body: AnonymousSignInResponse): AuthSession {
  return {
    idToken: body.idToken,
    refreshToken: body.refreshToken,
    localId: body.localId,
    expiresAt: expiresAt(body.expiresIn),
  };
}

export async function signInAnonymously(apiKey: string): Promise<AuthSession> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
    }
  );

  if (!response.ok) {
    throw new Error(await readFirebaseError(response));
  }

  const body = (await response.json()) as AnonymousSignInResponse;
  return sessionFromIdentityResponse(body);
}

export async function signInWithEmailPassword(apiKey: string, email: string, password: string): Promise<AuthSession> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  if (!response.ok) {
    throw new Error(await readFirebaseError(response));
  }

  return sessionFromIdentityResponse((await response.json()) as EmailAuthResponse);
}

export async function signUpWithEmailPassword(apiKey: string, email: string, password: string): Promise<AuthSession> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  if (!response.ok) {
    throw new Error(await readFirebaseError(response));
  }

  return sessionFromIdentityResponse((await response.json()) as EmailAuthResponse);
}

export async function signInWithIdp(apiKey: string, request: IdpSignInRequest): Promise<AuthSession> {
  const postBody = new URLSearchParams({
    id_token: request.idToken,
    providerId: request.providerId,
  });

  if (request.nonce) {
    postBody.set('nonce', request.nonce);
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postBody: postBody.toString(),
        requestUri: request.requestUri,
        returnIdpCredential: true,
        returnSecureToken: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await readFirebaseError(response));
  }

  return sessionFromIdentityResponse((await response.json()) as EmailAuthResponse);
}

export async function refreshAuthSession(apiKey: string, refreshToken: string): Promise<AuthSession> {
  const form = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    }
  );

  if (!response.ok) {
    throw new Error(await readFirebaseError(response));
  }

  const body = (await response.json()) as RefreshTokenResponse;
  return {
    idToken: body.id_token,
    refreshToken: body.refresh_token,
    localId: body.user_id,
    expiresAt: expiresAt(body.expires_in),
  };
}
