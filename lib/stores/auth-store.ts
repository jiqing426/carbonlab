import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  autoSelectFirstApp: boolean;
  token: string | null;
}

export const useAuthStore = create<AuthState>(() => ({
  isAuthenticated: false,
  autoSelectFirstApp: false,
  token: null,
}));
