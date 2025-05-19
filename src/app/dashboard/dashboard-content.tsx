"use client";

import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
// RetroUI components
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";

type DashboardContentProps = {
  user?: User;
};

// * Dashboard content component that displays the main dashboard UI
// ? Can receive user from server-side or get it from client-side auth context

export default function DashboardContent({ user }: DashboardContentProps = {}) {
  // If no user is passed from server, use client-side auth
  const { user: clientUser } = useAuth();
  const currentUser = user || clientUser;
  const router = useRouter();

  // Navigation handlers
  const handleNavigateToUpload = () => {
    router.push("/dashboard/upload");
  };

  const handleNavigateToProjects = () => {
    router.push("/dashboard/project");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] bg-[url('/grid-pattern.svg')] dark:bg-[url('/grid-pattern-dark.svg')]">
      <Text
        as="p"
        className="mb-6 font-pixel text-black dark:text-white text-adaptive"
      >
        Welcome, {currentUser?.email || "User"}
      </Text>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 border-4 border-neutral-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e]">
          <Text
            as="h2"
            className="text-xl font-semibold mb-2 font-pixel text-black dark:text-white text-adaptive"
          >
            Your Projects
          </Text>
          <Text
            as="p"
            className="mb-4 font-pixel text-black dark:text-white text-adaptive"
          >
            Create and manage your design projects
          </Text>
          <Button
            onClick={handleNavigateToProjects}
            className="mt-4 font-pixel"
          >
            View Projects
          </Button>
        </Card>
        <Card className="p-6 border-4 border-neutral-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e]">
          <Text
            as="h2"
            className="text-xl font-semibold mb-2 font-pixel text-black dark:text-white text-adaptive"
          >
            Recent Files
          </Text>
          <Text
            as="p"
            className="mb-4 font-pixel text-black dark:text-white text-adaptive"
          >
            View and manage your recent design files
          </Text>
          <Button onClick={handleNavigateToUpload} className="mt-4 font-pixel">
            Upload Files
          </Button>
        </Card>
        <Card className="p-6 border-4 border-neutral-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e]">
          <Text
            as="h2"
            className="text-xl font-semibold mb-2 font-pixel text-black dark:text-white text-adaptive"
          >
            Team Members
          </Text>
          <Text
            as="p"
            className="mb-4 font-pixel text-black dark:text-white text-adaptive"
          >
            Invite and collaborate with team members
          </Text>
          <Button className="mt-4 font-pixel">Invite Member</Button>
        </Card>
      </div>
    </div>
  );
}
