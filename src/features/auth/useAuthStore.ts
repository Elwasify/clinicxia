import { create } from 'zustand';
import { User } from '../../types';
import { setAuthToken } from '../../api/client';
import { useToastStore } from '../../components/ui/Toast';

let clearServerCache = () => {};

export function registerAuthCacheCleanup(cleanup: () => void) {
  clearServerCache = cleanup;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const clearSensitiveState = () => {
  clearServerCache();
  useToastStore.getState().clear();
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    if (get().user?.id !== user.id) clearSensitiveState();
    setAuthToken(token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    setAuthToken(null);
    clearSensitiveState();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
