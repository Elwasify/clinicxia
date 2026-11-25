import { create } from 'zustand';
import { User } from '../../types';
import { setAuthToken } from '../../api/client';
import { mockUsers } from '../../api/mocks/data';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  switchUser: (role: 'DOCTOR' | 'RECEPTIONIST') => void;
}

// Memory-only session management (zero persistence of credentials or patient data in localStorage)
export const useAuthStore = create<AuthState>((set) => {
  // Default to first user for seamless development/testing
  const defaultUser = mockUsers[0];
  const defaultToken = `mock-session-token-${Date.now()}`;
  setAuthToken(defaultToken);

  return {
    user: defaultUser,
    token: defaultToken,
    isAuthenticated: true,

    login: (user: User, token: string) => {
      setAuthToken(token);
      set({ user, token, isAuthenticated: true });
    },

    logout: () => {
      setAuthToken(null);
      set({ user: null, token: null, isAuthenticated: false });
    },

    switchUser: (role) => {
      const targetUser = mockUsers.find((u) => u.role === role) || mockUsers[0];
      const newToken = `mock-session-token-${Date.now()}`;
      setAuthToken(newToken);
      set({ user: targetUser, token: newToken, isAuthenticated: true });
    },
  };
});
