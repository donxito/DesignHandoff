"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();

    try {
      // Basic validation
      if (!email.trim()) {
        throw new Error("Email is required");
      }

      // Request password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: unknown) {
      console.error("Error requesting password reset:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Login
        </Link>

        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <KeyRound size={24} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold">Reset Your Password</h1>
            <p className="mt-2 text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-md text-center mb-4">
              <p>Reset password link has been sent to your email address.</p>
              <p className="mt-2 text-sm">
                Please check your inbox and follow the instructions to reset
                your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
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

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <p>
              Remember your password?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
