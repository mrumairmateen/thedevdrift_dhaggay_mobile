import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { useAppDispatch } from '@store/index';
import { clearCredentials } from '@store/authSlice';
import { clearAuthTokens } from '@store/secureAuth';

/**
 * Returns a stable sign-out handler that:
 * 1. Clears Redux auth state
 * 2. Wipes SecureStore tokens (prevents auto-login on next launch)
 * 3. Navigates directly to the home/shop page
 */
export function useSignOut(): () => void {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useCallback(() => {
    void (async () => {
      dispatch(clearCredentials());
      await clearAuthTokens();
      router.replace('/(tabs)' as never);
    })();
  }, [dispatch, router]);
}
