"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import { Text } from "@/components/retroui/Text";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have tokens in the URL hash (OAuth flow)
        // Use the current window location for hash-based tokens
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const hasHashTokens = hashParams.has("access_token");

        // Check if we have search params (email confirmation, password reset)
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          console.error("Auth error:", error, errorDescription);
          setStatus("error");
          setErrorMessage(errorDescription || error);
          return;
        }

        let session = null;

        if (hasHashTokens || code) {
          // Exchange the code for a session
          const { data, error: authError } = await supabase.auth.getSession();

          if (authError) {
            console.error("Session error:", authError);
            setStatus("error");
            setErrorMessage(authError.message);
            return;
          }

          session = data.session;
        } else {
          // Check for existing session
          const { data } = await supabase.auth.getSession();
          session = data.session;
        }

        if (session?.user) {
          console.log("User authenticated successfully");
          setUser(session.user);
          setStatus("success");

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          setStatus("error");
          setErrorMessage("No valid session found");
        }
      } catch (error) {
        console.error("Callback error:", error);
        setStatus("error");
        setErrorMessage("Authentication failed");
      }
    };

    handleAuthCallback();
  }, [searchParams, setUser, router]);

  const getStatusDisplay = () => {
    switch (status) {
      case "processing":
        return (
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <Text as="h2" className="font-pixel text-xl mb-2">
              Completing authentication...
            </Text>
            <Text as="p" className="text-gray-600 dark:text-gray-400">
              Please wait while we process your login
            </Text>
          </div>
        );
      case "success":
        return (
          <div className="text-center">
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-sm">✓</span>
            </div>
            <Text as="h2" className="font-pixel text-xl mb-2 text-green-600">
              Authentication successful!
            </Text>
            <Text as="p" className="text-gray-600 dark:text-gray-400">
              Redirecting to your dashboard...
            </Text>
          </div>
        );
      case "error":
        return (
          <div className="text-center">
            <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-sm">✗</span>
            </div>
            <Text as="h2" className="font-pixel text-xl mb-2 text-red-600">
              Authentication failed
            </Text>
            <Text as="p" className="text-gray-600 dark:text-gray-400 mb-4">
              {errorMessage}
            </Text>
            <button
              onClick={() => router.push("/auth/login")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try again
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 bg-grid-pattern flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg border-2 border-black dark:border-white p-8">
        {getStatusDisplay()}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-gray-900 bg-grid-pattern flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg border-2 border-black dark:border-white p-8">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <Text as="h2" className="font-pixel text-xl mb-2">
                Loading...
              </Text>
            </div>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
