"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Alert } from "@/components/retroui/Alert";

// Schema for the new password
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password cannot be longer than 72 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [success, setSuccess] = useState<string | null>(null);
  const [hasResetToken, setHasResetToken] = useState(false);
  const { updateUserPassword, loading, error, clearError } = useAuthStore();
  const router = useRouter();

  // Check if the user is coming from a reset password email
  useEffect(() => {
    const checkResetToken = async () => {
      // Get auth parameters from URL
      const hash = window.location.hash;

      if (hash && hash.includes("type=recovery")) {
        setHasResetToken(true);
      } else {
        // If no token, redirect to the request reset page
        router.push("/auth/forgot-password");
      }
    };

    checkResetToken();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    clearError();
    setSuccess(null);

    try {
      const { error } = await updateUserPassword(data.password);

      if (!error) {
        setSuccess("Password updated successfully!");

        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!hasResetToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text>Checking authentication status...</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-[#121212] bg-grid-pattern">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-pink-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-yellow-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>

      {/* Form Card */}
      <Card className="w-full max-w-md overflow-hidden relative">
        <Card.Header>
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-green-500 border-3 border-black dark:border-white rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white dark:text-white text-adaptive"
              >
                <path
                  fillRule="evenodd"
                  d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.75-.75V15h1.5a.75.75 0 00.53-.22l.5-.5a.75.75 0 00.22-.53V12h.75a.75.75 0 00.53-.22l.5-.5a.75.75 0 00.22-.53V9.5a.75.75 0 00-.22-.53l-.5-.5a.75.75 0 00-.53-.22h-1.531a6.75 6.75 0 00-6.247-6.75zM12.75 15a.75.75 0 01-.53.22h-.75a.75.75 0 01-.75-.75v-3a.75.75 0 01.75-.75h.05L14.56 15h-1.81zM9 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <Card.Title className="text-center">Set New Password</Card.Title>
          <Text
            as="p"
            size="sm"
            className="text-center text-gray-600 dark:text-gray-400 mt-1"
          >
            Create a new password for your account
          </Text>
        </Card.Header>

        <Card.Content className="px-8 py-6">
          {error && (
            <Alert status="error" className="mb-6">
              <Alert.Description>{error}</Alert.Description>
            </Alert>
          )}

          {success && (
            <Alert status="success" className="mb-6">
              <Alert.Description>{success}</Alert.Description>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="password"
              type="password"
              {...register("password")}
              label="New Password"
              placeholder="••••••••"
              error={errors.password?.message}
            />

            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              label="Confirm Password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              disabled={loading || isSubmitting || !!success}
              className="w-full"
              variant="primary"
              size="lg"
            >
              {loading || isSubmitting
                ? "Updating..."
                : success
                  ? "Password Updated"
                  : "Reset Password"}
            </Button>
          </form>
        </Card.Content>

        <Card.Footer>
          <Text as="p" className="text-center w-full">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Back to login
            </Link>
          </Text>
        </Card.Footer>
      </Card>
    </div>
  );
}
