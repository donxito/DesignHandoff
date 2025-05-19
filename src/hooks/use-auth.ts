"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import { SignInData } from "@/lib/supabase/auth";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    loading,
    isAuthenticated,
    setUser,
    setLoading,
    login,
    register,
    logout,
  } = useAuthStore();

  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);

        // If we have a session, prefetch the user profile for better UX
        if (data.session?.user) {
          queryClient.prefetchQuery({
            // Include user ID in the query key to uniquely identify each user's cache entry
            queryKey: ["users", "current", data.session.user.id],
            queryFn: async () => {
              const { data: profileData, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", data.session.user.id)
                .single();

              // Throw error if Supabase query fails so React Query can handle it
              if (error) {
                console.error("Error fetching user profile:", error);
                throw error;
              }

              return profileData;
            },
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setLoading(false);

      // If user logs out, invalidate all user-related queries
      if (!newUser && event === "SIGNED_OUT") {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["designFiles"] });
      }

      // If user signs in, refresh the router
      if (newUser && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, setLoading, setUser, queryClient]);

  // Enhanced login that integrates with TanStack Query
  const enhancedLogin = async (credentials: SignInData) => {
    const result = await login(credentials);

    if (!result.error) {
      // Prefetch important user data after successful login
      queryClient.prefetchQuery({
        queryKey: ["projects"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) throw error;
          return data;
        },
        staleTime: 2 * 60 * 1000,
      });
    }

    return result;
  };

  // Enhanced logout that clears TanStack Query cache
  const enhancedLogout = async () => {
    const result = await logout();

    if (!result.error) {
      // Clear all query cache on logout
      queryClient.clear();
    }

    return result;
  };

  return {
    user,
    loading,
    isAuthenticated,
    login: enhancedLogin,
    register,
    logout: enhancedLogout,
  };
};
