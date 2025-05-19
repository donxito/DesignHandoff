import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import {
  SignInData,
  SignUpData,
  signIn,
  signOut,
  signUp,
} from "@/lib/supabase/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: SignInData) => Promise<{ error?: Error }>;
  register: (credentials: SignUpData) => Promise<{ error?: Error }>;
  logout: () => Promise<{ error?: Error }>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  // Set User
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ loading }),

  // Set Error
  setError: (error) => set({ error }),

  // Clear Error
  clearError: () => set({ error: null }),

  // Login
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await signIn(credentials);
      if (error) {
        set({ error: error.message, loading: false });
        return { error };
      }

      set({
        user: data?.user || null,
        isAuthenticated: !!data?.user,
        loading: false,
      });
      return {};
    } catch (error) {
      const err = error as Error;
      set({ error: err.message, loading: false });
      return { error: err };
    }
  },

  // Register
  register: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await signUp(credentials);
      if (error) {
        set({ error: error.message, loading: false });
        return { error };
      }

      set({
        user: data?.user || null,
        isAuthenticated: !!data?.user,
        loading: false,
      });
      return {};
    } catch (error) {
      const err = error as Error;
      set({ error: err.message, loading: false });
      return { error: err };
    }
  },

  // Logout
  logout: async () => {
    set({ loading: true });
    try {
      const { error } = await signOut();
      if (error) {
        set({ error: error.message, loading: false });
        return { error };
      }

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      return {};
    } catch (error) {
      const err = error as Error;
      set({ error: err.message, loading: false });
      return { error: err };
    }
  },
}));
