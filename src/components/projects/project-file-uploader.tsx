"use client";

import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUploadDesignFile } from "@/hooks/use-design-files-query";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { Progress } from "@/components/retroui/Progress";
import { Upload, X, FileImage, Check } from "lucide-react";

interface ProjectFileUploaderProps {
  projectId: string;
  onUploadComplete?: () => void;
}

export function ProjectFileUploader({
  projectId,
  onUploadComplete,
}: ProjectFileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const uploadFileMutation = useUploadDesignFile();

  // * Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // * Handle file selection
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  // * Validate file type and size
  const validateAndSetFile = (file: File) => {
    // Check file type (allow images, PDFs, Sketch, Figma, etc.)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "application/pdf",
      "application/zip",
      "application/vnd.sketch", // Sketch files
      "application/figma", // Figma files
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.endsWith(".sketch") &&
      !file.name.endsWith(".fig")
    ) {
      toast({
        message: "Invalid file type",
        description: "Please upload an image, PDF, Sketch, or Figma file",
        variant: "error",
      });
      return;
    }

    // Check file size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({
        message: "File too large",
        description: "Please upload a file smaller than 50MB",
        variant: "error",
      });
      return;
    }

    setSelectedFile(file);
  };

  // * Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !projectId) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      // Upload the file
      await uploadFileMutation.mutateAsync({
        file: selectedFile,
        projectId,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
      });

      // Complete the progress bar
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Show success message
      toast({
        message: "File uploaded successfully",
        description: `${selectedFile.name} has been uploaded to the project`,
        variant: "success",
      });

      // Reset state and notify parent
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
        onUploadComplete?.();
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        message: "Upload failed",
        description:
          "There was an error uploading your file. Please try again.",
        variant: "error",
      });
      setIsUploading(false);
    }
  };

  // * Handle file removal
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
      <Text
        as="h3"
        className="text-xl font-bold font-pixel mb-4 text-black dark:text-white"
      >
        Upload Design Files
      </Text>

      {!selectedFile ? (
        <div
          className={`border-3 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
              : "border-gray-300 dark:border-gray-700"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleFileDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <Text as="p" className="font-pixel text-black dark:text-white">
                <span className="font-bold">Click to upload</span> or drag and
                drop
              </Text>
              <Text
                as="p"
                className="text-sm text-gray-500 dark:text-gray-400 font-pixel"
              >
                SVG, PNG, JPG, GIF, PDF, Sketch or Figma files (max 50MB)
              </Text>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Select File
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.sketch,.fig"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border-3 rounded-lg border-gray-300 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                <FileImage className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <Text
                  as="p"
                  className="font-medium truncate font-pixel text-black dark:text-white"
                >
                  {selectedFile.name}
                </Text>
                <Text
                  as="p"
                  className="text-sm text-gray-500 dark:text-gray-400 font-pixel"
                >
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </div>
            </div>
            {!isUploading && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Text
                  as="p"
                  className="text-sm font-medium font-pixel text-black dark:text-white"
                >
                  Uploading...
                </Text>
                <Text
                  as="p"
                  className="text-sm font-medium font-pixel text-black dark:text-white"
                >
                  {Math.round(uploadProgress)}%
                </Text>
              </div>
              <Progress value={uploadProgress} max={100} />
            </div>
          ) : uploadProgress === 100 ? (
            <div className="flex items-center space-x-2 text-green-500">
              <Check className="h-5 w-5" />
              <Text as="p" className="font-medium font-pixel">
                Upload complete!
              </Text>
            </div>
          ) : (
            <Button variant="primary" onClick={handleUpload} className="w-full">
              Upload File
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
