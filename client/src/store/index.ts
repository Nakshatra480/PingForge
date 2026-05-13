import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));

interface UIState {
  sidebarOpen: boolean;
  aiOperatorOpen: boolean;
  toggleSidebar: () => void;
  toggleAIOperator: () => void;
  setSidebarOpen: (open: boolean) => void;
  setAIOperatorOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  aiOperatorOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleAIOperator: () => set((s) => ({ aiOperatorOpen: !s.aiOperatorOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setAIOperatorOpen: (open) => set({ aiOperatorOpen: open }),
}));
