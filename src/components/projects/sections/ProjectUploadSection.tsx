import { ProjectFileUploader } from "@/components/projects/project-file-uploader";

interface ProjectUploadSectionProps {
  projectId: string;
  onUploadComplete?: () => void;
}

export function ProjectUploadSection({
  projectId,
  onUploadComplete,
}: ProjectUploadSectionProps) {
  return (
    <div className="space-y-6">
      <ProjectFileUploader
        projectId={projectId}
        onUploadComplete={onUploadComplete}
      />
    </div>
  );
}
