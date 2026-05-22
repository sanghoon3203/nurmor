import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { assertConfigured, getPublicEnv } from '../../config/env';
import { refreshAuthSession, signInAnonymously } from '../../services/firebaseAuthRest';
import { AuthSession, AuthStatus } from './types';

type AuthContextValue = {
  session: AuthSession | null;
  status: AuthStatus;
  errorMessage: string | null;
  missingKeys: string[];
  signIn: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const storageKey = 'atlas.auth.session.v1';
const refreshWindowMs = 60 * 1000;

function isFresh(session: AuthSession) {
  return session.expiresAt - Date.now() > refreshWindowMs;
}

async function readStoredSession() {
  const raw = await AsyncStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    await AsyncStorage.removeItem(storageKey);
    return null;
  }
}

async function storeSession(session: AuthSession) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(session));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const env = useMemo(() => getPublicEnv(), []);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    try {
      assertConfigured(env);
      setStatus('loading');
      setErrorMessage(null);

      const nextSession = await signInAnonymously(env.firebaseApiKey);
      await storeSession(nextSession);
      setSession(nextSession);
      setStatus('authenticated');
    } catch (error) {
      setSession(null);
      setStatus(env.missingKeys.length > 0 ? 'missing-config' : 'error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sign in');
    }
  }, [env]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (env.missingKeys.length > 0) {
        setStatus('missing-config');
        return;
      }

      try {
        const storedSession = await readStoredSession();
        if (storedSession && isFresh(storedSession)) {
          if (!isMounted) {
            return;
          }
          setSession(storedSession);
          setStatus('authenticated');
          return;
        }

        if (storedSession?.refreshToken) {
          const refreshed = await refreshAuthSession(env.firebaseApiKey, storedSession.refreshToken);
          await storeSession(refreshed);
          if (!isMounted) {
            return;
          }
          setSession(refreshed);
          setStatus('authenticated');
          return;
        }

        if (!isMounted) {
          return;
        }
        setSession(null);
        setStatus('unauthenticated');
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize auth');
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [env]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status,
      errorMessage,
      missingKeys: env.missingKeys,
      signIn,
    }),
    [env.missingKeys, errorMessage, session, signIn, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
