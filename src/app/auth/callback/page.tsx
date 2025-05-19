"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import { Text } from "@/components/retroui/Text";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Get the auth code from the URL
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        router.push("/auth/login");
        return;
      }

      if (data.session) {
        // Update the auth store with the new user
        setUser(data.session.user);

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        // Redirect to login if no session
        router.push("/auth/login");
      }
    };

    getSession();
  }, [router, setUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-[#121212] bg-grid-pattern">
      <div className="text-center">
        <Text
          as="h1"
          className="text-2xl font-bold mb-4 font-pixel text-black dark:text-white animate-typing"
        >
          Processing Your Login...
        </Text>
        <Text
          as="p"
          className="text-gray-600 dark:text-gray-300 animate-typing"
        >
          Please wait while we confirm your authentication.
        </Text>
        <div className="mt-6 h-1.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 animate-pulse"></div>
      </div>
    </div>
  );
}
