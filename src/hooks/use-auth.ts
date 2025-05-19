"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";

export const useAuth = () => {
  const router = useRouter();
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
      setUser(session?.user ?? null);
      setLoading(false);
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, setLoading, setUser]);

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };
};
