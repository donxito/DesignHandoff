import { Project } from "@/lib/types/project";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { formatDistanceToNow } from "date-fns";
import { Calendar, FileImage, Users, Activity } from "lucide-react";

interface ProjectOverviewSectionProps {
  project: Project;
  onSwitchToFiles: () => void;
  onSwitchToUpload: () => void;
  onSwitchToTeam: () => void;
}

export function ProjectOverviewSection({
  project,
  onSwitchToFiles,
  onSwitchToUpload,
  onSwitchToTeam,
}: ProjectOverviewSectionProps) {
  return (
    <div className="space-y-6">
      {/* Project Summary Card */}
      <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        <Text
          as="h3"
          className="text-xl font-bold font-pixel mb-4 text-black dark:text-white"
        >
          Project Overview
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Details */}
          <div className="space-y-4">
            <div>
              <Text
                as="h4"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
              >
                Description
              </Text>
              <Text as="p" className="font-pixel text-black dark:text-white">
                {project.description || "No description provided"}
              </Text>
            </div>

            <div>
              <Text
                as="h4"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
              >
                Status
              </Text>
              <Badge
                variant={project.status === "active" ? "success" : "secondary"}
                className="font-pixel"
              >
                {project.status || "Active"}
              </Badge>
            </div>

            <div>
              <Text
                as="h4"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
              >
                Created Date
              </Text>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Text
                  as="span"
                  className="font-pixel text-black dark:text-white"
                >
                  {project.created_at
                    ? (() => {
                        try {
                          return formatDistanceToNow(
                            new Date(project.created_at),
                            {
                              addSuffix: true,
                            }
                          );
                        } catch (error) {
                          return "Invalid date";
                        }
                      })()
                    : "Unknown"}
                </Text>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div>
              <Text
                as="h4"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3"
              >
                Quick Stats
              </Text>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4 text-blue-500" />
                    <Text
                      as="span"
                      className="font-pixel text-black dark:text-white"
                    >
                      Design Files
                    </Text>
                  </div>
                  <Badge variant="primary" size="sm">
                    {project.files_count || 0}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <Text
                      as="span"
                      className="font-pixel text-black dark:text-white"
                    >
                      Team Members
                    </Text>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {project.members_count || 1}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <Text
                      as="span"
                      className="font-pixel text-black dark:text-white"
                    >
                      Status
                    </Text>
                  </div>
                  <Badge
                    variant={
                      project.status === "active" ? "success" : "secondary"
                    }
                    size="sm"
                  >
                    {project.status || "Active"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Files Section */}
        <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
          <Text
            as="h4"
            className="text-lg font-bold font-pixel mb-3 text-black dark:text-white"
          >
            Recent Files
          </Text>
          {project.files_count && project.files_count > 0 ? (
            <div className="space-y-3">
              <Text
                as="p"
                className="font-pixel text-black dark:text-white mb-3"
              >
                You have {project.files_count} design files in this project.
              </Text>
              <Button
                variant="outline"
                onClick={onSwitchToFiles}
                className="w-full"
              >
                View All Files
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <FileImage className="h-6 w-6 text-gray-400" />
              </div>
              <Text
                as="p"
                className="font-pixel text-black dark:text-white mb-3"
              >
                No design files yet
              </Text>
              <Button variant="primary" onClick={onSwitchToUpload} size="sm">
                Upload First File
              </Button>
            </div>
          )}
        </Card>

        {/* Team Section */}
        <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
          <Text
            as="h4"
            className="text-lg font-bold font-pixel mb-3 text-black dark:text-white"
          >
            Team Members
          </Text>
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <Text as="p" className="font-pixel text-black dark:text-white mb-3">
              {(project.members_count || 1) === 1
                ? "You are the only member"
                : `${project.members_count} members in this project`}
            </Text>
            <Button variant="outline" onClick={onSwitchToTeam} size="sm">
              Manage Team
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
