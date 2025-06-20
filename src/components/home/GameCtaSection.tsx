"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Text } from "@/components/retroui/Text";
import { useAuthStore } from "@/lib/store";
import RetroStats from "./ui/RetroStats";

export default function GameCtaSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleViewDemo = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signup");
    }
  };

  return (
    <section className="relative z-10 py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-blue-400/20 dark:from-pink-800/20 dark:to-blue-800/20 transform skew-y-6"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black border-4 border-yellow-400 p-8 rounded-lg shadow-[12px_12px_0px_0px_rgba(234,179,8,1)] dark:shadow-[12px_12px_0px_0px_rgba(234,179,8,0.8)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Text Content */}
              <div className="space-y-6">
                <Badge
                  variant="warning"
                  className="text-black font-bold px-3 py-1"
                >
                  INTERACTIVE EXPERIENCE
                </Badge>

                <h2 className="text-4xl md:text-5xl font-pixel text-white leading-tight">
                  Design Workflow
                  <br />
                  <span className="text-yellow-400">Visualization</span>
                </h2>

                <Text className="text-gray-300 text-lg leading-relaxed">
                  Experience the complete design handoff process in action.
                  Upload files, extract specifications, and collaborate in
                  real-time.
                </Text>

                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={handleViewDemo}
                    variant="primary"
                    size="lg"
                    className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Try It Free"} →
                  </Button>

                  <Link href="/auth/signup" className="no-underline">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-black text-black hover:bg-white hover:text-black font-bold px-6 py-3"
                    >
                      Start Your Project
                    </Button>
                  </Link>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {[
                    "Auto-spec extraction",
                    "Real-time collaboration",
                    "Asset management",
                    "Team workflows",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <Text className="text-gray-300 text-sm">{feature}</Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Display */}
              <div className="relative">
                <RetroStats />

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-6 h-6 bg-pink-500 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-blue-500 rounded border-2 border-white transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
