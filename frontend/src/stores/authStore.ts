import { create } from 'zustand';
import { User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: (param: { credential?: string; accessToken?: string } | string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('promptit_token'),
  isLoading: true,

  login: async (usernameOrEmail, password) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }

    const { user, accessToken } = await res.json();
    localStorage.setItem('promptit_token', accessToken);
    set({ user, token: accessToken });
  },

  loginWithGoogle: async (param: { credential?: string; accessToken?: string } | string) => {
    const payload = typeof param === 'string' ? { credential: param } : param;
    const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Google login failed');
    }

    const { user, accessToken } = await res.json();
    localStorage.setItem('promptit_token', accessToken);
    set({ user, token: accessToken });
  },

  register: async (username, email, password, name) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, name }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Registration failed');
    }

    const { user, accessToken } = await res.json();
    localStorage.setItem('promptit_token', accessToken);
    set({ user, token: accessToken });
  },

  logout: () => {
    localStorage.removeItem('promptit_token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ user: null, isLoading: false });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isLoading: false });
      } else {
        localStorage.removeItem('promptit_token');
        set({ user: null, token: null, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  }
}));
