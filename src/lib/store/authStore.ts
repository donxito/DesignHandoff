import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import {
  SignInData,
  SignUpData,
  Provider,
  signIn,
  signOut,
  signUp,
  signInWithProvider,
  resetPassword,
  updatePassword,
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
  loginWithProvider: (provider: Provider) => Promise<{ error?: Error }>;
  requestPasswordReset: (email: string) => Promise<{ error?: Error }>;
  updateUserPassword: (newPassword: string) => Promise<{ error?: Error }>;
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
      // Sign out from Supabase
      const { error } = await signOut();

      // Always clear the local state, even if there's an error
      // This ensures the UI shows as logged out
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });

      if (error) {
        console.warn("Logout warning:", error.message);
        // Don't treat as fatal error since we've already cleared local state
        return { error };
      }

      return {};
    } catch (error) {
      const err = error as Error;
      console.error("Logout error:", err.message);

      // Still clear local state to ensure UI consistency
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: err.message,
      });

      return { error: err };
    }
  },

  // social login
  loginWithProvider: async (provider) => {
    set({ loading: true, error: null });
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        set({ error: error.message, loading: false });
        return { error };
      }

      set({ loading: false });
      return {};
    } catch (error) {
      const err = error as Error;
      set({ error: err.message, loading: false });
      return { error: err };
    }
  },

  // Password reset request
  requestPasswordReset: async (email) => {
    set({ loading: true, error: null });
    try {
      const { error } = await resetPassword(email);
      if (error) {
        set({ error: error.message, loading: false });
        return { error };
      }

      set({ loading: false });
      return {};
    } catch (error) {
      const err = error as Error;
      set({ error: err.message, loading: false });
      return { error: err };
    }
  },

  // Update password
  updateUserPassword: async (newPassword) => {
    set({ loading: true, error: null });
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        set({ error: error.message, loading: false });
        return { error };
      }

      set({ loading: false });
      return {};
    } catch (error) {
      const err = error as Error;
      set({ error: err.message, loading: false });
      return { error: err };
    }
  },
}));
