"use client";

import { useState } from "react";
import FileUploader from "@/components/files/file-uploader";

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
      <h2 className="text-xl font-semibold mb-4">Upload Design Files</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Upload your design files to share with developers. Supported formats
        include JPG, PNG, WebP, and PDF.
      </p>

      {uploadError && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-600 dark:text-red-400 font-medium">Upload Error</p>
          <p className="text-sm text-red-500 dark:text-red-300">{uploadError}</p>
        </div>
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
          <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-1 px-2 rounded">
                    {file.type.split("/")[1].toUpperCase()}
                  </span>
                </div>

                {file.type.startsWith("image/") ? (
                  <div className="relative">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-auto rounded-md mt-2 max-h-64 object-contain"
                      onError={(e) => {
                        console.error('Image failed to load:', file.url);
                        // Replace with error UI
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden flex-col items-center justify-center p-4 border border-red-200 rounded-md mt-2 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                      <p className="text-red-600 dark:text-red-400">Image preview unavailable</p>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Open image in new tab
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center mt-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500 dark:text-gray-400"
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
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
