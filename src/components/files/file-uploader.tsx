"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

type FileUploaderProps = {
  bucketName: string;
  folderPath?: string;
  allowedFileTypes?: string[];
  maxFileSize?: number; // in MB
  onUploadComplete?: (url: string, file: File) => void;
  onUploadError?: (error: Error) => void;
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

      const { data, error } = await supabase.storage
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
      {error && (
        <div className="mb-4 p-3 text-sm rounded-md bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center 
          transition-colors duration-200 ease-in-out
          ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700"} 
          ${isUploading ? "opacity-75 cursor-not-allowed" : "cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"}
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

        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm font-medium">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supported formats:{" "}
                {allowedFileTypes.map((type) => type.split("/")[1]).join(", ")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Max size: {maxFileSize}MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
