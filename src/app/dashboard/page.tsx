"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const { user, getUser, signOut, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    getUser();
  }, [getUser]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.username || user?.email}</span>
            <button
              onClick={handleSignOut}
              className="py-2 px-4 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
            <p className="text-gray-500">
              You don&apos;t have any projects yet. Create your first project to
              get started.
            </p>
            <button className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              Create Project
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
