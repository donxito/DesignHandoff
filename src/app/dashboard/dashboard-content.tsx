"use client";

import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";

type DashboardContentProps = {
  user?: User;
};

/**
 * Dashboard content component that displays the main dashboard UI
 * Can receive user from server-side or get it from client-side auth context
 */
export default function DashboardContent({ user }: DashboardContentProps = {}) {
  // If no user is passed from server, use client-side auth
  const { user: clientUser } = useAuth();
  const currentUser = user || clientUser;
  const router = useRouter();

  // Navigation handlers
  const handleNavigateToUpload = () => {
    router.push('/dashboard/upload');
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="mb-4">
          Welcome, {currentUser?.email || "User"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Your Projects</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Create and manage your design projects
            </p>
            <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Create Project
            </button>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Recent Files</h2>
            <p className="text-gray-500 dark:text-gray-400">
              View and manage your recent design files
            </p>
            <button
              onClick={handleNavigateToUpload}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Upload Files
            </button>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Team Members</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Invite and collaborate with team members
            </p>
            <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Invite Member
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
