"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import { Text } from "@/components/retroui/Text";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL to check for tokens in hash
        const currentUrl = window.location.href;

        // Check if we have tokens in the URL hash (OAuth flow)
        if (currentUrl.includes("#access_token=")) {
          // Let Supabase handle the tokens from the URL
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error("Error processing OAuth tokens:", error);
            setErrorMessage(error.message);
            setStatus("error");
            // Wait a bit before redirecting to show error
            setTimeout(() => router.push("/auth/login"), 3000);
            return;
          }

          if (data.session) {
            setUser(data.session.user);
            setStatus("success");
            // Short delay to show success message
            setTimeout(() => router.push("/dashboard"), 1000);
            return;
          }
        }

        // Fallback: check for existing session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setErrorMessage(error.message);
          setStatus("error");
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        if (data.session) {
          setUser(data.session.user);
          setStatus("success");
          setTimeout(() => router.push("/dashboard"), 1000);
        } else {
          setErrorMessage("No authentication session found");
          setStatus("error");
          setTimeout(() => router.push("/auth/login"), 2000);
        }
      } catch (error) {
        console.error("Unexpected error in auth callback:", error);
        setErrorMessage("An unexpected error occurred during authentication");
        setStatus("error");
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    };

    handleAuthCallback();
  }, [router, setUser]);

  const getStatusMessage = () => {
    switch (status) {
      case "processing":
        return {
          title: "Processing Your Login...",
          description: "Please wait while we confirm your authentication.",
          color: "text-blue-600 dark:text-blue-400",
        };
      case "success":
        return {
          title: "Authentication Successful!",
          description: "Redirecting you to your dashboard...",
          color: "text-green-600 dark:text-green-400",
        };
      case "error":
        return {
          title: "Authentication Error",
          description:
            errorMessage || "Something went wrong. Redirecting to login...",
          color: "text-red-600 dark:text-red-400",
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-[#121212] bg-grid-pattern">
      <div className="text-center max-w-md">
        <Text
          as="h1"
          className={`text-2xl font-bold mb-4 font-pixel ${statusInfo.color} animate-typing`}
        >
          {statusInfo.title}
        </Text>
        <Text
          as="p"
          className="text-gray-600 dark:text-gray-300 animate-typing mb-6"
        >
          {statusInfo.description}
        </Text>

        {/* Loading indicator */}
        {status === "processing" && (
          <div className="mt-6 h-1.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 animate-pulse rounded-full"></div>
        )}

        {/* Success indicator */}
        {status === "success" && (
          <div className="mt-6 h-1.5 bg-green-500 rounded-full"></div>
        )}

        {/* Error indicator */}
        {status === "error" && (
          <div className="mt-6 h-1.5 bg-red-500 rounded-full"></div>
        )}
      </div>
    </div>
  );
}
