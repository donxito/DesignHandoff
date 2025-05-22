"use client";

import { useState } from "react";
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

// Schema for the reset password form
const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function RequestResetForm() {
  const [success, setSuccess] = useState<string | null>(null);
  const { requestPasswordReset, loading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetFormData) => {
    clearError();
    setSuccess(null);

    try {
      const { error } = await requestPasswordReset(data.email);

      if (!error) {
        setSuccess(
          "Password reset link sent! Please check your email for instructions."
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-[#121212] bg-grid-pattern">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-green-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>

      {/* Form Card */}
      <Card className="w-full max-w-md overflow-hidden relative">
        <Card.Header>
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-blue-500 border-3 border-black dark:border-white rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white dark:text-white text-adaptive"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <Card.Title className="text-center">Reset Your Password</Card.Title>
          <Text
            as="p"
            size="sm"
            className="text-center text-gray-600 dark:text-gray-400 mt-1"
          >
            Enter your email and we&apos;ll send you a reset link
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
              id="email"
              type="email"
              {...register("email")}
              label="Email Address"
              placeholder="your@email.com"
              error={errors.email?.message}
            />

            <Button
              type="submit"
              disabled={loading || isSubmitting || !!success}
              className="w-full"
              variant="primary"
              size="lg"
            >
              {loading || isSubmitting
                ? "Sending..."
                : success
                  ? "Email Sent"
                  : "Send Reset Link"}
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
