"use client";

import { useState } from "react";
import FileUploader from "@/components/files/file-uploader";

// Import RetroUI components
import { Text } from "@/components/retroui/Text";
import { Alert } from "@/components/retroui/Alert";
import { Badge } from "@/components/retroui/Badge";
import { Card } from "@/components/retroui/Card";

export default function FileUploadDemo() {
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ url: string; name: string; type: string }>
  >([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadComplete = (url: string, file: File) => {
    // Log the URL for debugging
    console.log('File uploaded successfully:', { url, name: file.name, type: file.type });
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
    console.error('Upload error:', error);
    setUploadError(`Upload failed: ${error.message}`);
  };

  return (
    <div>
      <Text as="h2" className="text-xl font-semibold mb-4 font-pixel text-black dark:text-white text-adaptive">Upload Design Files</Text>
      <Text as="p" className="mb-6 font-pixel text-black dark:text-white text-adaptive">
        Upload your design files to share with developers. Supported formats
        include JPG, PNG, WebP, and PDF.
      </Text>

      {uploadError && (
        <Alert className="mb-6">
          <Text as="p" className="font-medium font-pixel text-black dark:text-white text-adaptive">Upload Error</Text>
          <Text as="p" className="text-sm font-pixel text-black dark:text-white text-adaptive">{uploadError}</Text>
        </Alert>
      )}

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
      />

      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <Text as="h3" className="text-lg font-medium mb-3 font-pixel text-black dark:text-white text-adaptive">Uploaded Files</Text>
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <Card
                key={index}
                className="p-4 border-2 border-neutral-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e]"
              >
                <div className="flex justify-between items-center mb-2">
                  <Text as="p" className="font-medium font-pixel m-0 text-black dark:text-white text-adaptive">{file.name}</Text>
                  <Badge variant="default" size="sm" className="text-black dark:text-white">
                    {file.type.split("/")[1].toUpperCase()}
                  </Badge>
                </div>

                {file.type.startsWith("image/") ? (
                  <div className="relative">
                    <div className="border-2 border-neutral-900 dark:border-white p-1 mt-2">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-auto max-h-64 object-contain"
                        onError={(e) => {
                          console.error('Image failed to load:', file.url);
                          // Replace with error UI
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    </div>
                    <div className="hidden flex-col items-center justify-center p-4 border-2 border-neutral-900 dark:border-white mt-2">
                      <Text as="p" className="font-pixel text-black dark:text-white text-adaptive">Image preview unavailable</Text>
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
    </div>
  );
}
