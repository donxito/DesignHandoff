"use client";

import { useEffect, useState } from "react";
import { PlusCircle, FolderOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useProjectStore } from "@/store/projectStore";
import { ProjectCard } from "@/components/projects/project-card";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function DashboardPage() {
  const { getUser, isLoading: isLoadingUser } = useAuthStore();
  const {
    projects,
    fetchProjects,
    isLoading: isLoadingProjects,
    error,
  } = useProjectStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch user data and projects on mount
  useEffect(() => {
    getUser();
    fetchProjects();
  }, [getUser, fetchProjects]);

  const isLoading = isLoadingUser || isLoadingProjects;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your design handoff projects
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 sm:mt-0 flex items-center"
          >
            <PlusCircle size={18} className="mr-2" />
            Create Project
          </Button>
        </div>

        {/* Projects grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Your Projects
            </h2>
            <button
              onClick={() => fetchProjects()}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              disabled={isLoading}
            >
              <RefreshCw
                size={16}
                className={`mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-12">
              <RefreshCw
                size={24}
                className="mx-auto animate-spin text-gray-400"
              />
              <p className="mt-2 text-gray-500">Loading projects...</p>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              <p>Error loading projects: {error}</p>
              <button
                onClick={() => fetchProjects()}
                className="mt-2 text-sm underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && projects.length === 0 && (
            <div className="bg-white border rounded-lg p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FolderOpen size={32} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No projects yet
              </h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                Create your first project to start collaborating with your team
                on design handoffs.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4"
              >
                Create Your First Project
              </Button>
            </div>
          )}

          {/* Projects grid */}
          {!isLoading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create project modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </DashboardLayout>
  );
}
