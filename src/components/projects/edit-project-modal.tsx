"use client";

import { useEffect } from "react";
import { Project } from "@/lib/types/project";
import { useUpdateProject } from "@/hooks/use-project-query";
import { useToast } from "@/hooks/use-toast";
import { projectSchema, type ProjectFormData } from "@/lib/validation/schemas";
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

type EditProjectModalProps = {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
};

export function EditProjectModal({
  project,
  isOpen,
  onClose,
}: EditProjectModalProps) {
  const updateProjectMutation = useUpdateProject(project.id);
  const { toast } = useToast();

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
      name: project.name,
      description: project.description || "",
    },
  });

  // * Reset form when project changes
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || "",
      });
    }
  }, [project, reset]);

  // * Handle Submit
  const onSubmit = async (data: ProjectFormData) => {
    try {
      await updateProjectMutation.mutateAsync({
        name: data.name,
        description: data.description || null,
      });

      // Show success toast
      toast({
        message: "Project Updated",
        description: `Project "${data.name}" has been updated successfully.`,
        variant: "success",
      });

      // Close modal
      onClose();
    } catch (err: unknown) {
      console.error("Error:", err);
      setFormError("root", {
        type: "manual",
        message: "Failed to update project. Please try again.",
      });
    }
  };

  return (
    <Dialog defaultOpen={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-lg">
        <DialogHeader>
          <Text
            as="h2"
            className="text-xl font-bold font-pixel text-black dark:text-white"
          >
            Edit Project
          </Text>
          <Text
            as="p"
            className="text-sm font-pixel text-black dark:text-white"
          >
            Update your project details
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
              placeholder="Enter project description"
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || updateProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || updateProjectMutation.isPending}
            >
              {isSubmitting || updateProjectMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
