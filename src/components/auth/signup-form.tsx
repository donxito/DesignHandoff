"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

// Import RetroUI components
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Alert } from "@/components/retroui/Alert";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const { error } = await register({ email, password, fullName });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Redirect to dashboard on successful registration
      router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-[#121212] bg-grid-pattern">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-blue-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-green-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>
      
      <Card className="w-full max-w-md overflow-hidden relative">
        <Card.Header>
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-blue-500 border-3 border-black dark:border-white rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white dark:text-white text-adaptive">
                <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
              </svg>
            </div>
          </div>
          <Card.Title className="text-center">
            Create Your Account
          </Card.Title>
          <Text as="p" size="sm" className="text-center text-gray-600 dark:text-gray-400 mt-1">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                label="Full Name"
                placeholder="John Doe"
              />
            </div>

            <div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                label="Email Address"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                label="Password"
                placeholder="••••••••"
              />
              <Text as="p" size="xs" className="text-gray-500 dark:text-gray-400 mt-1">
                Must be at least 6 characters
              </Text>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              variant="primary"
              size="lg"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
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
