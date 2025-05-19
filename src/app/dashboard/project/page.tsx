"use client";

import { useState, useEffect } from "react";
import ProjectList from "@/components/dashboard/project-list";
import { CreateProjectModal } from "@/components/dashboard/create-project-modal";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import ProtectedRoute from "@/components/auth/protected-route";
import Header from "@/components/layout/header";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  // Listen for the custom event to open the modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    // Add event listener
    window.addEventListener("openCreateProjectModal", handleOpenModal);

    // Clean up
    return () => {
      window.removeEventListener("openCreateProjectModal", handleOpenModal);
    };
  }, []);

  const handleProjectCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    router.refresh();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-[#121212] bg-[url('/grid-pattern.svg')] dark:bg-[url('/grid-pattern-dark.svg')]">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <Text
              as="h1"
              className="text-3xl font-bold font-pixel text-black dark:text-white text-adaptive"
            >
              Your Projects
            </Text>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Create Project
            </Button>
          </div>

          <ProjectList />

          {/* Project Creation Modal */}
          {isModalOpen && (
            <CreateProjectModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={handleProjectCreated}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
