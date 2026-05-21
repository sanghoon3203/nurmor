export type AuthSession = {
  idToken: string;
  refreshToken: string;
  localId: string;
  expiresAt: number;
};

export type AuthStatus = 'loading' | 'authenticated' | 'missing-config' | 'error';
