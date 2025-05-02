"use client";

import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { AuthState } from "@/types/auth";


export const useAuthStore = create(
  devtools(
    persist<AuthState>(
      (set, get) => ({
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

          console.log('[getUser] Supabase user:', user);
          if (error) {
            console.error('[getUser] Auth error:', error);
            throw error;
          }

          if (!user || !user.id) {
            console.warn('[getUser] No user or user.id found.');
            set({ user: null, isLoading: false });
            return;
          }

          // Try to get the user profile information
          let { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username, full_name, avatar_url, role", { head: false })
            .eq("id", user.id)
            .single();

          console.log('[getUser] Profile data:', profile);
          if (profileError && profileError.code === 'PGRST116') {
            // No profile found, auto-create it
            console.warn('[getUser] No profile found, creating new profile for user:', user.id);
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                username: user.email?.split("@")[0] || "user",
                full_name: user.email || null,
                avatar_url: null,
                role: "developer", // default role, adjust as needed
              });
            if (insertError) {
              console.error('[getUser] Failed to auto-create profile:', insertError);
              set({ error: insertError.message, isLoading: false });
              return;
            }
            // Re-fetch the profile
            ({ data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("username, full_name, avatar_url, role", { head: false })
              .eq("id", user.id)
              .single());
            console.log('[getUser] Profile data after insert:', profile);
          }

          if (profileError) {
            console.error('[getUser] Profile error:', profileError);
            throw profileError;
          }

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
        } catch (error: unknown) {
          if (error instanceof Error) {
            set({ error: error.message, isLoading: false });
            console.error('[getUser] Unknown error:', error.message);
          } else {
            set({ error: "An unknown error occurred", isLoading: false });
            console.error('[getUser] Unknown error:', error);
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
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isLoading: false,
        error: null,
        signIn: async () => {},
        signUp: async () => {},
        signOut: async () => {},
        getUser: async () => {},
      }),
        storage: createJSONStorage(() => localStorage),
      }
    ),
    {
      name: "AuthStore",
      enabled: process.env.NODE_ENV === "development", 
    }
  )
);