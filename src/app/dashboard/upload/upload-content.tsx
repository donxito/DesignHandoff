"use client";

import { User } from "@supabase/supabase-js";
import Header from "@/components/layout/header";
import FileUploadDemo from "./file-upload-demo";

type UploadContentProps = {
  user?: User;
};

/**
 * Upload content component that displays the file upload UI
 * Can receive user from server-side or get it from client-side auth context
 */
export default function UploadContent({ user }: UploadContentProps = {}) {
  return (
    <div>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Upload Files</h1>
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <FileUploadDemo />
        </div>
      </main>
    </div>
  );
}
