"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  UploadCloud,
  Users,
  Settings,
  Trash2,
  ArrowLeft,
  Clock,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/projectStore";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { getProject, currentProject, isLoading, error, deleteProject } =
    useProjectStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch project data on mount
  useEffect(() => {
    if (projectId) {
      getProject(projectId);
    }
  }, [projectId, getProject]);

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!currentProject) return;

    setIsDeleting(true);
    try {
      const success = await deleteProject(currentProject.id);
      if (success) {
        router.push("/dashboard/projects");
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/dashboard/projects")}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Projects</span>
        </button>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw
              size={24}
              className="mx-auto animate-spin text-gray-400"
            />
            <p className="mt-2 text-gray-500">Loading project...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            <p>Error loading project: {error}</p>
            <button
              onClick={() => getProject(projectId)}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Project details */}
        {!isLoading && !error && currentProject && (
          <>
            <div className="bg-white rounded-lg border overflow-hidden">
              {/* Project header */}
              <div className="p-6 sm:p-8 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {currentProject.name}
                    </h1>
                    {currentProject.description && (
                      <p className="mt-2 text-gray-600 max-w-3xl">
                        {currentProject.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
                    <Button variant="outline" className="flex items-center">
                      <Users size={16} className="mr-2" />
                      Team
                    </Button>
                    <Button variant="outline" className="flex items-center">
                      <Settings size={16} className="mr-2" />
                      Settings
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Project metadata */}
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>
                      Created: {formatDate(currentProject.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>
                      Updated: {formatDate(currentProject.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Design files section */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Design Files
                  </h2>
                  <Button className="mt-3 sm:mt-0 flex items-center">
                    <UploadCloud size={16} className="mr-2" />
                    Upload Design
                  </Button>
                </div>

                {/* Empty state for designs */}
                <div className="bg-gray-50 border rounded-lg p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <FolderOpen size={32} className="text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    No design files
                  </h3>
                  <p className="mt-2 text-gray-500 max-w-md mx-auto">
                    Upload your first design file to start the handoff process.
                  </p>
                  <Button className="mt-4 flex items-center mx-auto">
                    <UploadCloud size={16} className="mr-2" />
                    Upload Design
                  </Button>
                </div>
              </div>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Delete Project
                    </h3>
                    <p className="mt-2 text-gray-600">
                      Are you sure you want to delete &quot;
                      {currentProject.name}&quot;? This action cannot be undone
                      and all related data will be permanently removed.
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                        onClick={handleDeleteProject}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete Project"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
