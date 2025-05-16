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

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await login({ email, password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Redirect to dashboard on successful login
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
      <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-pink-400 border-3 border-black dark:border-white rounded-full opacity-20 animate-pulse"></div>
      
      <Card className="w-full max-w-md overflow-hidden relative">
        <Card.Header>
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-pink-500 border-3 border-black dark:border-white rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white dark:text-white text-adaptive">
                <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <Card.Title className="text-center">
            Login to DesignHandoff
          </Card.Title>
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
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              variant="primary"
              size="lg"
            >
              {loading ? "Logging in..." : "Login to Account"}
            </Button>
          </form>
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
