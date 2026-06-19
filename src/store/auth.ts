import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken, setUnauthorizedHandler } from '@/api/client';
import * as authApi from '@/api/auth';
import { TOKEN_KEY } from '@/utils/constants';
import type { User } from '@/types';

type Status = 'loading' | 'signedIn' | 'signedOut';

interface AuthState {
  status: Status;
  token: string | null;
  user: User | null;
  bootstrap: () => Promise<void>;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  token: null,
  user: null,

  /** Restore a persisted session on app launch. */
  bootstrap: async () => {
    // Force sign-out whenever any request returns 401.
    setUnauthorizedHandler(() => {
      void get().signOut();
    });

    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ status: 'signedOut' });
        return;
      }

      setAuthToken(token);
      const user = await authApi.me();
      set({ status: 'signedIn', token, user });
    } catch {
      setAuthToken(null);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ status: 'signedOut', token: null, user: null });
    }
  },

  signIn: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    set({ status: 'signedIn', token, user });
  },

  signOut: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network/token errors — we're clearing the session regardless.
    }
    setAuthToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ status: 'signedOut', token: null, user: null });
  },

  setUser: (user) => set({ user }),
}));
