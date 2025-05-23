import { ProjectFilesList } from "@/components/projects/project-files-list";

interface ProjectFilesSectionProps {
  projectId: string;
}

export function ProjectFilesSection({ projectId }: ProjectFilesSectionProps) {
  return (
    <div className="space-y-6">
      <ProjectFilesList projectId={projectId} />
    </div>
  );
}
