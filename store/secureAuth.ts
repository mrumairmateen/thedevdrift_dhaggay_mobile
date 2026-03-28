import * as SecureStore from 'expo-secure-store';
import type { AuthUser } from './authSlice';

const KEY_ACCESS  = 'auth_access_token';
const KEY_REFRESH = 'auth_refresh_token';
const KEY_USER    = 'auth_user';

export async function saveAuthTokens(payload: {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}) {
  if (typeof payload.accessToken !== 'string' || !payload.accessToken) {
    throw new Error(
      `saveAuthTokens: accessToken must be a non-empty string, got ${typeof payload.accessToken}. ` +
      `Check that the login API response field name matches the AuthPayload type.`,
    );
  }
  if (typeof payload.refreshToken !== 'string' || !payload.refreshToken) {
    throw new Error(
      `saveAuthTokens: refreshToken must be a non-empty string, got ${typeof payload.refreshToken}. ` +
      `Check that the login API response field name matches the AuthPayload type.`,
    );
  }
  await Promise.all([
    SecureStore.setItemAsync(KEY_ACCESS,  payload.accessToken),
    SecureStore.setItemAsync(KEY_REFRESH, payload.refreshToken),
    SecureStore.setItemAsync(KEY_USER,    JSON.stringify(payload.user)),
  ]);
}

export async function clearAuthTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(KEY_ACCESS),
    SecureStore.deleteItemAsync(KEY_REFRESH),
    SecureStore.deleteItemAsync(KEY_USER),
  ]);
}

/** Returns stored credentials or null if none saved. */
export async function loadAuthTokens(): Promise<{
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
} | null> {
  const [accessToken, refreshToken, userJson] = await Promise.all([
    SecureStore.getItemAsync(KEY_ACCESS),
    SecureStore.getItemAsync(KEY_REFRESH),
    SecureStore.getItemAsync(KEY_USER),
  ]);
  if (!accessToken || !refreshToken || !userJson) return null;
  return { accessToken, refreshToken, user: JSON.parse(userJson) as AuthUser };
}
