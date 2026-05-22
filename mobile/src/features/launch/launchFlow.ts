import { AuthStatus } from '../auth/types';

export type LaunchRoute = '/(tabs)' | '/login';

export function resolveLaunchRoute(status: AuthStatus): LaunchRoute | null {
  if (status === 'loading') {
    return null;
  }
  if (status === 'authenticated') {
    return '/(tabs)';
  }
  return '/login';
}
