"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ProjectList from "@/components/dashboard/project-list";
import { CreateProjectModal } from "@/components/dashboard/create-project-modal";
import ProjectFiltersComponent from "@/components/dashboard/project-filter-component";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useProjects } from "@/hooks/use-project-query";
import {
  ProjectFilters,
  ProjectSortField,
  ProjectSortOrder,
  ProjectStatus,
} from "@/lib/types/project";

function ProjectsPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // * Initialize filters from URL parameters
  const [filters, setFilters] = useState<ProjectFilters>({
    search: searchParams.get("search") || "",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
    status: (searchParams.get("status") as ProjectStatus) || "",
  });

  const [sortField, setSortField] = useState<ProjectSortField>(
    (searchParams.get("sortField") as ProjectSortField) || "created_at"
  );
  const [sortOrder, setSortOrder] = useState<ProjectSortOrder>(
    (searchParams.get("sortOrder") as ProjectSortOrder) || "desc"
  );

  // * Fetch projects with current filters and sorting
  const {
    data: projectsResponse,
    isLoading,
    error,
    refetch,
  } = useProjects({
    filters,
    sortField,
    sortOrder,
  });

  const projects = projectsResponse?.projects || [];
  //const totalProjects = projectsResponse?.total || 0;

  // * Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // * Add non-empty filters to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        params.set(key, value);
      }
    });

    // * Add sorting parameters
    if (sortField !== "created_at") params.set("sortField", sortField);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);

    // * Update URL without causing a reload
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : "/dashboard/projects";
    window.history.replaceState(null, "", newUrl);
  }, [filters, sortField, sortOrder]);

  // * Listen for the custom event to open the modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("openCreateProjectModal", handleOpenModal);
      return () => {
        window.removeEventListener("openCreateProjectModal", handleOpenModal);
      };
    }
  }, []);

  // * Handle project created
  const handleProjectCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    router.refresh();
  };

  // * Handle filters change
  const handleFiltersChange = (newFilters: ProjectFilters) => {
    setFilters(newFilters);
  };

  // * Handle sort change
  const handleSortChange = (
    field: ProjectSortField,
    order: ProjectSortOrder
  ) => {
    setSortField(field);
    setSortOrder(order);
  };

  // * Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      search: "",
      dateFrom: "",
      dateTo: "",
      status: undefined,
    });
    setSortField("created_at");
    setSortOrder("desc");
  };

  // * Calculate project stats by status
  const activeProjects =
    projects?.filter((p) => p.status === "active" || !p.status).length || 0;
  // const archivedProjects =
  //   projects?.filter((p) => p.status === "archived").length || 0;
  const onHoldProjects =
    projects?.filter((p) => p.status === "on_hold").length || 0;
  const completedProjects =
    projects?.filter((p) => p.status === "completed").length || 0;

  // const recentProjects =
  //   projects?.filter((p) =>
  //     p.created_at
  //       ? new Date(p.created_at).getTime() >
  //         Date.now() - 7 * 24 * 60 * 60 * 1000
  //       : false
  //   ).length || 0;

  const totalFiles =
    projects?.reduce((sum, p) => sum + (p.files_count || 0), 0) || 0;

  return (
    <DashboardLayout title="Projects">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-5 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
          <Text
            as="h3"
            className="text-lg font-bold font-pixel text-black dark:text-white mb-1"
          >
            Active Projects
          </Text>
          <Text
            as="p"
            className="text-3xl font-bold font-pixel text-green-600 dark:text-green-400"
          >
            {activeProjects}
          </Text>
        </Card>

        <Card className="p-5 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
          <Text
            as="h3"
            className="text-lg font-bold font-pixel text-black dark:text-white mb-1"
          >
            On Hold
          </Text>
          <Text
            as="p"
            className="text-3xl font-bold font-pixel text-yellow-600 dark:text-yellow-400"
          >
            {onHoldProjects}
          </Text>
        </Card>

        <Card className="p-5 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
          <Text
            as="h3"
            className="text-lg font-bold font-pixel text-black dark:text-white mb-1"
          >
            Completed
          </Text>
          <Text
            as="p"
            className="text-3xl font-bold font-pixel text-blue-600 dark:text-blue-400"
          >
            {completedProjects}
          </Text>
        </Card>

        <Card className="p-5 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
          <Text
            as="h3"
            className="text-lg font-bold font-pixel text-black dark:text-white mb-1"
          >
            Total Files
          </Text>
          <Text
            as="p"
            className="text-3xl font-bold font-pixel text-purple-600 dark:text-purple-400"
          >
            {totalFiles}
          </Text>
        </Card>
      </div>

      {/* Filters */}
      <ProjectFiltersComponent
        filters={filters}
        sortField={sortField}
        sortOrder={sortOrder}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
      />

      {/* Main Content */}
      <div className="space-y-6">
        {/* Projects List */}
        <div className="bg-white dark:bg-gray-800 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Text
                as="h2"
                className="text-2xl font-bold font-pixel text-black dark:text-white"
              >
                Projects
              </Text>
              <Text
                as="p"
                className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              >
                Manage your design projects and collaborations
              </Text>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-pixel text-sm px-4 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.5)]"
            >
              Create Project
            </Button>
          </div>

          <ProjectList
            projects={projects}
            isLoading={isLoading}
            error={error}
            refetch={refetch}
          />
        </div>

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleProjectCreated}
        />
      </div>
    </DashboardLayout>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}
