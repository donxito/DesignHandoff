"use client";

import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-project-query";
import { DemoInitializer } from "@/components/dashboard/demo-initializer";
// RetroUI components
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import {
  FolderOpen,
  Upload,
  Users,
  MessageSquare,
  Palette,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

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

  // Fetch projects to show stats
  const { data: projectsResponse } = useProjects();
  const projects = projectsResponse?.projects || [];

  // Calculate quick stats
  const activeProjects = projects.filter(
    (p) => p.status === "active" || !p.status
  ).length;
  const totalFiles = projects.reduce((sum, p) => sum + (p.files_count || 0), 0);
  const totalMembers = projects.reduce(
    (sum, p) => sum + (p.members_count || 0),
    0
  );

  // Navigation handlers with router.push() following workspace rules [[memory:675834]]
  const handleNavigateToUpload = () => {
    router.push("/dashboard/upload");
  };

  const handleNavigateToProjects = () => {
    router.push("/dashboard/projects");
  };

  const handleNavigateToTeam = () => {
    router.push("/dashboard/team");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] bg-[url('/grid-pattern.svg')] dark:bg-[url('/grid-pattern-dark.svg')]">
      <div className="mb-6">
        <Text
          as="h1"
          className="text-2xl font-bold mb-2 font-pixel text-black dark:text-white text-adaptive"
        >
          Welcome back, {currentUser?.email?.split("@")[0] || "User"}!
        </Text>
        <Text
          as="p"
          className="text-gray-600 dark:text-gray-300 font-pixel text-adaptive"
        >
          Manage your design projects and collaborate with your team
        </Text>
      </div>

      {/* Demo Data Initializer */}
      <DemoInitializer />

      {/* Quick Stats */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-2 border-neutral-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <Text className="text-2xl font-bold font-pixel text-black dark:text-white">
                  {activeProjects}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300 font-pixel">
                  Active Projects
                </Text>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-neutral-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Text className="text-2xl font-bold font-pixel text-black dark:text-white">
                  {totalFiles}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300 font-pixel">
                  Design Files
                </Text>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-neutral-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <Text className="text-2xl font-bold font-pixel text-black dark:text-white">
                  {totalMembers}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300 font-pixel">
                  Team Members
                </Text>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-neutral-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <Text className="text-2xl font-bold font-pixel text-black dark:text-white">
                  Real-time
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300 font-pixel">
                  Collaboration
                </Text>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 border-4 border-neutral-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <Badge variant="primary" className="text-xs">
              {projects.length} Projects
            </Badge>
          </div>
          <Text
            as="h2"
            className="text-xl font-semibold mb-2 font-pixel text-black dark:text-white text-adaptive"
          >
            Your Projects
          </Text>
          <Text
            as="p"
            className="mb-4 font-pixel text-gray-600 dark:text-gray-300 text-adaptive text-sm"
          >
            Create and manage your design projects. View files, collaborate with
            team members, and track progress.
          </Text>
          <Button
            onClick={handleNavigateToProjects}
            className="mt-4 font-pixel w-full group"
          >
            Manage Projects
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>

        <Card className="p-6 border-4 border-neutral-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
            <Badge variant="secondary" className="text-xs">
              Quick Upload
            </Badge>
          </div>
          <Text
            as="h2"
            className="text-xl font-semibold mb-2 font-pixel text-black dark:text-white text-adaptive"
          >
            Upload Files
          </Text>
          <Text
            as="p"
            className="mb-4 font-pixel text-gray-600 dark:text-gray-300 text-adaptive text-sm"
          >
            Upload design files, mockups, and assets. Supported formats: PNG,
            JPG, WebP, PDF.
          </Text>
          <Button
            onClick={handleNavigateToUpload}
            className="mt-4 font-pixel w-full group"
            variant="secondary"
          >
            Upload Files
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>

        <Card className="p-6 border-4 border-neutral-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <Badge variant="outline" className="text-xs">
              Collaboration
            </Badge>
          </div>
          <Text
            as="h2"
            className="text-xl font-semibold mb-2 font-pixel text-black dark:text-white text-adaptive"
          >
            Team Members
          </Text>
          <Text
            as="p"
            className="mb-4 font-pixel text-gray-600 dark:text-gray-300 text-adaptive text-sm"
          >
            Invite and collaborate with team members. Manage roles and
            permissions for seamless workflow.
          </Text>
          <Button
            onClick={handleNavigateToTeam}
            className="mt-4 font-pixel w-full group"
            variant="outline"
          >
            Manage Team
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
