"use client";

import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { useProjects } from "@/hooks/use-project-query";
import { ProjectCard } from "@/components/projects/project-card";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { Project } from "@/lib/types/project";

export default function ProjectList() {
  const { data: projects, isLoading, error, refetch } = useProjects();
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
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"
          ></div>
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
          className="text-lg font-semibold text-red-700 dark:text-red-300"
        >
          Error Loading Projects
        </Text>
        <Text as="p" className="text-red-600 dark:text-red-400">
          {error.message}
        </Text>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  // * Show no projects message
  if (!projects || projects.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed">
        <Text as="h3" className="text-xl font-semibold mb-2 font-pixel">
          No Projects Yet
        </Text>
        <Text as="p" className="mb-6 font-pixel">
          Create your first project to get started.
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
