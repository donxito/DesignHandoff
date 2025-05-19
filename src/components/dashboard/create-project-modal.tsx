"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateProject } from "@/hooks/use-project-query";
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

  // * State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // * Check authentication status when modal opens
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      setError("You must be logged in to create a project.");
    } else {
      setError(null);
    }
  }, [isOpen, isAuthenticated]);

  // * Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate form input
    if (!name || name.length < 3) {
      setError("Project name must be at least 3 characters");
      setIsSubmitting(false);
      return;
    }

    // Check if user is authenticated using the useAuth hook
    if (!isAuthenticated || !user) {
      setError(
        "You must be logged in to create a project. Please refresh the page and try again."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      await createProjectMutation.mutateAsync({
        name,
        description: description || null,
      });

      // Reset form
      setName("");
      setDescription("");

      // Close modal and notify parent of success
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      console.error("Error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert status="error">
              <Alert.Description>{error}</Alert.Description>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
