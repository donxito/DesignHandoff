"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/lib/supabase/client";

type ProtectedRouteProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

// * Client-side authentication wrapper that ensures users are logged in
export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { loading, isAuthenticated, setUser, setLoading } = useAuthStore();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // * Check authentication status on mount and refresh if needed
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        // Double-check session directly with Supabase to ensure we have latest state
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth check error:", error);
          setUser(null);
          router.replace("/auth/login");
          return;
        }

        // Update auth store with current session state
        setUser(data.session?.user ?? null);

        // Only redirect if we're certain there's no session
        if (!data.session) {
          console.log("No session found, redirecting to login");
          router.replace("/auth/login");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session && event === "SIGNED_OUT") {
        router.replace("/auth/login");
      }
    });

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [router, setUser, setLoading]);

  // * Show loading state while checking auth
  if (loading || isCheckingAuth) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 max-w-sm w-full">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated after checking, don't render anything (redirect is in progress)
  if (!isAuthenticated) {
    return null;
  }

  // * Render children once authenticated
  return <>{children}</>;
}
