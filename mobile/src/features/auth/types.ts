export type AuthSession = {
  idToken: string;
  refreshToken: string;
  localId: string;
  expiresAt: number;
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'missing-config' | 'error';
