"use client";

import { useState } from "react";
import FileUploader from "@/components/files/file-uploader";
import Image from "next/image";
import { useUploadDesignFile } from "@/hooks/use-design-files-query";
import { ProjectSelector } from "@/components/projects/project-selector";
import { Project } from "@/lib/types/project";
// RetroUI components
import { Text } from "@/components/retroui/Text";
import { Alert } from "@/components/retroui/Alert";
import { Badge } from "@/components/retroui/Badge";
import { Card } from "@/components/retroui/Card";

export default function FileUploadDemo() {
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ url: string; name: string; type: string }>
  >([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  // * Mutation for uploading a design file
  const uploadFileMutation = useUploadDesignFile();

  const handleUploadComplete = (url: string, file: File) => {
    // ! Log the URL for debugging
    console.log("File uploaded successfully:", {
      url,
      name: file.name,
      type: file.type,
    });

    setUploadError(null);

    setUploadedFiles((prev) => [
      ...prev,
      {
        url,
        name: file.name,
        type: file.type,
      },
    ]);
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    setUploadError(`Upload failed: ${error.message}`);
  };

  // ! Demo Function - Using the selected project
  const handleUploadFile = async (
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    try {
      if (!selectedProject) {
        throw new Error("Please select a project first");
      }

      const result = await uploadFileMutation.mutateAsync({
        projectId: selectedProject.id,
        file,
        name: file.name,
        onProgress,
      });

      handleUploadComplete(result.file_url, file);
      return result;
    } catch (error) {
      handleUploadError(error as Error);
      throw error;
    }
  };

  return (
    <>
      <Text
        as="h2"
        className="text-xl font-semibold mb-4 font-pixel text-black dark:text-white text-adaptive"
      >
        Upload Design Files
      </Text>
      <Text
        as="p"
        className="mb-6 font-pixel text-black dark:text-white text-adaptive"
      >
        Upload your design files to share with developers. Supported formats
        include JPG, PNG, WebP, and PDF.
      </Text>

      {/* Project Selector */}
      <div className="mb-6">
        <ProjectSelector
          onSelect={(project) => setSelectedProject(project)}
          selectedId={selectedProject?.id}
          label="Select Project for Upload"
        />
      </div>

      {/* Error Handling */}
      {!selectedProject && (
        <Alert className="mb-6">
          <Text
            as="p"
            className="font-medium font-pixel text-black dark:text-white text-adaptive"
          >
            Please select a project before uploading files
          </Text>
        </Alert>
      )}

      {/* Upload Error */}
      {uploadError && (
        <Alert className="mb-6">
          <Text
            as="p"
            className="font-medium font-pixel text-black dark:text-white text-adaptive"
          >
            Upload Error
          </Text>
          <Text
            as="p"
            className="text-sm font-pixel text-black dark:text-white text-adaptive"
          >
            {uploadError}
          </Text>
        </Alert>
      )}

      {/* Upload Error */}
      {uploadFileMutation.isError && (
        <Alert className="mb-6">
          <Text
            as="p"
            className="font-medium font-pixel text-black dark:text-white text-adaptive"
          >
            Upload Error
          </Text>
          <Text
            as="p"
            className="text-sm font-pixel text-black dark:text-white text-adaptive"
          >
            {uploadFileMutation.error instanceof Error
              ? uploadFileMutation.error.message
              : "An unknown error occurred"}
          </Text>
        </Alert>
      )}

      {/* File Uploader */}
      <FileUploader
        bucketName="design-files"
        folderPath="uploads"
        allowedFileTypes={[
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/pdf",
        ]}
        maxFileSize={10}
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        disabled={!selectedProject}
      />

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <Text
            as="h3"
            className="text-lg font-medium mb-3 font-pixel text-black dark:text-white text-adaptive"
          >
            Uploaded Files
          </Text>
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <Card
                key={index}
                className="p-4 border-2 border-neutral-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e]"
              >
                <div className="flex justify-between items-center mb-2">
                  <Text
                    as="p"
                    className="font-medium font-pixel m-0 text-black dark:text-white text-adaptive"
                  >
                    {file.name}
                  </Text>
                  <Badge
                    variant="default"
                    size="sm"
                    className="text-black dark:text-white"
                  >
                    {file.type.split("/")[1].toUpperCase()}
                  </Badge>
                </div>

                {/* Image Preview */}
                {file.type.startsWith("image/") ? (
                  <div className="relative">
                    <div className="border-2 border-neutral-900 dark:border-white p-1 mt-2">
                      <div className="relative w-full h-64">
                        <Image
                          src={file.url}
                          alt={file.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain"
                          onError={(e) => {
                            console.error("Image failed to load:", file.url);
                            // Replace with error UI
                            (e.target as HTMLImageElement).onerror = null;
                            (e.target as HTMLImageElement).src =
                              "/file-placeholder.png";
                          }}
                        />
                      </div>
                    </div>
                    <div className="hidden flex-col items-center justify-center p-4 border-2 border-neutral-900 dark:border-white mt-2">
                      <Text
                        as="p"
                        className="font-pixel text-black dark:text-white text-adaptive"
                      >
                        Image preview unavailable
                      </Text>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-primary hover:underline font-pixel"
                      >
                        Open image in new tab
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center mt-2 p-2 border-2 border-neutral-900 dark:border-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-neutral-900 dark:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline font-pixel"
                    >
                      View Document
                    </a>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
