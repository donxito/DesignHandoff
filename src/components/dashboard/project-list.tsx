"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProjectStore } from "@/lib/store";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";

export default function ProjectList() {
  const { projects, loading, error, fetchProjects } = useProjectStore();

  // * Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // * Show loading skeleton
  if (loading) {
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
          {error}
        </Text>
        <Button
          onClick={() => fetchProjects()}
          variant="outline"
          className="mt-4"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  // * Show no projects message
  if (projects.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed">
        <Text as="h3" className="text-xl font-semibold mb-2">
          No Projects Yet
        </Text>
        <Text as="p" className="mb-6">
          Create your first project to get started.
        </Text>
        <Link href="/dashboard/project/new">
          <Button variant="primary">Create First Project</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <Text as="h3" className="text-xl font-bold mb-2">
                {project.name}
              </Text>
              <Text as="p" className="text-gray-600 dark:text-gray-300 mb-4">
                {project.description || "No description provided"}
              </Text>

              <div className="flex gap-2">
                <Badge variant="primary" size="sm">
                  Files: {project.files_count || 0}
                </Badge>
                <Badge variant="secondary" size="sm">
                  Members: {project.members_count || 1}
                </Badge>
              </div>
            </div>

            <Link href={`/dashboard/project/${project.id}`}>
              <Button variant="outline" size="sm">
                View Project
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
