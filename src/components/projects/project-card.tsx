"use client";

import { useState } from "react";
import Link from "next/link";
import { isProjectStatus, Project, ProjectStatus } from "@/lib/types/project";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useDeleteProject, useUpdateProject } from "@/hooks/use-project-query";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/retroui/Dialog";
import ProjectStatusBadge from "@/components/projects/project-status-badge";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject(project.id);
  const { toast } = useToast();

  // * Handle quick status change
  const handleStatusChange = async (newStatus: ProjectStatus) => {
    try {
      await updateProjectMutation.mutateAsync({
        status: newStatus as ProjectStatus,
      });

      toast({
        message: "Status Updated",
        description: `Project status changed to ${newStatus.replace("_", " ")}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        message: "Update Failed",
        description: "Could not update project status",
        variant: "error",
      });
    }
  };

  // * Format the date
  const formattedDate = project.created_at
    ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true })
    : "";

  // * Handle delete confirmation
  // Handle status change from dropdown
  const handleStatusSelect = (value: string) => {
    if (isProjectStatus(value)) {
      handleStatusChange(value as ProjectStatus);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      // project store
      const { useProjectStore } = await import("@/lib/store/projectStore");
      const projectStore = useProjectStore.getState();

      // Delete the project using the store
      const result = await projectStore.deleteProject(project.id);

      // If deletion was successful, show success toast and redirect
      if (!result?.error) {
        toast({
          message: "Project deleted",
          description: `${project.name} has been deleted successfully.`,
          variant: "success",
          duration: 8000,
          action: {
            label: "Dismiss",
            onClick: () => {},
          },
        });
        setIsDeleteDialogOpen(false);
        window.location.href = "/dashboard/projects";
      } else {
        // Show persistent error toast and keep dialog open
        toast({
          message: "Error",
          description:
            result?.error &&
            typeof result.error === "object" &&
            "message" in result.error &&
            typeof result.error.message === "string"
              ? result.error.message
              : "Failed to delete project. Please try again.",
          variant: "error",
          duration: 0, // sticky, must be dismissed
          action: {
            label: "Dismiss",
            onClick: () => {},
          },
        });
        setIsDeleting(false); // allow retry

        console.error("Error deleting project:", result?.error);
      }
    } catch (error) {
      // Log unexpected errors
      console.error("Unexpected error deleting project:", error);
      toast({
        message: "Error",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Failed to delete project. Please try again.",
        variant: "error",
        duration: 0, // sticky
        action: {
          label: "Dismiss",
          onClick: () => {},
        },
      });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="p-5 hover:shadow-lg transition-shadow border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <Text
              as="h3"
              className="text-xl font-bold font-pixel mb-2 text-black dark:text-white"
            >
              {project.name}
            </Text>
            <Text
              as="p"
              className="text-gray-600 dark:text-gray-300 mb-4 font-pixel"
            >
              {project.description || "No description provided"}
            </Text>

            <div className="flex flex-wrap gap-2 mb-4">
              <ProjectStatusBadge
                status={
                  isProjectStatus(project.status) ? project.status : "active"
                }
              />
              <Badge variant="primary" size="sm">
                Files: {project.files_count || 0}
              </Badge>
              <Badge variant="secondary" size="sm">
                Members: {project.members_count || 1}
              </Badge>
              <Badge variant="outline" size="sm">
                Created {formattedDate}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-end sm:self-start">
            <Link href={`/dashboard/projects/${project.id}`}>
              <Button variant="primary" size="sm">
                View Project
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog  */}
      {isDeleteDialogOpen && (
        <Dialog
          defaultOpen={true}
          onOpenChange={(open) => {
            if (!open) setIsDeleteDialogOpen(false);
          }}
        >
          <DialogContent className="rounded-lg">
            <DialogHeader>
              <Text
                as="h2"
                className="text-xl font-bold font-pixel text-black dark:text-white"
              >
                Delete Project
              </Text>
              <Text
                as="p"
                className="text-sm font-pixel text-black dark:text-white"
              >
                Are you sure you want to delete &quot;{project.name}&quot;? This
                action cannot be undone.
              </Text>
            </DialogHeader>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteProjectMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
