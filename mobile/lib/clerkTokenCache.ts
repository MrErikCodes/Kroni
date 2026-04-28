// Clerk session persistence backed by expo-secure-store. Without this, a
// signed-in parent loses their session on every app reload because the
// default Clerk in-memory cache is wiped. SecureStore puts the token in
// the OS keychain (iOS Keychain / Android EncryptedSharedPreferences).

import * as SecureStore from 'expo-secure-store';

interface TokenCache {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, value: string) => Promise<void>;
}

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch {
      // SecureStore can fail in rare emulator states; fall through and let
      // Clerk treat it as no-token.
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Same: surface as a missing-token rather than crashing the auth flow.
    }
  },
};
