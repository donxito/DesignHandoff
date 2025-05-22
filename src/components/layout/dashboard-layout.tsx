"use client";

import { PropsWithChildren, useEffect } from "react";
//import { useRouter, usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
//import { useAuth } from "@/hooks/use-auth";
import { Text } from "@/components/retroui/Text";

interface DashboardLayoutProps extends PropsWithChildren {
  title?: string;
}

export default function DashboardLayout({
  children,
  title = "Dashboard",
}: DashboardLayoutProps) {
  // const { isAuthenticated, loading } = useAuth();
  // const router = useRouter();
  // const pathname = usePathname();

  // Set document title
  useEffect(() => {
    document.title = `${title} | DesignHandoff`;
  }, [title]);

  // Custom loading state for dashboard
  const loadingFallback = (
    <div className="min-h-screen bg-white dark:bg-[#121212] bg-[url('/grid-pattern.svg')] dark:bg-[url('/grid-pattern-dark.svg')]">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4"></div>
          <div className="h-60 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </main>
    </div>
  );

  return (
    <ProtectedRoute fallback={loadingFallback}>
      <div className="min-h-screen bg-white dark:bg-[#121212] bg-[url('/grid-pattern.svg')] dark:bg-[url('/grid-pattern-dark.svg')]">
        <Header />
        <div className="container mx-auto py-8 px-4">
          {/* Page title */}
          <Text
            as="h1"
            className="text-3xl font-bold font-pixel text-black dark:text-white mb-8"
          >
            {title}
          </Text>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar navigation */}
            <Sidebar />

            {/* Main content */}
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
