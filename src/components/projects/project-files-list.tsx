"use client";

import { useState, useEffect } from "react";
import {
  useDesignFiles,
  useDeleteDesignFile,
} from "@/hooks/use-design-files-query";
import {
  useFileCategories,
  useAssignFileToCategory,
} from "@/hooks/use-file-categories-query";
import { useToast } from "@/hooks/use-toast";
import { DesignFile } from "@/lib/types/designFile";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Input } from "@/components/retroui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/retroui/Dialog";
import { formatDistanceToNow } from "date-fns";
import {
  FileImage,
  Download,
  Eye,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Tag,
  Ruler,
  Type,
  Palette,
  Printer,
} from "lucide-react";
import Image from "next/image";
import DesignSpecViewer from "./design-spec-viewer";
import { BatchPDFExport } from "./batch-pdf-export";

interface ProjectFilesListProps {
  projectId: string;
  projectName?: string;
}

export function ProjectFilesList({
  projectId,
  projectName,
}: ProjectFilesListProps) {
  const [selectedFile, setSelectedFile] = useState<DesignFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [isSpecViewerOpen, setIsSpecViewerOpen] = useState(false);
  const [isBatchExportOpen, setIsBatchExportOpen] = useState(false);

  const { toast } = useToast();
  const { data: files, isLoading, error, refetch } = useDesignFiles(projectId);
  const { data: categories = [] } = useFileCategories(projectId);
  const deleteFileMutation = useDeleteDesignFile();
  const assignCategoryMutation = useAssignFileToCategory();

  // * Clean up spec viewer state on unmount
  useEffect(() => {
    if (!isPreviewOpen) {
      setIsSpecViewerOpen(false);
    }
  }, [isPreviewOpen]);

  // * Filter files based on search and category
  const filteredFiles = files?.filter((file) => {
    const matchesSearch = file.file_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" ||
      (selectedCategoryFilter === "uncategorized" && !file.category_id) ||
      file.category_id === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // * Check if file is an image
  const isImageFile = (file: DesignFile): boolean => {
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    const fileName = file.file_name.toLowerCase();
    return (
      imageExtensions.some((ext) => fileName.endsWith(ext)) ||
      file.file_type?.startsWith("image/")
    );
  };

  // * Get image files for batch export
  const imageFiles = filteredFiles?.filter((file) => isImageFile(file)) || [];

  // * Get category info for a file
  const getCategoryInfo = (file: DesignFile) => {
    return categories.find((cat) => cat.id === file.category_id);
  };

  // * Handle file download
  const handleDownloadFile = async (file: DesignFile) => {
    try {
      const response = await fetch(file.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        message: "Download started",
        description: `Downloading ${file.file_name}`,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        message: "Download failed",
        description: "Unable to download file",
        variant: "error",
      });
    }
  };

  // * Handle file deletion
  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    try {
      await deleteFileMutation.mutateAsync({
        id: selectedFile.id,
        file_url: selectedFile.file_url,
        projectId: projectId,
      });
      setIsDeleteDialogOpen(false);
      setSelectedFile(null);
      await refetch();

      toast({
        message: "File deleted",
        description: `${selectedFile.file_name} has been deleted`,
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        message: "Delete failed",
        description: "Unable to delete file",
        variant: "error",
      });
    }
  };

  // * Handle category assignment
  const handleAssignCategory = async (categoryId: string) => {
    if (!selectedFile) return;

    try {
      await assignCategoryMutation.mutateAsync({
        fileId: selectedFile.id,
        categoryId: categoryId === "none" ? null : categoryId,
        projectId: projectId,
      });
      setIsCategoryDialogOpen(false);
      await refetch();

      const categoryName =
        categoryId === "none"
          ? "Uncategorized"
          : categories.find((cat) => cat.id === categoryId)?.name || "Unknown";

      toast({
        message: "Category updated",
        description: `${selectedFile.file_name} moved to ${categoryName}`,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        message: "Category update failed",
        description: "Unable to update file category",
        variant: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <Text>Loading files...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Text className="text-red-500 mb-4">Error loading files</Text>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 border-2 border-black dark:border-white rounded-none bg-white dark:bg-gray-800 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="uncategorized">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          {filteredFiles && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredFiles.length} of {files?.length || 0} files
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBatchExportOpen(true)}
            disabled={imageFiles.length === 0}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Batch PDF Export ({imageFiles.length})
          </Button>
        </div>
      </Card>

      {/* Files Grid */}
      {filteredFiles && filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className="p-4 hover:shadow-lg transition-shadow"
            >
              {/* File Preview */}
              <div className="aspect-square relative mb-3 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-black dark:border-white">
                {isImageFile(file) ? (
                  <Image
                    src={file.file_url}
                    alt={file.file_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileImage className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="space-y-2">
                <div>
                  <Text
                    className="font-medium text-sm truncate"
                    title={file.file_name}
                  >
                    {file.file_name}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(file.created_at || ""), {
                      addSuffix: true,
                    })}
                  </Text>
                </div>

                {/* Category Badge */}
                {getCategoryInfo(file) && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-black dark:border-white"
                      style={{
                        backgroundColor: getCategoryInfo(file)?.color || "",
                      }}
                    />
                    <Badge variant="secondary" size="sm">
                      {getCategoryInfo(file)?.name}
                    </Badge>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(file);
                      setIsPreviewOpen(true);
                    }}
                    title="Preview file"
                    className="flex-1 gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>

                  {/* Design Specs Button for images */}
                  {isImageFile(file) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(file);
                        setIsSpecViewerOpen(true);
                        setIsPreviewOpen(true);
                      }}
                      title="Design specifications"
                      className="gap-1"
                    >
                      <Ruler className="h-3 w-3" />
                      Specs
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadFile(file)}
                    title="Download"
                    className="gap-1"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(file);
                      setIsCategoryDialogOpen(true);
                    }}
                    title="Change category"
                    className="flex-1 gap-1 text-xs"
                  >
                    <Tag className="h-3 w-3" />
                    Category
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(file);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="gap-1 text-xs text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <Text className="text-lg font-medium mb-2">No files found</Text>
          <Text className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || selectedCategoryFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Upload design files to get started with specifications"}
          </Text>
          {(searchTerm || selectedCategoryFilter !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      )}

      {/* File Preview Dialog */}
      {selectedFile && isPreviewOpen && (
        <Dialog defaultOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-6xl h-[80vh] rounded-lg flex flex-col">
            {/* Show Enhanced Design Spec Viewer for images when spec mode is active */}
            {isImageFile(selectedFile) && isSpecViewerOpen ? (
              <DesignSpecViewer
                imageUrl={selectedFile.file_url}
                imageName={selectedFile.file_name}
                projectName={projectName}
                onClose={() => setIsSpecViewerOpen(false)}
              />
            ) : (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text
                        as="h2"
                        className="text-xl font-bold font-pixel text-black dark:text-white"
                      >
                        {selectedFile.file_name}
                      </Text>
                      {getCategoryInfo(selectedFile) && (
                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className="w-3 h-3 rounded-full border border-black dark:border-white"
                            style={{
                              backgroundColor:
                                getCategoryInfo(selectedFile)?.color || "",
                            }}
                          />
                          <Badge variant="secondary" size="sm">
                            {getCategoryInfo(selectedFile)?.name}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Design Specs Button for images */}
                    {isImageFile(selectedFile) && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsSpecViewerOpen(true)}
                          className="gap-2"
                        >
                          <Ruler className="h-4 w-4" />
                          <Type className="h-4 w-4" />
                          <Palette className="h-4 w-4" />
                          Design Specs
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogHeader>

                <div className="flex-1 relative overflow-hidden rounded-lg border-3 border-black dark:border-white">
                  {isImageFile(selectedFile) ? (
                    <Image
                      src={selectedFile.file_url}
                      alt={selectedFile.file_name}
                      fill
                      className="object-contain"
                    />
                  ) : selectedFile.file_type?.includes("pdf") ||
                    selectedFile.file_name.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={selectedFile.file_url}
                      className="w-full h-full"
                      title={selectedFile.file_name}
                      sandbox="allow-same-origin allow-scripts"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <FileImage className="h-16 w-16 text-gray-400 mb-4" />
                      <Text className="text-lg font-medium mb-2">
                        Preview not available
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 mb-4">
                        This file type cannot be previewed in the browser
                      </Text>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownloadFile(selectedFile)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download File
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            window.open(selectedFile.file_url, "_blank")
                          }
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsPreviewOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedFile && isDeleteDialogOpen && (
        <Dialog
          defaultOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <Text as="h2" className="text-lg font-bold font-pixel">
                Delete File
              </Text>
            </DialogHeader>
            <div className="py-4">
              <Text>
                Are you sure you want to delete &quot;{selectedFile.file_name}
                &quot;? This action cannot be undone.
              </Text>
            </div>
            <DialogFooter>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteFile}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={deleteFileMutation.isPending}
                >
                  {deleteFileMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Category Assignment Dialog */}
      {selectedFile && isCategoryDialogOpen && (
        <Dialog
          defaultOpen={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <Text as="h2" className="text-lg font-bold font-pixel">
                Assign Category
              </Text>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Choose a category for &quot;{selectedFile.file_name}&quot;:
              </Text>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => handleAssignCategory("none")}
                  className="w-full justify-start gap-2"
                  disabled={assignCategoryMutation.isPending}
                >
                  <div className="w-4 h-4 border border-gray-400 rounded-full" />
                  Uncategorized
                </Button>

                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    onClick={() => handleAssignCategory(category.id)}
                    className="w-full justify-start gap-2"
                    disabled={assignCategoryMutation.isPending}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-black dark:border-white"
                      style={{
                        backgroundColor: category.color || "",
                      }}
                    />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
                disabled={assignCategoryMutation.isPending}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Batch PDF Export Dialog */}
      <BatchPDFExport
        isOpen={isBatchExportOpen}
        onClose={() => setIsBatchExportOpen(false)}
        imageFiles={imageFiles}
        projectName={projectName}
      />
    </div>
  );
}
