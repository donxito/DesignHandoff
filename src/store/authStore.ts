import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  getUser: async () => {
    set({ isLoading: true });
    const supabase = createClient();

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (user) {
        // Get the user profile information
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url, role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        set({
          user: {
            id: user.id,
            email: user.email,
            username: profile?.username,
            avatarUrl: profile?.avatar_url,
            role: profile?.role as "designer" | "developer" | "admin",
          },
          isLoading: false,
          error: null,
        });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: "An unknown error occurred", isLoading: false });
      }
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await get().getUser();
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: "An unknown error occurred", isLoading: false });
      }
    }
  },

  signUp: async (email, password, username, role) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    try {
      // Create the user in auth
      const {
        data: { user },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!user) throw new Error("User registration failed");

      // Create the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username,
          role,
        });

      if (profileError) throw profileError;

      // Don't automatically login after signup - they need to verify email
      set({ isLoading: false, error: null });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: "An unknown error occurred", isLoading: false });
      }
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ user: null, isLoading: false, error: null });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: "An unknown error occurred", isLoading: false });
      }
    }
  },
}));