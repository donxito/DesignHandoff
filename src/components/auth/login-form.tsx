"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { loginSchema, type LoginFormData } from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// RetroUI components
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Alert, AlertDescription } from "@/components/retroui/Alert";
import SocialLogin from "./social-login";

export default function LoginForm() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore();

  // * React hook form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // * On submit
  const onSubmit = async (data: LoginFormData) => {
    clearError();

    try {
      const { error } = await login({
        email: data.email,
        password: data.password,
      });

      if (!error) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-[#121212] bg-grid-pattern">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-pink-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>

      {/* Login form */}
      <Card className="w-full max-w-md overflow-hidden relative">
        <Card.Header>
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-pink-500 border-3 border-black dark:border-white rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white dark:text-white text-adaptive"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Card title */}
          <Card.Title className="text-center">
            Login to DesignHandoff
          </Card.Title>
        </Card.Header>

        {/* Card content */}

        <Card.Content className="px-8 py-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <h4 className="font-medium mb-1">Error</h4>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="email"
              type="email"
              {...register("email")}
              label="Email Address"
              placeholder="your@email.com"
              error={errors.email?.message}
            />

            <Input
              id="password"
              type="password"
              {...register("password")}
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
            />

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full"
              variant="primary"
              size="lg"
            >
              {loading || isSubmitting ? "Logging in..." : "Login to Account"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <SocialLogin />
        </Card.Content>

        <Card.Footer>
          <Text as="p" className="text-center w-full">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up now
            </Link>
          </Text>
        </Card.Footer>
      </Card>
    </div>
  );
}
