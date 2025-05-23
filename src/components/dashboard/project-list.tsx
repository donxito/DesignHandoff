"use client";

import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { ProjectCard } from "@/components/projects/project-card";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { Project } from "@/lib/types/project";

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export default function ProjectList({
  projects,
  isLoading,
  error,
  refetch,
}: ProjectListProps) {
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // * Handle edit project
  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
  };

  // * Show loading skeleton
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="p-6 border-3 border-gray-300 dark:border-gray-700"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // * Show error message
  if (error) {
    return (
      <Card className="p-6 bg-red-50 dark:bg-red-900/30 border-red-500">
        <Text
          as="h3"
          className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2"
        >
          Error Loading Projects
        </Text>
        <Text as="p" className="text-red-600 dark:text-red-400 mb-4">
          {error.message}
        </Text>
        <Button
          onClick={refetch}
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  // * ensure projects is always an array
  if (!Array.isArray(projects) || projects.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed border-gray-300 dark:border-gray-700">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <Text
            as="h3"
            className="text-xl font-semibold mb-2 font-pixel text-black dark:text-white"
          >
            No Projects Found
          </Text>
          <Text
            as="p"
            className="mb-6 font-pixel text-gray-600 dark:text-gray-300"
          >
            Create your first project to get started with DesignHandoff.
          </Text>
          <Button
            variant="primary"
            onClick={() => {
              if (typeof window !== "undefined") {
                const event = new CustomEvent("openCreateProjectModal");
                window.dispatchEvent(event);
              }
            }}
          >
            Create First Project
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEditProject}
          />
        ))}
      </div>

      {/* Edit Project Modal */}
      {projectToEdit && (
        <EditProjectModal
          project={projectToEdit}
          isOpen={!!projectToEdit}
          onClose={() => setProjectToEdit(null)}
        />
      )}
    </>
  );
}
