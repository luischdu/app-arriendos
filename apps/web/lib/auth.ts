import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'admin' | 'manager' | 'viewer' | 'renter';
  tenantId: string;
  tenantName: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(email, password);
          Cookies.set('access_token', data.accessToken, {
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
          });
          set({ user: data.user });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          Cookies.remove('access_token');
          set({ user: null });
          window.location.href = '/login';
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.me();
          set({ user: data });
        } catch {
          Cookies.remove('access_token');
          set({ user: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
