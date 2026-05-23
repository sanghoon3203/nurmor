import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(resolve(projectRoot, path), 'utf8');
}

test('auth screens do not expose Apple login while Apple Developer setup is unavailable', () => {
  const login = readProjectFile('src/features/auth/LoginScreen.tsx');
  const signup = readProjectFile('src/features/auth/SignupScreen.tsx');
  const authProvider = readProjectFile('src/features/auth/AuthProvider.tsx');

  assert.equal(/Apple|apple|/.test(login), false);
  assert.equal(/Apple|apple|/.test(signup), false);
  assert.equal(/signInWithApple|appleOAuthClientId|apple\.com/.test(authProvider), false);
});

test('Apple OAuth configuration is not required by the mobile app or env template files', () => {
  const env = readProjectFile('src/config/env.ts');
  const appConfig = readProjectFile('app.json');
  const oauthProviders = readProjectFile('src/services/oauthProviders.ts');

  assert.equal(existsSync(resolve(projectRoot, '.env.example')), false);
  assert.equal(env.includes('appleOAuthClientId'), false);
  assert.equal(appConfig.includes('usesAppleSignIn'), false);
  assert.equal(oauthProviders.includes('apple.com'), false);
});
