"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useProject } from "@/hooks/use-project-query";
import { useToast } from "@/hooks/use-toast";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/retroui/Tabs";
import { Badge } from "@/components/retroui/Badge";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  FileImage,
  Calendar,
  ArrowLeft,
  Pencil,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
// modular section components
import {
  ProjectOverviewSection,
  ProjectFilesSection,
  ProjectUploadSection,
  ProjectTeamSection,
  ProjectCommentsSection,
} from "@/components/projects/sections";
import { ProjectDetailsSkeleton } from "@/components/retroui/skeletons";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { data: project, isLoading, error } = useProject(projectId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // * Handle file upload completion
  const handleFileUploadComplete = () => {
    toast({
      message: "File uploaded",
      description: "Your design file has been uploaded successfully",
      variant: "success",
    });

    // Switch to the files tab to show the newly uploaded file
    setActiveTab("files");
  };

  // * Handle tab switching from overview quick actions
  const handleSwitchToFiles = () => setActiveTab("files");
  const handleSwitchToUpload = () => setActiveTab("upload");
  const handleSwitchToTeam = () => setActiveTab("team");
  //const handleSwitchToComments = () => setActiveTab("comments");

  // * Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Loading Project...">
        <ProjectDetailsSkeleton />
      </DashboardLayout>
    );
  }

  // * Error state
  if (error || !project) {
    return (
      <DashboardLayout title="Project Details">
        <Card className="p-6 bg-red-50 dark:bg-red-900/30 border-red-500">
          <Text
            as="h3"
            className="text-lg font-semibold text-red-700 dark:text-red-300"
          >
            Error Loading Project
          </Text>
          <Text as="p" className="text-red-600 dark:text-red-400">
            {error?.message || "Project not found"}
          </Text>
          <Link href="/dashboard/projects">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={project.name}>
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/projects">
              <Button
                variant="outline"
                size="sm"
                className="mr-2 border-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Text
              as="h1"
              className="text-3xl font-bold font-pixel text-black dark:text-white"
            >
              {project.name}
            </Text>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Project
          </Button>
        </div>

        <Text
          as="p"
          className="text-gray-600 dark:text-gray-300 mb-6 font-pixel"
        >
          {project.description || "No description provided"}
        </Text>

        <div className="flex flex-wrap gap-4 mb-6">
          <Card className="p-3 flex items-center gap-2 border-3 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]">
            <Calendar className="h-5 w-5 text-gray-500" />
            <Text as="span" className="font-pixel text-black dark:text-white">
              Created{" "}
              {project.created_at
                ? formatDistanceToNow(new Date(project.created_at), {
                    addSuffix: true,
                  })
                : "recently"}
            </Text>
          </Card>

          <Card className="p-3 flex items-center gap-2 border-3 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]">
            <FileImage className="h-5 w-5 text-gray-500" />
            <Text as="span" className="font-pixel text-black dark:text-white">
              {project.files_count || 0} Design Files
            </Text>
          </Card>

          <Card className="p-3 flex items-center gap-2 border-3 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]">
            <Users className="h-5 w-5 text-gray-500" />
            <Text as="span" className="font-pixel text-black dark:text-white">
              {project.members_count || 1} Team Members
            </Text>
          </Card>

          <Card className="p-3 flex items-center gap-2 border-3 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <Text as="span" className="font-pixel text-black dark:text-white">
              Comments & Feedback
            </Text>
          </Card>
        </div>
      </div>

      {/* Project Content Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">
            Files
            {project.files_count ? (
              <Badge variant="primary" className="ml-2">
                {project.files_count}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectOverviewSection
            project={project}
            onSwitchToFiles={handleSwitchToFiles}
            onSwitchToUpload={handleSwitchToUpload}
            onSwitchToTeam={handleSwitchToTeam}
          />
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <ProjectFilesSection projectId={projectId} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <ProjectUploadSection
            projectId={projectId}
            onUploadComplete={handleFileUploadComplete}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <ProjectTeamSection project={project} />
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <ProjectCommentsSection project={project} />
        </TabsContent>
      </Tabs>

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <EditProjectModal
          project={project}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
