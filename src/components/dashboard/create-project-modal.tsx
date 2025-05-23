"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateProject } from "@/hooks/use-project-query";
import { projectSchema, type ProjectFormData } from "@/lib/validation/schemas";
import { ProjectStatus } from "@/lib/types/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/retroui/Dialog";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Textarea } from "@/components/retroui/Textarea";
import { Label } from "@/components/retroui/Label";
import { Alert } from "@/components/retroui/Alert";
import { Text } from "@/components/retroui/Text";
import { getStatusOptions } from "../projects/project-status-badge";

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const { user, isAuthenticated } = useAuth();

  // * Create Project Mutation
  const createProjectMutation = useCreateProject();

  // * Status Options
  const statusOptions = getStatusOptions();

  // * React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active" as ProjectStatus,
    },
  });

  // * Check authentication status when modal opens
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      setFormError("root", {
        type: "manual",
        message: "You must be logged in to create a project.",
      });
    }
  }, [isOpen, isAuthenticated, setFormError]);

  // * Handle Submit
  const onSubmit = async (data: ProjectFormData) => {
    try {
      // check if user is authenticated
      if (!isAuthenticated || !user) {
        setFormError("root", {
          type: "manual",
          message: "You must be logged in to create a project.",
        });
        return;
      }

      await createProjectMutation.mutateAsync({
        name: data.name,
        description: data.description || null,
        status: (data.status || "active") as ProjectStatus,
      });

      // Close modal and notify parent of success
      onClose();
      onSuccess?.();

      // Reset form
      reset();
    } catch (err: unknown) {
      console.error("Error:", err);
      setFormError("root", {
        type: "manual",
        message: "An unexpected error occurred",
      });
    }
  };

  return (
    <Dialog defaultOpen={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-lg">
        <DialogHeader>
          <Text as="h2" className="text-xl font-bold font-pixel text-black">
            Create New Project
          </Text>
          <Text as="p" className="text-sm font-pixel text-black">
            Create a new design project to collaborate with your team.
          </Text>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && (
            <Alert status="error">
              <Alert.Description>{errors.root.message}</Alert.Description>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter project name"
              error={errors.name?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter project description (optional)"
              rows={4}
              className="w-full px-4 py-2.5 rounded-md bg-white dark:bg-gray-800 border-3 transition-all duration-200 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.5)] focus:translate-x-[2px] focus:translate-y-[2px] focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-white"
              aria-invalid={!!errors.description}
            />
            {errors.description?.message && (
              <Text as="p" size="sm" variant="danger" className="mt-1">
                {errors.description.message}
              </Text>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Project Status</Label>
            <select
              id="status"
              {...register("status")}
              className="w-full px-4 py-2.5 rounded-md bg-white dark:bg-gray-800 border-3 transition-all duration-200 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.5)] focus:translate-x-[2px] focus:translate-y-[2px] focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status?.message && (
              <Text as="p" size="sm" variant="danger" className="mt-1">
                {errors.status.message}
              </Text>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || createProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createProjectMutation.isPending}
            >
              {isSubmitting || createProjectMutation.isPending
                ? "Creating..."
                : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
