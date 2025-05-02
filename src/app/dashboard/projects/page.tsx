"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Search, Grid, List, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/store/projectStore";
import { ProjectCard } from "@/components/projects/project-card";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function ProjectsPage() {
  const { projects, fetchProjects, isLoading, error } = useProjectStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and organize your design handoff projects
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

        {/* Search and filters */}
        <div className="mb-6 bg-white p-4 rounded-lg border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md ${
                  viewMode === "grid"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md ${
                  viewMode === "list"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => fetchProjects()}
                className={`p-2 rounded-md text-gray-500 hover:bg-gray-100`}
                aria-label="Refresh projects"
                disabled={isLoading}
              >
                <RefreshCw
                  size={18}
                  className={isLoading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
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
        {!isLoading && !error && filteredProjects.length === 0 && (
          <div className="bg-white border rounded-lg p-8 text-center">
            {searchTerm ? (
              <>
                <h3 className="text-lg font-medium text-gray-900">
                  No matching projects
                </h3>
                <p className="mt-2 text-gray-500">
                  No projects match your search criteria. Try adjusting your
                  search or create a new project.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <PlusCircle size={32} className="text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No projects yet
                </h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  Create your first project to start collaborating with your
                  team on design handoffs.
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4"
                >
                  Create Your First Project
                </Button>
              </>
            )}
          </div>
        )}

        {/* Projects list */}
        {!isLoading && !error && filteredProjects.length > 0 && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 flex items-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center text-blue-500 flex-shrink-0">
                        <PlusCircle size={24} />
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/dashboard/projects/${project.id}`;
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create project modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </DashboardLayout>
  );
}
