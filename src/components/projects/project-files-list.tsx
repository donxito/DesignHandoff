"use client";

import { useState } from "react";
import {
  useDesignFiles,
  useDeleteDesignFile,
} from "@/hooks/use-design-files-query";
import { useToast } from "@/hooks/use-toast";
import { DesignFile } from "@/lib/types/designFile";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/retroui/Dialog";
import { formatDistanceToNow } from "date-fns";
import { FileImage, Download, Eye, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";

interface ProjectFilesListProps {
  projectId: string;
}

export function ProjectFilesList({ projectId }: ProjectFilesListProps) {
  const { data: files, isLoading, error, refetch } = useDesignFiles(projectId);
  const [selectedFile, setSelectedFile] = useState<DesignFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // * Handle file preview
  const handlePreviewFile = (file: DesignFile) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };

  // * Handle file download
  const handleDownloadFile = async (file: DesignFile) => {
    try {
      // Create a download link
      const link = document.createElement("a");
      link.href = file.file_url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        message: "Download started",
        description: `Downloading ${file.file_name}`,
        variant: "success",
      });
    } catch (error: unknown) {
      console.error("Download error:", error);
      toast({
        message: "Download failed",
        description:
          "There was an error downloading the file. Please try again.",
        variant: "error",
      });
    }
  };

  // * Handle file deletion confirmation
  const deleteFileMutation = useDeleteDesignFile();

  const handleDeleteConfirm = async () => {
    if (!selectedFile) return;
    try {
      await deleteFileMutation.mutateAsync({
        id: selectedFile.id,
        file_url: selectedFile.file_url,
        projectId: selectedFile.project_id,
      });
      toast({
        message: "File deleted",
        description: `${selectedFile.file_name} has been deleted successfully.`,
        variant: "success",
      });
      setIsDeleteDialogOpen(false);
      setSelectedFile(null);
    } catch (error: unknown) {
      console.error("Delete error:", error);
      toast({
        message: "Delete failed",
        description:
          (error instanceof Error ? error.message : 'An unknown error occurred') ||
          "There was an error deleting the file. Please try again.",
        variant: "error",
      });
    }
  };

  // * Determine file type badge
  const getFileTypeBadge = (file: DesignFile) => {
    const fileType = file.file_type?.toLowerCase() || "";
    const fileName = file.file_name.toLowerCase();

    if (
      fileType.includes("image") ||
      /\.(jpg|jpeg|png|gif|svg)$/i.test(fileName)
    ) {
      return <Badge variant="primary">Image</Badge>;
    } else if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
      return <Badge variant="secondary">PDF</Badge>;
    } else if (fileType.includes("sketch") || fileName.endsWith(".sketch")) {
      return <Badge variant="outline">Sketch</Badge>;
    } else if (fileType.includes("figma") || fileName.endsWith(".fig")) {
      return <Badge variant="outline">Figma</Badge>;
    } else {
      return <Badge variant="outline">File</Badge>;
    }
  };

  // * Check if file is previewable
  const isPreviewable = (file: DesignFile) => {
    const fileType = file.file_type?.toLowerCase() || "";
    const fileName = file.file_name.toLowerCase();

    return (
      fileType.includes("image") ||
      /\.(jpg|jpeg|png|gif|svg)$/i.test(fileName) ||
      fileType.includes("pdf") ||
      fileName.endsWith(".pdf")
    );
  };

  // * Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  // * Error state
  if (error) {
    return (
      <Card className="p-6 bg-red-50 dark:bg-red-900/30 border-red-500">
        <Text
          as="h3"
          className="text-lg font-semibold text-red-700 dark:text-red-300"
        >
          Error Loading Files
        </Text>
        <Text as="p" className="text-red-600 dark:text-red-400">
          {(error instanceof Error ? error.message : 'An unknown error occurred') || ""}
        </Text>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  // * Empty state
  if (!files || files.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed">
        <Text as="h3" className="text-xl font-semibold mb-2 font-pixel">
          No Design Files Yet
        </Text>
        <Text as="p" className="mb-6 font-pixel">
          Upload design files to get started.
        </Text>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <Card
          key={file.id}
          className="p-4 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                <FileImage className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <Text
                  as="h4"
                  className="font-bold font-pixel text-black dark:text-white"
                >
                  {file.file_name}
                </Text>
                <div className="flex items-center space-x-2 mt-1">
                  {getFileTypeBadge(file)}
                  <Text
                    as="span"
                    className="text-xs text-gray-500 dark:text-gray-400 font-pixel"
                  >
                    {file.created_at &&
                      formatDistanceToNow(new Date(file.created_at), {
                        addSuffix: true,
                      })}
                  </Text>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {isPreviewable(file) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewFile(file)}
                  title="Preview"
                  className="border-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadFile(file)}
                title="Download"
                className="border-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFile(file);
                  setIsDeleteDialogOpen(true);
                }}
                className="border-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {/* File Preview Dialog */}
      {selectedFile && isPreviewOpen && (
        <Dialog defaultOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl rounded-lg">
            <DialogHeader>
              <Text
                as="h2"
                className="text-xl font-bold font-pixel text-black dark:text-white"
              >
                {selectedFile.file_name}
              </Text>
            </DialogHeader>

            <div className="relative overflow-hidden rounded-lg border-3 border-black dark:border-white h-[60vh]">
              {selectedFile.file_type?.includes("image") ||
              /\.(jpg|jpeg|png|gif|svg)$/i.test(
                selectedFile.file_name.toLowerCase()
              ) ? (
                <Image
                  src={selectedFile.file_url}
                  alt={selectedFile.file_name}
                  fill
                  className="object-contain"
                />
              ) : selectedFile.file_type?.includes("pdf") ||
                selectedFile.file_name.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`${selectedFile.file_url}#toolbar=0`}
                  className="w-full h-full"
                  title={selectedFile.file_name}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Text
                    as="p"
                    className="text-center font-pixel text-black dark:text-white"
                  >
                    Preview not available for this file type
                  </Text>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownloadFile(selectedFile)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="primary"
                onClick={() => window.open(selectedFile.file_url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full Size
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedFile && isDeleteDialogOpen && (
        <Dialog
          defaultOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <DialogContent className="rounded-lg">
            <DialogHeader>
              <Text
                as="h2"
                className="text-xl font-bold font-pixel text-black dark:text-white"
              >
                Delete File
              </Text>
              <Text
                as="p"
                className="text-sm font-pixel text-black dark:text-white"
              >
                Are you sure you want to delete &quot;{selectedFile.file_name}&quot;? This action cannot be undone.
              </Text>
            </DialogHeader>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteConfirm}
              >
                Delete File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
