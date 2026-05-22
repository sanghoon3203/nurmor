import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import {
  signInWithEmailPassword,
  signInWithIdp,
  signUpWithEmailPassword,
} from './firebaseAuthRest';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFirebaseResponse(assertRequest: (url: string, init: RequestInit) => void) {
  globalThis.fetch = (async (url, init) => {
    assertRequest(String(url), init ?? {});
    return new Response(
      JSON.stringify({
        idToken: 'firebase-id-token',
        refreshToken: 'firebase-refresh-token',
        localId: 'firebase-user',
        expiresIn: '3600',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as typeof fetch;
}

test('signInWithEmailPassword calls Firebase password endpoint and returns an auth session', async () => {
  mockFirebaseResponse((url, init) => {
    assert.equal(url, 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=api-key');
    assert.equal(init.method, 'POST');
    assert.deepEqual(JSON.parse(String(init.body)), {
      email: 'leaf@example.com',
      password: 'secret',
      returnSecureToken: true,
    });
  });

  const session = await signInWithEmailPassword('api-key', 'leaf@example.com', 'secret');

  assert.equal(session.idToken, 'firebase-id-token');
  assert.equal(session.refreshToken, 'firebase-refresh-token');
  assert.equal(session.localId, 'firebase-user');
});

test('signUpWithEmailPassword calls Firebase email signup endpoint', async () => {
  mockFirebaseResponse((url, init) => {
    assert.equal(url, 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=api-key');
    assert.deepEqual(JSON.parse(String(init.body)), {
      email: 'new@example.com',
      password: 'secret',
      returnSecureToken: true,
    });
  });

  const session = await signUpWithEmailPassword('api-key', 'new@example.com', 'secret');

  assert.equal(session.localId, 'firebase-user');
});

test('signInWithIdp exchanges Google id tokens through Firebase Auth', async () => {
  mockFirebaseResponse((url, init) => {
    assert.equal(url, 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=api-key');
    assert.deepEqual(JSON.parse(String(init.body)), {
      postBody: 'id_token=provider-id-token&providerId=google.com&nonce=raw-nonce',
      requestUri: 'atlas://oauth',
      returnIdpCredential: true,
      returnSecureToken: true,
    });
  });

  const session = await signInWithIdp('api-key', {
    providerId: 'google.com',
    idToken: 'provider-id-token',
    requestUri: 'atlas://oauth',
    nonce: 'raw-nonce',
  });

  assert.equal(session.idToken, 'firebase-id-token');
});
