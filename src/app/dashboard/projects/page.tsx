"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ProjectList from "@/components/dashboard/project-list";
import { CreateProjectModal } from "@/components/dashboard/create-project-modal";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card } from "@/components/retroui/Card";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useProjects } from "@/hooks/use-project-query";
import { Search } from "lucide-react";

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: projects } = useProjects();

  // * Listen for the custom event to open the modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    // Add event listener
    if (typeof window !== "undefined") {
      window.addEventListener("openCreateProjectModal", handleOpenModal);

      // Clean up
      return () => {
        window.removeEventListener("openCreateProjectModal", handleOpenModal);
      };
    }
  }, []);

  const handleProjectCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    router.refresh();
  };

  // Calculate project stats
  const totalProjects = projects?.length || 0;
  const recentProjects = projects?.filter(
    (p) => p.created_at ? new Date(p.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : false
  ).length || 0;
  const totalFiles = projects?.reduce((sum, p) => sum + (p.files_count || 0), 0) || 0;

  return (
    <DashboardLayout title="Projects">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
          <Text as="h3" className="text-lg font-bold font-pixel text-black dark:text-white mb-1">
            Total Projects
          </Text>
          <Text as="p" className="text-3xl font-bold font-pixel text-black dark:text-white">
            {totalProjects}
          </Text>
        </Card>
        
        <Card className="p-5 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
          <Text as="h3" className="text-lg font-bold font-pixel text-black dark:text-white mb-1">
            Recent Projects
          </Text>
          <Text as="p" className="text-3xl font-bold font-pixel text-black dark:text-white">
            {recentProjects}
          </Text>
        </Card>
        
        <Card className="p-5 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
          <Text as="h3" className="text-lg font-bold font-pixel text-black dark:text-white mb-1">
            Total Design Files
          </Text>
          <Text as="p" className="text-3xl font-bold font-pixel text-black dark:text-white">
            {totalFiles}
          </Text>
        </Card>
      </div>

      {/* Projects Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Text
            as="h1"
            className="text-3xl font-bold font-pixel text-black dark:text-white text-adaptive mb-2"
          >
            Your Projects
          </Text>
          <Text as="p" className="text-gray-600 dark:text-gray-300 font-pixel">
            Manage your design projects and collaborate with your team
          </Text>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Create Project
          </Button>
        </div>
      </div>

      {/* Project List */}
      <ProjectList />

      {/* Project Creation Modal */}
      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </DashboardLayout>
  );
}
