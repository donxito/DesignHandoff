"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<string>("developer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, signUp } = useAuthStore();
  const supabase = createClient();

  // Get redirect path from URL if present
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "login") {
        await signIn(email, password);
        router.push(redirectPath);
      } else {
        await signUp(email, password, username, role);
        // Show success message but don't redirect yet since they need to verify email
        setSuccess(
          "Please check your email to confirm your account before logging in."
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${
            window.location.origin
          }/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to sign in with Google");
      } else {
        setError("An unknown error occurred");
      }
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${
            window.location.origin
          }/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to sign in with GitHub");
      } else {
        setError("An unknown error occurred");
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 p-8 bg-white shadow-lg rounded-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-gray-500">
          {mode === "login"
            ? "Enter your credentials to access your account"
            : "Fill in the form below to create your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            {mode === "login" && (
              <Link
                href="/reset-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {mode === "register" && (
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="designer">Designer</option>
              <option value="developer">Developer</option>
            </select>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Loading..."
            : mode === "login"
            ? "Sign In"
            : "Create Account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleGithubSignIn}
          disabled={loading}
        >
          <FaGithub className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>

      <div className="text-center text-sm">
        {mode === "login" ? (
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
