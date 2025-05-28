// src/components/projects/sections/ProjectFilesSection.tsx
import { useState } from "react";
import { CategoryManager } from "@/components/files/category-manager";
import { ProjectFilesList } from "@/components/projects/project-files-list";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/retroui/Tabs";
import { Badge } from "@/components/retroui/Badge";
import { useFileCategories } from "@/hooks/use-file-categories-query";
import { useDesignFiles } from "@/hooks/use-design-files-query";
import { FolderPlus, Files } from "lucide-react";

interface ProjectFilesSectionProps {
  projectId: string;
}

export function ProjectFilesSection({ projectId }: ProjectFilesSectionProps) {
  const [activeTab, setActiveTab] = useState("files");
  const { data: categories = [] } = useFileCategories(projectId);
  const { data: files = [] } = useDesignFiles(projectId);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Files className="h-4 w-4" />
            Files
            {files.length > 0 && (
              <Badge variant="primary" className="ml-2">
                {files.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4" />
            Categories
            {categories.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {categories.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6">
          <ProjectFilesList projectId={projectId} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoryManager projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
