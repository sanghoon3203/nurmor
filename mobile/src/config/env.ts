export type PublicEnv = {
  atlasApiBaseUrl: string;
  firebaseApiKey: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  googleOAuthClientId: string;
  missingKeys: string[];
};

const requiredKeys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
] as const;

type PublicEnvKey =
  | (typeof requiredKeys)[number]
  | 'EXPO_PUBLIC_ATLAS_API_BASE_URL'
  | 'EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID';

function readEnv(key: PublicEnvKey): string {
  return process.env[key]?.trim() ?? '';
}

export function getPublicEnv(): PublicEnv {
  const values = {
    atlasApiBaseUrl: readEnv('EXPO_PUBLIC_ATLAS_API_BASE_URL').replace(/\/$/, ''),
    firebaseApiKey: readEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
    firebaseProjectId: readEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    firebaseStorageBucket: readEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    googleOAuthClientId: readEnv('EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID'),
  };

  const missingKeys = requiredKeys.filter((key) => readEnv(key).length === 0);

  return {
    ...values,
    missingKeys,
  };
}

export function assertConfigured(env: PublicEnv) {
  if (env.missingKeys.length > 0) {
    throw new Error(`Missing mobile env: ${env.missingKeys.join(', ')}`);
  }
}
