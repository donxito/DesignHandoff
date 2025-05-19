"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
// RetroUI components
import { Text } from "@/components/retroui/Text";
import { Alert } from "@/components/retroui/Alert";

type FileUploaderProps = {
  bucketName: string;
  folderPath?: string;
  allowedFileTypes?: string[];
  maxFileSize?: number; // in MB
  onUploadComplete?: (url: string, file: File) => void;
  onUploadError?: (error: Error) => void;
  disabled?: boolean;
};

export default function FileUploader({
  bucketName,
  folderPath = "",
  allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ],
  maxFileSize = 10, // Default 10MB
  onUploadComplete,
  onUploadError,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const file = fileList[0]; // Currently handling single file uploads

    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      setError(
        `File type not supported. Please upload: ${allowedFileTypes.join(", ")}`
      );
      return;
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`File size exceeds ${maxFileSize}MB limit`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate a unique filename to avoid collisions
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          //   onUploadProgress: (progress) => {
          //     const percentage = Math.round(
          //       (progress.loaded / progress.total) * 100
          //     );
          //     setUploadProgress(percentage);
          //   },
          // TODO: implement progress bar not from supabase
        });

      if (error) {
        throw error;
      }

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (onUploadComplete) {
        onUploadComplete(publicUrlData.publicUrl, file);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file. Please try again.");
      if (onUploadError && err instanceof Error) {
        onUploadError(err);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {error && <Alert className="mb-6">{error}</Alert>}

      <div
        className={`
          border-4 border-dashed p-8 text-center 
          transition-colors duration-200 ease-in-out
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]
          ${isDragging ? "border-primary bg-primary/10" : "border-neutral-900 dark:border-white"} 
          ${isUploading ? "opacity-75 cursor-not-allowed" : "cursor-pointer hover:border-primary hover:bg-primary/10"}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={isUploading ? undefined : triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept={allowedFileTypes.join(",")}
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {isUploading ? (
            <div className="space-y-2 w-full">
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-4 border-2 border-neutral-900 dark:border-white">
                <div
                  className="bg-primary h-full transition-all duration-300 ease-in-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <Text as="p" className="text-sm font-pixel text-center">
                Uploading... {uploadProgress}%
              </Text>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 border-4 border-neutral-900 dark:border-white flex items-center justify-center bg-primary">
                <span className="text-2xl font-pixel">↑</span>
              </div>
              <Text as="p" className="text-base font-pixel font-bold">
                Drag & drop or click to upload
              </Text>
              <Text as="p" className="text-sm font-pixel">
                Supported formats:{" "}
                {allowedFileTypes.map((type) => type.split("/")[1]).join(", ")}
              </Text>
              <Text as="p" className="text-sm font-pixel">
                Max size: {maxFileSize}MB
              </Text>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
