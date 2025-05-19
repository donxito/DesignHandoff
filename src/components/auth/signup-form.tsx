"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { signupSchema, type SignupFormData } from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// RetroUI components
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Alert } from "@/components/retroui/Alert";
import SocialLogin from "./social-login";

export default function SignupForm() {
  const router = useRouter();
  const { register: registerUser, loading, error, clearError } = useAuthStore();

  // * React hook form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  // * On submit
  const onSubmit = async (data: SignupFormData) => {
    clearError();

    try {
      const { error } = await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
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
      <div className="absolute top-20 right-10 w-20 h-20 bg-blue-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-green-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>

      {/* Signup form */}
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
                <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
              </svg>
            </div>
          </div>

          {/* Card title */}
          <Card.Title className="text-center">Create Your Account</Card.Title>

          {/* Card description */}
          <Text
            as="p"
            size="sm"
            className="text-center text-gray-600 dark:text-gray-400 mt-1"
          >
            Join DesignHandoff and start collaborating
          </Text>
        </Card.Header>

        <Card.Content className="px-8 py-6">
          {error && (
            <Alert status="error" className="mb-6">
              <Alert.Title>Error</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="fullName"
              type="text"
              {...register("fullName")}
              label="Full Name"
              placeholder="John Doe"
              error={errors.fullName?.message}
            />

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

            <Button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full"
              variant="primary"
              size="lg"
            >
              {loading || isSubmitting
                ? "Creating account..."
                : "Create Account"}
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
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login instead
            </Link>
          </Text>
        </Card.Footer>
      </Card>
    </div>
  );
}
