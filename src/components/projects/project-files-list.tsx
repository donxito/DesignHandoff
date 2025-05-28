"use client";

import { useState } from "react";
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
//import { FileCategory } from "@/lib/types/fileCategory";
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
  FolderPlus,
  Tag,
} from "lucide-react";
import Image from "next/image";

interface ProjectFilesListProps {
  projectId: string;
}

export function ProjectFilesList({ projectId }: ProjectFilesListProps) {
  const [selectedFile, setSelectedFile] = useState<DesignFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");

  const { toast } = useToast();
  const { data: files, isLoading, error, refetch } = useDesignFiles(projectId);
  const { data: categories = [] } = useFileCategories(projectId);
  const deleteFileMutation = useDeleteDesignFile();
  const assignCategoryMutation = useAssignFileToCategory();

  // * Filter files based on search and category
  const filteredFiles =
    files?.filter((file) => {
      const matchesSearch = file.file_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategoryFilter === "all" ||
        (selectedCategoryFilter === "uncategorized" && !file.category_id) ||
        file.category_id === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    }) || [];

  // * Group files by category for display
  const filesByCategory = filteredFiles.reduce(
    (acc, file) => {
      const categoryId = file.category_id || "uncategorized";
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(file);
      return acc;
    },
    {} as Record<string, DesignFile[]>
  );

  // * Handle file preview
  const handlePreviewFile = (file: DesignFile) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };

  // * Handle file download
  const handleDownloadFile = async (file: DesignFile) => {
    try {
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

  // * Handle category assignment
  const handleAssignCategory = (file: DesignFile) => {
    setSelectedFile(file);
    setIsCategoryDialogOpen(true);
  };

  const handleCategoryAssignment = async (categoryId: string | null) => {
    if (!selectedFile) return;

    try {
      await assignCategoryMutation.mutateAsync({
        fileId: selectedFile.id,
        categoryId,
        projectId,
      });

      const categoryName = categoryId
        ? categories.find((c) => c.id === categoryId)?.name
        : "Uncategorized";

      toast({
        message: "Category updated",
        description: `${selectedFile.file_name} moved to ${categoryName}`,
        variant: "success",
      });

      setIsCategoryDialogOpen(false);
      setSelectedFile(null);
    } catch (error: unknown) {
      console.error("Category assignment error:", error);
      toast({
        message: "Assignment failed",
        description: "There was an error updating the file category.",
        variant: "error",
      });
    }
  };

  // * Handle file deletion
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
        description: "There was an error deleting the file. Please try again.",
        variant: "error",
      });
    }
  };

  // * Get file type badge
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

  // * Get category info for a file
  const getCategoryInfo = (file: DesignFile) => {
    if (!file.category_id) return null;
    return categories.find((c) => c.id === file.category_id);
  };

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
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </Text>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card className="p-4 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        <div className="flex flex-col md:flex-row gap-4">
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
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border-3 border-black dark:border-white rounded-md font-pixel text-black dark:text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]"
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

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <Text
            as="span"
            className="font-pixel text-gray-600 dark:text-gray-300"
          >
            {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}{" "}
            found
          </Text>
          {searchTerm && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="text-sm font-pixel"
            >
              Clear search
            </Button>
          )}
        </div>
      </Card>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <Card className="p-6 text-center border-dashed border-gray-300 dark:border-gray-700">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <FileImage className="w-8 h-8 text-gray-400" />
            </div>
            <Text
              as="h3"
              className="text-xl font-semibold mb-2 font-pixel text-black dark:text-white"
            >
              {searchTerm
                ? "No files match your search"
                : "No Design Files Yet"}
            </Text>
            <Text
              as="p"
              className="mb-6 font-pixel text-gray-600 dark:text-gray-300"
            >
              {searchTerm
                ? "Try adjusting your search terms or category filter"
                : "Upload your first design file to get started"}
            </Text>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(filesByCategory).map(
            ([categoryId, categoryFiles]) => {
              const category =
                categoryId === "uncategorized"
                  ? null
                  : categories.find((c) => c.id === categoryId);

              return (
                <Card
                  key={categoryId}
                  className="p-4 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
                    {category ? (
                      <>
                        <div
                          className="w-4 h-4 rounded-full border-2 border-black dark:border-white"
                          style={{ backgroundColor: category.color || "" }}
                        />
                        <Text
                          as="h4"
                          className="text-lg font-bold font-pixel text-black dark:text-white"
                        >
                          {category.name}
                        </Text>
                      </>
                    ) : (
                      <>
                        <FolderPlus className="h-4 w-4 text-gray-400" />
                        <Text
                          as="h4"
                          className="text-lg font-bold font-pixel text-gray-600 dark:text-gray-300"
                        >
                          Uncategorized
                        </Text>
                      </>
                    )}
                    <Badge variant="secondary" size="sm">
                      {categoryFiles.length} file
                      {categoryFiles.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {/* Files in Category */}
                  <div className="space-y-3">
                    {categoryFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                            <FileImage className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <Text
                              as="h5"
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
                                  formatDistanceToNow(
                                    new Date(file.created_at),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                              </Text>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignCategory(file)}
                            title="Change Category"
                            className="border-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Tag className="h-4 w-4" />
                          </Button>
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
                    ))}
                  </div>
                </Card>
              );
            }
          )}
        </div>
      )}

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

      {/* Category Assignment Dialog */}
      {selectedFile && isCategoryDialogOpen && (
        <Dialog
          defaultOpen={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
        >
          <DialogContent className="rounded-lg">
            <DialogHeader>
              <Text
                as="h2"
                className="text-xl font-bold font-pixel text-black dark:text-white"
              >
                Assign Category
              </Text>
              <Text
                as="p"
                className="text-sm font-pixel text-black dark:text-white"
              >
                Choose a category for &quot;{selectedFile.file_name}&quot;
              </Text>
            </DialogHeader>

            <div className="space-y-3">
              {/* Uncategorized Option */}
              <button
                onClick={() => handleCategoryAssignment(null)}
                className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                  !selectedFile.category_id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderPlus className="h-4 w-4 text-gray-400" />
                  <Text
                    as="span"
                    className="font-pixel text-black dark:text-white"
                  >
                    Uncategorized
                  </Text>
                </div>
              </button>

              {/* Category Options */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryAssignment(category.id)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    selectedFile.category_id === category.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-black dark:border-white"
                      style={{ backgroundColor: category.color || "" }}
                    />
                    <div>
                      <Text
                        as="span"
                        className="font-bold font-pixel text-black dark:text-white"
                      >
                        {category.name}
                      </Text>
                      {category.description && (
                        <Text
                          as="p"
                          className="text-sm text-gray-600 dark:text-gray-300"
                        >
                          {category.description}
                        </Text>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Cancel
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
                Are you sure you want to delete &quot;{selectedFile.file_name}
                &quot;? This action cannot be undone.
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
